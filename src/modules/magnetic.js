import gsap from 'gsap';
import { prefersReducedMotion, finePointer } from '../lib/motion.js';

export const initMagnetic = () => {
  if (prefersReducedMotion() || !finePointer) return;
  const targets = document.querySelectorAll('[data-magnetic]');
  if (!targets.length) return;

  targets.forEach((el) => {
    const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;

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
};
