// Year
const currentYearElement = document.querySelector('#ano-atual');
if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
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
