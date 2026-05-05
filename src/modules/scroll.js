import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const getLenis = () => null;

export const initScrollProgress = () => {
  const bar = document.querySelector('[data-scroll-progress]');
  if (!bar) return null;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};

export const initStickyHeader = () => {
  const header = document.querySelector('.site-header');
  if (!header) return null;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
};

export const initNavActiveLink = (root = document) => {
  const sections = root.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav__link');
  if (!sections.length || !navLinks.length) return null;

  const setActive = (id) => {
    navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
  };

  const triggers = [];
  sections.forEach((section) => {
    const trig = ScrollTrigger.create({
      trigger: section,
      start: 'top 40%',
      end: 'bottom 40%',
      onToggle: (self) => self.isActive && setActive(section.id),
    });
    triggers.push(trig);
  });

  return () => triggers.forEach((t) => t.kill());
};
