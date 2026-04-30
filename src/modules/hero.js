import gsap from 'gsap';
import SplitType from 'split-type';
import { prefersReducedMotion } from '../lib/motion.js';

export const initHeroEntrance = () => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const eyebrow = hero.querySelector('[data-hero-eyebrow]');
  const lines = hero.querySelectorAll('[data-hero-line]');
  const desc = hero.querySelector('[data-hero-desc]');
  const actions = hero.querySelector('[data-hero-actions]');
  const portfolio = hero.querySelector('[data-hero-portfolio]');
  const stats = hero.querySelectorAll('[data-hero-stats] .hero__stat');
  const cue = hero.querySelector('[data-scroll-cue]');

  lines.forEach((line) => {
    if (line.classList.contains('hero__line--accent')) return;
    const split = new SplitType(line, { types: 'words,chars' });
    split.chars.forEach((c) => (c.style.display = 'inline-block'));
  });

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
    gsap.set([eyebrow, ...lines, desc, actions, portfolio, ...stats, cue].filter(Boolean), { clearProps: 'all' });
  } else {
    document.fonts?.ready ? document.fonts.ready.then(start) : start();
  }
};

export const initRotatingWord = () => {
  const el = document.querySelector('[data-rotating-word]');
  if (!el) return;

  const words = (el.getAttribute('data-words') || '')
    .split(',').map((w) => w.trim()).filter(Boolean);
  let i = Math.max(0, words.indexOf(el.textContent.trim()));

  if (words.length <= 1) return;
  setInterval(() => {
    i = (i + 1) % words.length;
    el.classList.add('is-changing');
    setTimeout(() => {
      el.textContent = words[i];
      el.classList.remove('is-changing');
    }, prefersReducedMotion() ? 0 : 220);
  }, 2200);
};
