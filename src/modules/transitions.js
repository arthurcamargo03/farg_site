import barba from '@barba/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/motion.js';

export const initPageTransitions = (onAfterEnter) => {
  if (prefersReducedMotion()) return;

  /* curtain element used during transition */
  let curtain = document.querySelector('[data-curtain]');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.className = 'curtain';
    curtain.setAttribute('data-curtain', '');
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = '<span class="curtain__brand">FARG Co.</span>';
    document.body.appendChild(curtain);
  }

  barba.init({
    debug: false,
    preventRunning: true,
    transitions: [
      {
        name: 'farg-curtain',
        async leave({ current }) {
          const tl = gsap.timeline();
          tl.set(curtain, { display: 'flex' })
            .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'power3.inOut' })
            .to(current.container, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);
          await tl;
        },
        async enter({ next }) {
          window.scrollTo(0, 0);
          gsap.set(next.container, { opacity: 1 });
          const tl = gsap.timeline({
            onComplete: () => gsap.set(curtain, { display: 'none' }),
          });
          tl.fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 0.7, ease: 'power3.inOut', delay: 0.05 })
            .from(next.container, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' }, 0.15);
          await tl;
        },
      },
    ],
  });

  barba.hooks.afterEnter(({ next }) => {
    /* re-init scoped scripts on new page */
    onAfterEnter?.(next.container);
    /* refresh ScrollTrigger after DOM swap */
    ScrollTrigger.refresh();
  });
};
