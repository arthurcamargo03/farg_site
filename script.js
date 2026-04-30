// Year
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const currentYearElement = document.querySelector('#ano-atual');
if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
}

// Hero rotating service word
const rotatingWordElement = document.querySelector('[data-rotating-word]');
if (rotatingWordElement) {
  const words = (rotatingWordElement.getAttribute('data-words') || '')
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);

  let activeWordIndex = Math.max(0, words.indexOf(rotatingWordElement.textContent.trim()));

  if (words.length > 1) {
    window.setInterval(() => {
      activeWordIndex = (activeWordIndex + 1) % words.length;
      rotatingWordElement.classList.add('is-changing');

      window.setTimeout(
        () => {
          rotatingWordElement.textContent = words[activeWordIndex];
          rotatingWordElement.classList.remove('is-changing');
        },
        reduceMotionQuery.matches ? 0 : 180
      );
    }, 1800);
  }
}

// Scroll-in animations
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-up').forEach((el) => fadeObserver.observe(el));

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.site-nav__link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove('is-active'));
        const active = document.querySelector(`.site-nav__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('is-active');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => sectionObserver.observe(section));

// Hamburger menu
const hamburger = document.querySelector('.nav-hamburger');
const navCollapse = document.querySelector('.nav-collapse');

if (hamburger && navCollapse) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    navCollapse.classList.toggle('is-open', !isOpen);
  });

  navCollapse.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navCollapse.classList.remove('is-open');
    });
  });
}

// Stagger delay on grouped cards
const staggerGroups = document.querySelectorAll(
  '.services-grid, .team-grid, .timeline, .audience-grid, .testimonials-grid, .differential-list'
);
staggerGroups.forEach((group) => {
  const items = group.querySelectorAll(':scope > .fade-up');
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.1, 0.6)}s`;
  });
});

// Hero scroll counter
const counterEls = document.querySelectorAll('[data-counter-target]');
const animateCounter = (el) => {
  const target = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.floor(eased * target));
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = String(target);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

counterEls.forEach((el) => counterObserver.observe(el));

// Sticky nav scrolled state
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Showcase hover selection
document.querySelectorAll('[data-site-showcase]').forEach((showcase) => {
  const topics = Array.from(showcase.querySelectorAll('[data-site-topic]'));
  const previews = Array.from(showcase.querySelectorAll('[data-site-preview]'));
  const topicList = showcase.querySelector('[data-topic-list]');
  const topicPrev = showcase.querySelector('[data-topic-prev]');
  const topicNext = showcase.querySelector('[data-topic-next]');
  const showcaseOrb = showcase.querySelector('[data-showcase-orb]');
  let activeIndex = Math.max(0, topics.findIndex((topic) => topic.classList.contains('is-active')));

  const setActiveSite = (nextIndex, options = {}) => {
    if (!topics[nextIndex]) return;
    const didChange = nextIndex !== activeIndex;
    activeIndex = nextIndex;

    topics.forEach((topic, index) => {
      const isActive = index === activeIndex;
      topic.classList.toggle('is-active', isActive);
      topic.setAttribute('aria-selected', String(isActive));
      topic.tabIndex = isActive ? 0 : -1;
    });

    previews.forEach((preview, index) => {
      const isActive = index === activeIndex;
      preview.classList.toggle('is-active', isActive);
      preview.setAttribute('aria-hidden', String(!isActive));
      preview.inert = !isActive;

      if (isActive && (didChange || options.resetProjects)) {
        const projectViewport = preview.querySelector('[data-project-viewport]');
        if (projectViewport) projectViewport.scrollTo({ left: 0, behavior: 'auto' });
      }
    });

    if (options.scroll !== false) {
      topics[activeIndex].scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: reduceMotionQuery.matches || options.instant ? 'auto' : 'smooth',
      });
    }
  };

  const moveActiveTopic = (direction) => {
    const nextIndex = (activeIndex + direction + topics.length) % topics.length;
    setActiveSite(nextIndex, { resetProjects: true });
    topics[nextIndex].focus({ preventScroll: true });
  };

  setActiveSite(activeIndex, { scroll: false, instant: true });

  topics.forEach((topic, index) => {
    topic.tabIndex = index === activeIndex ? 0 : -1;

    topic.addEventListener('pointerenter', () => setActiveSite(index));
    topic.addEventListener('focus', () => setActiveSite(index, { scroll: false }));
    topic.addEventListener('click', () => setActiveSite(index, { resetProjects: true }));

    topic.addEventListener('keydown', (event) => {
      const lastIndex = topics.length - 1;
      let nextIndex = activeIndex;

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = Math.min(activeIndex + 1, lastIndex);
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = Math.max(activeIndex - 1, 0);
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = lastIndex;
      if (nextIndex === activeIndex) return;

      event.preventDefault();
      setActiveSite(nextIndex, { resetProjects: true });
      topics[nextIndex].focus({ preventScroll: true });
    });
  });

  if (topicPrev) topicPrev.addEventListener('click', () => moveActiveTopic(-1));
  if (topicNext) topicNext.addEventListener('click', () => moveActiveTopic(1));

  if (topicList && window.matchMedia('(pointer: fine)').matches) {
    topicList.addEventListener('pointermove', (event) => {
      const hoveredTopic = event.target.closest('[data-site-topic]');
      if (!hoveredTopic) return;
      const hoveredIndex = Number(hoveredTopic.getAttribute('data-site-index'));
      if (hoveredIndex !== activeIndex) setActiveSite(hoveredIndex, { resetProjects: true });
    });
  }

  if (showcaseOrb) {
    showcase.addEventListener('pointermove', (event) => {
      const rect = showcaseOrb.getBoundingClientRect();
      const lightX = Math.max(12, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100));
      const lightY = Math.max(12, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
      showcaseOrb.style.setProperty('--orb-light-x', `${lightX}%`);
      showcaseOrb.style.setProperty('--orb-light-y', `${lightY}%`);
    }, { passive: true });
  }
});

// Project cards carousel
document.querySelectorAll('[data-project-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('[data-project-viewport]');
  const track = carousel.querySelector('[data-project-track]');
  const prev = carousel.querySelector('[data-project-prev]');
  const next = carousel.querySelector('[data-project-next]');

  if (!viewport || !track) return;

  const scrollProjects = (direction) => {
    const firstCard = track.querySelector('.project-card');
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth * 0.85;

    viewport.scrollBy({
      left: direction * distance,
      behavior: reduceMotionQuery.matches ? 'auto' : 'smooth',
    });
  };

  if (prev) prev.addEventListener('click', () => scrollProjects(-1));
  if (next) next.addEventListener('click', () => scrollProjects(1));
});
