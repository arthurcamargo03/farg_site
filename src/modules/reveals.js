import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

export const initTitleReveals = () => {
  document.querySelectorAll('[data-reveal-text]').forEach((title) => {
    const split = new SplitType(title, { types: 'words,chars' });
    split.chars.forEach((c) => (c.style.display = 'inline-block'));

    gsap.from(split.chars, {
      scrollTrigger: { trigger: title, start: 'top 82%', once: true },
      y: '110%',
      opacity: 0,
      stagger: 0.018,
      duration: 0.75,
      ease: 'power4.out',
    });
  });
};

export const initFadeUps = () => {
  const groupSelectors = ['.services-grid', '.team-grid', '.timeline'];
  const grouped = new Set();

  groupSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      const items = group.querySelectorAll(':scope > .fade-up');
      if (!items.length) return;
      items.forEach((el) => grouped.add(el));
      gsap.fromTo(items,
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
    });
  });

  document.querySelectorAll('.fade-up').forEach((el) => {
    if (grouped.has(el)) return;
    gsap.fromTo(el,
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
  });
};

export const initSectionParallax = () => {
  document.querySelectorAll('.section--muted .section__header, .section--cta .cta-block').forEach((el) => {
    gsap.fromTo(el, { y: 40 }, {
      y: -20,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const heroPortfolio = document.querySelector('.hero__portfolio');
  if (heroPortfolio) {
    gsap.to(heroPortfolio, {
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
};
