import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export const initTitleReveals = (root = document) => {
  const titles = root.querySelectorAll('[data-reveal-text]');
  if (!titles.length) return null;

  const triggers = [];

  titles.forEach((title) => {
    const tween = gsap.from(title, {
      scrollTrigger: { trigger: title, start: 'top 82%', once: true },
      y: 28,
      opacity: 0,
      duration: 0.65,
      ease: 'power3.out',
    });
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  return () => {
    triggers.forEach((t) => t.kill());
  };
};

export const initFadeUps = (root = document) => {
  const groupSelectors = ['.services-grid', '.team-grid', '.timeline'];
  const grouped = new Set();
  const triggers = [];

  groupSelectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((group) => {
      const items = group.querySelectorAll(':scope > .fade-up');
      if (!items.length) return;
      items.forEach((el) => grouped.add(el));
      const tween = gsap.fromTo(items,
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
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
  });

  root.querySelectorAll('.fade-up').forEach((el) => {
    if (grouped.has(el)) return;
    const tween = gsap.fromTo(el,
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
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  return triggers.length ? () => triggers.forEach((t) => t.kill()) : null;
};

export const initSectionParallax = (root = document) => {
  const triggers = [];

  root.querySelectorAll('.section--muted .section__header, .section--cta .cta-block').forEach((el) => {
    const tween = gsap.fromTo(el, { y: 40 }, {
      y: -20,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  return triggers.length ? () => triggers.forEach((t) => t.kill()) : null;
};
