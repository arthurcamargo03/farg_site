import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export const getLenis = () => lenisInstance;

export const initSmoothScroll = () => {
  if (prefersReducedMotion()) return null;

  lenisInstance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  lenisInstance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    lenisInstance.scrollTo(target, { offset: -64, duration: 1.4 });
  });

  return lenisInstance;
};

export const initScrollProgress = () => {
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
};

export const initStickyHeader = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};

export const initNavActiveLink = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav__link');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
  };

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40%',
      end: 'bottom 40%',
      onToggle: (self) => self.isActive && setActive(section.id),
    });
  });
};
