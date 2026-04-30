export const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => reduceMotionQuery.matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

export const onceVisible = (el, cb, options = {}) => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cb(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4, ...options });
  obs.observe(el);
};
