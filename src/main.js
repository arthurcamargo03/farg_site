import '../styles.css';

import { initScrollProgress, initStickyHeader, initNavActiveLink } from './modules/scroll.js';
import { initMagnetic } from './modules/magnetic.js';
import { initHeroEntrance } from './modules/hero.js';
import { initTitleReveals, initFadeUps, initSectionParallax } from './modules/reveals.js';
import {
  initYear,
  initHamburger,
  initCounters,
  initMarquee,
  initPageLoader,
} from './modules/ui.js';
import { initShowcases, initProjectCarousels } from './modules/showcase.js';

/* ─── Boot order ─── */
const bootGlobal = () => {
  initStickyHeader();
  initScrollProgress();
};

let scopedCleanups = [];
let typoHeroCleanup = null;

const bootTypoHero = (root) => {
  const canvas = root.querySelector('[data-typo-canvas]');
  if (!canvas) return;

  /* skip WebGL on mobile — dot-grid CSS background is enough */
  if (window.innerWidth < 768) { canvas.hidden = true; return; }

  /* dynamic import — Three.js loads in a separate chunk, non-blocking */
  import('./webgl/typo-hero.js')
    .then(({ initTypoHero }) => {
      typoHeroCleanup = initTypoHero(canvas) ?? null;
    })
    .catch(() => { canvas.hidden = true; });
};

const bootScoped = (root = document) => {
  scopedCleanups.forEach((fn) => fn?.());
  typoHeroCleanup?.();
  typoHeroCleanup = null;

  bootTypoHero(root);

  scopedCleanups = [
    initYear(root),
    initHamburger(root),
    initCounters(root),
    initMarquee(root),
    initMagnetic(root),
    initHeroEntrance(root),
    initTitleReveals(root),
    initFadeUps(root),
    initSectionParallax(root),
    initNavActiveLink(root),
    initShowcases(root),
    initProjectCarousels(root),
  ].filter(Boolean);
};

const start = () => {
  bootGlobal();
  initPageLoader(() => bootScoped());
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
