import gsap from 'gsap';
import { prefersReducedMotion, finePointer } from '../lib/motion.js';

export const initYear = () => {
  const el = document.querySelector('#ano-atual');
  if (el) el.textContent = String(new Date().getFullYear());
};

export const initHamburger = () => {
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
};

export const initCounters = () => {
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
};

export const initMarquee = () => {
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    const parent = track.parentElement;
    if (!parent) return;
    parent.addEventListener('pointerenter', () => track.classList.add('is-paused'));
    parent.addEventListener('pointerleave', () => track.classList.remove('is-paused'));
  });
};

export const initPortfolioTilt = () => {
  if (prefersReducedMotion() || !finePointer) return;
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
};

export const initPageLoader = (onDone) => {
  const loader = document.querySelector('[data-page-loader]');
  if (!loader) {
    document.body.classList.add('is-loaded');
    onDone?.();
    return;
  }

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
    else {
      document.body.classList.add('is-loaded');
      loader.classList.add('is-done');
      onDone?.();
      setTimeout(() => loader.remove(), 720);
    }
  };
  requestAnimationFrame(tick);
};
