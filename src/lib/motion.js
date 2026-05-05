export const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => reduceMotionQuery.matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;
