import { prefersReducedMotion, finePointer } from '../lib/motion.js';

export const initCustomCursor = () => {
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
};
