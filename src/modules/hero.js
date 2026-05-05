import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/motion.js';

export const initHeroEntrance = (root = document) => {
  const hero = root.querySelector('[data-hero]');
  if (!hero) return null;

  const eyebrow = hero.querySelector('[data-hero-eyebrow]');
  const lines = hero.querySelectorAll('[data-hero-line]');
  const desc = hero.querySelector('[data-hero-desc]');
  const actions = hero.querySelector('[data-hero-actions]');
  const portfolio = hero.querySelector('[data-hero-portfolio]');
  const stats = hero.querySelectorAll('[data-hero-stats] .hero__stat');
  const cue = hero.querySelector('[data-scroll-cue]');

  const targets = [eyebrow, ...lines, desc, actions, portfolio, ...stats, cue].filter(Boolean);
  let timeline = null;

  const start = () => {
    timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.05 });

    if (eyebrow) timeline.from(eyebrow, { y: 20, opacity: 0, duration: 0.8 }, 0);

    lines.forEach((line, i) => {
      timeline.from(line, { y: 44, opacity: 0, duration: 0.75 }, 0.18 + i * 0.08);
    });

    if (desc) timeline.from(desc, { y: 24, opacity: 0, duration: 0.8 }, 0.65);
    if (actions) timeline.from(actions.children, { y: 18, opacity: 0, stagger: 0.1, duration: 0.7 }, 0.78);
    if (portfolio) timeline.from(portfolio, { y: 26, opacity: 0, duration: 0.9 }, 0.55);
    if (stats.length) timeline.from(stats, { y: 18, opacity: 0, stagger: 0.08, duration: 0.6 }, 0.95);
    if (cue) timeline.from(cue, { opacity: 0, y: -10, duration: 0.7 }, 1.1);
  };

  if (prefersReducedMotion()) {
    gsap.set(targets, { clearProps: 'all' });
  } else if (document.fonts?.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }

  return () => {
    timeline?.kill();
    gsap.killTweensOf(targets);
  };
};
