import gsap from 'gsap';
import { prefersReducedMotion, finePointer } from '../lib/motion.js';

export const initMagnetic = (root = document) => {
  if (prefersReducedMotion() || !finePointer) return null;
  const targets = root.querySelectorAll('[data-magnetic]');
  if (!targets.length) return null;

  const cleanups = [];
  targets.forEach((el) => {
    const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.45, ease: 'power3.out' });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    });
  });

  return () => cleanups.forEach((fn) => fn());
};
