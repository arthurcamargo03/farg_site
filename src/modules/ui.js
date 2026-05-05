import { prefersReducedMotion } from '../lib/motion.js';

export const initYear = (root = document) => {
  const el = root.querySelector('#ano-atual');
  if (el) el.textContent = String(new Date().getFullYear());
  return null;
};

export const initHamburger = (root = document) => {
  const hamburger = root.querySelector('.nav-hamburger') || document.querySelector('.nav-hamburger');
  const navCollapse = document.querySelector('.nav-collapse');
  if (!hamburger || !navCollapse) return null;

  const onHamburgerClick = () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    navCollapse.classList.toggle('is-open', !isOpen);
  };
  hamburger.addEventListener('click', onHamburgerClick);

  const linkHandlers = [];
  navCollapse.querySelectorAll('a').forEach((link) => {
    const onClick = () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navCollapse.classList.remove('is-open');
    };
    link.addEventListener('click', onClick);
    linkHandlers.push([link, onClick]);
  });

  return () => {
    hamburger.removeEventListener('click', onHamburgerClick);
    linkHandlers.forEach(([link, fn]) => link.removeEventListener('click', fn));
  };
};

export const initCounters = (root = document) => {
  const counters = root.querySelectorAll('[data-counter-target]');
  if (!counters.length) return null;

  const rafIds = new Set();

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.floor(eased * target));
      if (p < 1) {
        const id = requestAnimationFrame(tick);
        rafIds.add(id);
      } else {
        el.textContent = String(target);
      }
    };
    const id = requestAnimationFrame(tick);
    rafIds.add(id);
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

  return () => {
    obs.disconnect();
    rafIds.forEach((id) => cancelAnimationFrame(id));
  };
};

export const initMarquee = (root = document) => {
  const cleanups = [];
  root.querySelectorAll('[data-marquee]').forEach((track) => {
    const parent = track.parentElement;
    if (!parent) return;
    const onEnter = () => track.classList.add('is-paused');
    const onLeave = () => track.classList.remove('is-paused');
    parent.addEventListener('pointerenter', onEnter);
    parent.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      parent.removeEventListener('pointerenter', onEnter);
      parent.removeEventListener('pointerleave', onLeave);
    });
  });
  return cleanups.length ? () => cleanups.forEach((fn) => fn()) : null;
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
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    if (fill) fill.style.transform = 'scaleX(1)';
    if (count) count.textContent = '100';
    document.body.classList.add('is-loaded');
    loader.classList.add('is-done');
    onDone?.();
    setTimeout(() => loader.remove(), 720);
  };

  const tick = (now) => {
    if (done) return;
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 2.5);
    if (fill) fill.style.transform = `scaleX(${eased})`;
    if (count) count.textContent = String(Math.floor(eased * 100)).padStart(2, '0');
    if (t < 1) requestAnimationFrame(tick);
    else finish();
  };

  window.setTimeout(finish, duration + 500);
  if (document.hidden) finish();
  requestAnimationFrame(tick);
};
