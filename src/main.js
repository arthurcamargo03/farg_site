import '../styles.css';

import { initSmoothScroll, initScrollProgress, initStickyHeader, initNavActiveLink } from './modules/scroll.js';
import { initCustomCursor } from './modules/cursor.js';
import { initMagnetic } from './modules/magnetic.js';
import { initHeroEntrance, initRotatingWord } from './modules/hero.js';
import { initTitleReveals, initFadeUps, initSectionParallax } from './modules/reveals.js';
import {
  initYear,
  initHamburger,
  initCounters,
  initMarquee,
  initPortfolioTilt,
  initPageLoader,
} from './modules/ui.js';
import { initShowcases, initProjectCarousels } from './modules/showcase.js';
import { initBackgroundShader } from './webgl/background.js';
import { initPageTransitions } from './modules/transitions.js';

/* ─── Boot order ─── */
const bootGlobal = () => {
  initSmoothScroll();
  initStickyHeader();
  initScrollProgress();
  initCustomCursor();
  initBackgroundShader();
};

const bootScoped = (root = document) => {
  initYear();
  initRotatingWord();
  initHamburger();
  initCounters();
  initMarquee();
  initMagnetic();
  initPortfolioTilt();
  initHeroEntrance();
  initTitleReveals();
  initFadeUps();
  initSectionParallax();
  initNavActiveLink();
  initShowcases();
  initProjectCarousels();
};

const start = () => {
  bootGlobal();
  initPageLoader(() => bootScoped());
  initPageTransitions((container) => bootScoped(container));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
