/* ─────────────────────────────────────────────
   FARG Co. — main runtime
   Stack: Lenis + GSAP + ScrollTrigger + SplitType
   ───────────────────────────────────────────── */

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = () => reduceMotionQuery.matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* Year */
const currentYearElement = document.querySelector('#ano-atual');
if (currentYearElement) currentYearElement.textContent = String(new Date().getFullYear());

/* ─── Page loader ─── */
(() => {
  const loader = document.querySelector('[data-page-loader]');
  if (!loader) return;

  const fill = loader.querySelector('.page-loader__bar-fill');
  const count = loader.querySelector('[data-loader-count]');
  const start = performance.now();
  const duration = prefersReducedMotion() ? 320 : 1100;

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 2.5);
    if (fill) fill.style.transform = `scaleX(${eased})`;
    if (count) count.textContent = String(Math.floor(eased * 100)).padStart(2, '0');
    if (t < 1) requestAnimationFrame(tick);
    else finishLoader();
  };

  const finishLoader = () => {
    document.body.classList.add('is-loaded');
    loader.classList.add('is-done');
    setTimeout(() => loader.remove(), 720);
  };

  requestAnimationFrame(tick);
})();

/* ─── Lenis smooth scroll ─── */
let lenis = null;
if (window.Lenis && !prefersReducedMotion()) {
  lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.4 });
    });
  });
}

/* ─── GSAP ScrollTrigger sync with Lenis ─── */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else if (window.Lenis) {
    /* reduced motion: still need Lenis off, no driver */
  }
} else if (lenis) {
  /* GSAP missing: drive Lenis via rAF */
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

/* ─── Hero rotating word ─── */
const rotatingWordElement = document.querySelector('[data-rotating-word]');
if (rotatingWordElement) {
  const words = (rotatingWordElement.getAttribute('data-words') || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  let activeWordIndex = Math.max(0, words.indexOf(rotatingWordElement.textContent.trim()));

  if (words.length > 1) {
    setInterval(() => {
      activeWordIndex = (activeWordIndex + 1) % words.length;
      rotatingWordElement.classList.add('is-changing');
      setTimeout(() => {
        rotatingWordElement.textContent = words[activeWordIndex];
        rotatingWordElement.classList.remove('is-changing');
      }, prefersReducedMotion() ? 0 : 220);
    }, 2200);
  }
}

/* ─── Hero entrance choreography ─── */
(() => {
  if (!window.gsap) return;
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const eyebrow = hero.querySelector('[data-hero-eyebrow]');
  const lines = hero.querySelectorAll('[data-hero-line]');
  const desc = hero.querySelector('[data-hero-desc]');
  const actions = hero.querySelector('[data-hero-actions]');
  const portfolio = hero.querySelector('[data-hero-portfolio]');
  const stats = hero.querySelectorAll('[data-hero-stats] .hero__stat');
  const cue = hero.querySelector('[data-scroll-cue]');

  if (window.SplitType && lines.length) {
    lines.forEach((line) => {
      if (line.classList.contains('hero__line--accent')) return;
      const split = new SplitType(line, { types: 'words,chars' });
      split.chars.forEach((c) => (c.style.display = 'inline-block'));
    });
  }

  const start = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.05 });

    if (eyebrow) tl.from(eyebrow, { y: 20, opacity: 0, duration: 0.8 }, 0);

    lines.forEach((line, i) => {
      if (line.classList.contains('hero__line--accent')) {
        tl.from(line, { y: 60, opacity: 0, duration: 1.0 }, 0.2 + i * 0.1);
      } else {
        const chars = line.querySelectorAll('.char');
        if (chars.length) {
          tl.from(chars, {
            y: '110%',
            opacity: 0,
            stagger: 0.022,
            duration: 0.85,
            ease: 'power4.out',
          }, 0.18 + i * 0.08);
        } else {
          tl.from(line, { y: 40, opacity: 0, duration: 0.9 }, 0.18 + i * 0.08);
        }
      }
    });

    if (desc) tl.from(desc, { y: 24, opacity: 0, duration: 0.8 }, 0.65);
    if (actions) tl.from(actions.children, { y: 18, opacity: 0, stagger: 0.1, duration: 0.7 }, 0.78);
    if (portfolio) tl.from(portfolio, { y: 26, opacity: 0, duration: 0.9 }, 0.55);
    if (stats.length) tl.from(stats, { y: 18, opacity: 0, stagger: 0.08, duration: 0.6 }, 0.95);
    if (cue) tl.from(cue, { opacity: 0, y: -10, duration: 0.7 }, 1.1);
  };

  if (prefersReducedMotion()) {
    gsap.set([eyebrow, lines, desc, actions, portfolio, stats, cue], { clearProps: 'all' });
  } else {
    document.fonts?.ready.then(start) || start();
  }
})();

/* ─── Section title char reveal on scroll ─── */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const titles = document.querySelectorAll('[data-reveal-text]');
  if (!titles.length) return;

  titles.forEach((title) => {
    if (window.SplitType) {
      const split = new SplitType(title, { types: 'words,chars' });
      split.chars.forEach((c) => (c.style.display = 'inline-block'));

      gsap.from(split.chars, {
        scrollTrigger: { trigger: title, start: 'top 82%', once: true },
        y: '110%',
        opacity: 0,
        stagger: 0.018,
        duration: 0.75,
        ease: 'power4.out',
      });
    }
  });
})();

/* ─── Generic fade-up via ScrollTrigger ─── */
(() => {
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const groupSelectors = ['.services-grid', '.team-grid', '.timeline'];
  const grouped = new Set();

  groupSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      const items = group.querySelectorAll(':scope > .fade-up');
      if (!items.length) return;
      items.forEach((el) => grouped.add(el));
      gsap.fromTo(items,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
          onStart: () => items.forEach((el) => el.classList.add('is-visible')),
        });
    });
  });

  document.querySelectorAll('.fade-up').forEach((el) => {
    if (grouped.has(el)) return;
    gsap.fromTo(el,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onStart: () => el.classList.add('is-visible'),
      },
    );
  });
})();

/* ─── Active nav link via ScrollTrigger ─── */
(() => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav__link');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
  };

  if (window.ScrollTrigger) {
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: (self) => self.isActive && setActive(section.id),
      });
    });
  } else {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => obs.observe(s));
  }
})();

/* ─── Hamburger ─── */
(() => {
  const hamburger = document.querySelector('.nav-hamburger');
  const navCollapse = document.querySelector('.nav-collapse');
  if (!hamburger || !navCollapse) return;

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
})();

/* ─── Counter ─── */
(() => {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animate(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => obs.observe(el));
})();

/* ─── Sticky header scrolled state ─── */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─── Scroll progress bar ─── */
(() => {
  const bar = document.querySelector('[data-scroll-progress]');
  if (!bar) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

/* ─── Custom cursor ─── */
(() => {
  const cursor = document.querySelector('[data-cursor]');
  if (!cursor || !finePointer || prefersReducedMotion()) return;

  document.documentElement.classList.add('has-custom-cursor');

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const labelEl = cursor.querySelector('[data-cursor-label]');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX, dotY = mouseY, ringX = mouseX, ringY = mouseY;

  document.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const tick = () => {
    dotX += (mouseX - dotX) * 0.85;
    dotY += (mouseY - dotY) * 0.85;
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (dot) dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    if (labelEl) labelEl.style.transform = `translate3d(${ringX + 22}px, ${ringY + 22}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));

  const interactive = 'a, button, [data-cursor-hover], [data-magnetic], input, textarea, [role="button"]';
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest(interactive);
    if (!el) return;
    cursor.classList.add('is-hover');
    const label = el.getAttribute('data-cursor-hover');
    if (label) {
      cursor.classList.add('is-labeled');
      if (labelEl) labelEl.textContent = label;
    }
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest(interactive);
    if (!el) return;
    cursor.classList.remove('is-hover', 'is-labeled');
    if (labelEl) labelEl.textContent = '';
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
})();

/* ─── Magnetic buttons ─── */
(() => {
  if (!window.gsap || prefersReducedMotion() || !finePointer) return;
  const targets = document.querySelectorAll('[data-magnetic]');
  if (!targets.length) return;

  targets.forEach((el) => {
    const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;
    const radius = 90;

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.45, ease: 'power3.out' });
    });

    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    });
  });
})();

/* ─── Hero portfolio parallax tilt ─── */
(() => {
  if (!window.gsap || prefersReducedMotion() || !finePointer) return;
  const card = document.querySelector('.hero__portfolio-link');
  if (!card) return;
  const img = card.querySelector('img');
  const glow = card.querySelector('.hero__portfolio-glow');

  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, { rotationY: x * 14, rotationX: -y * 14, duration: 0.4, ease: 'power3.out', transformPerspective: 800 });
    if (img) gsap.to(img, { x: x * 18, y: y * 18, duration: 0.6, ease: 'power3.out' });
    if (glow) {
      glow.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
      glow.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    }
  });
  card.addEventListener('pointerleave', () => {
    gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' });
    if (img) gsap.to(img, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
  });
})();

/* ─── Marquee infinite (CSS-driven, JS pause on hover) ─── */
(() => {
  const tracks = document.querySelectorAll('[data-marquee]');
  tracks.forEach((track) => {
    const parent = track.parentElement;
    if (!parent) return;
    parent.addEventListener('pointerenter', () => track.classList.add('is-paused'));
    parent.addEventListener('pointerleave', () => track.classList.remove('is-paused'));
  });
})();

/* ─── Section parallax: subtle Y drift ─── */
(() => {
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion()) return;
  document.querySelectorAll('.section--muted .section__header, .section--cta .cta-block').forEach((el) => {
    gsap.fromTo(el, { y: 40 }, {
      y: -20,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const heroPortfolio = document.querySelector('.hero__portfolio');
  if (heroPortfolio) {
    gsap.to(heroPortfolio, {
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
})();

/* ─── Particle background canvas ─── */
(() => {
  const canvas = document.querySelector('[data-bg-canvas]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduce = prefersReducedMotion();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let particles = [];
  let pointer = { x: -1000, y: -1000, active: false };
  let raf = 0;

  const PARTICLE_COUNT = window.innerWidth < 720 ? 36 : 70;
  const LINK_DIST = window.innerWidth < 720 ? 110 : 150;

  const resize = () => {
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const seed = () => {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 0.4,
    }));
  };

  const step = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const force = (1 - dist / 140) * 0.6;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(133, 183, 235, 0.55)';
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(55, 138, 221, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(step);
  };

  resize();
  seed();
  if (!reduce) raf = requestAnimationFrame(step);
  else {
    /* draw once for static field */
    step();
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    seed();
    if (!reduce) raf = requestAnimationFrame(step);
  });

  if (!reduce && finePointer) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => (pointer.active = false));
  }
})();

/* ─── Showcase hover selection (preserved from original) ─── */
document.querySelectorAll('[data-site-showcase]').forEach((showcase) => {
  const topics = Array.from(showcase.querySelectorAll('[data-site-topic]'));
  const previews = Array.from(showcase.querySelectorAll('[data-site-preview]'));
  const topicList = showcase.querySelector('[data-topic-list]');
  const topicPrev = showcase.querySelector('[data-topic-prev]');
  const topicNext = showcase.querySelector('[data-topic-next]');
  const showcaseOrb = showcase.querySelector('[data-showcase-orb]');
  let activeIndex = Math.max(0, topics.findIndex((t) => t.classList.contains('is-active')));

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
        behavior: prefersReducedMotion() || options.instant ? 'auto' : 'smooth',
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

  if (topicList && finePointer) {
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

/* ─── Project carousel (preserved) ─── */
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
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  if (prev) prev.addEventListener('click', () => scrollProjects(-1));
  if (next) next.addEventListener('click', () => scrollProjects(1));
});
