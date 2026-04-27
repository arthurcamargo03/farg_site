const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const currentYearElement = document.querySelector('#ano-atual');
if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
}

/* ===== Hero typewriter ===== */
const heroAnimatedWordElement = document.querySelector('#hero-palavra-dinamica');

const heroAnimatedWords = [
  'Sites',
  'Sistemas',
  'Aplicativos',
  'Google Ads',
  'Tráfego orgânico',
];

const heroTypingConfig = {
  typingSpeed: 85,
  deletingSpeed: 45,
  visibleDelay: 1400,
  nextWordDelay: 250,
};

let heroWordIndex = 0;
let heroLetterIndex = 0;
let isDeletingHeroWord = false;

function updateHeroAnimatedWord() {
  if (!heroAnimatedWordElement) return;

  const currentWord = heroAnimatedWords[heroWordIndex];

  if (isDeletingHeroWord) {
    heroLetterIndex -= 1;
  } else {
    heroLetterIndex += 1;
  }

  heroAnimatedWordElement.textContent = currentWord.slice(0, heroLetterIndex);

  if (!isDeletingHeroWord && heroLetterIndex === currentWord.length) {
    isDeletingHeroWord = true;
    window.setTimeout(updateHeroAnimatedWord, heroTypingConfig.visibleDelay);
    return;
  }

  if (isDeletingHeroWord && heroLetterIndex === 0) {
    isDeletingHeroWord = false;
    heroWordIndex = (heroWordIndex + 1) % heroAnimatedWords.length;
    window.setTimeout(updateHeroAnimatedWord, heroTypingConfig.nextWordDelay);
    return;
  }

  window.setTimeout(
    updateHeroAnimatedWord,
    isDeletingHeroWord ? heroTypingConfig.deletingSpeed : heroTypingConfig.typingSpeed
  );
}

if (heroAnimatedWordElement) {
  heroAnimatedWordElement.textContent = '';
  updateHeroAnimatedWord();
}

/* ===== Header scrolled state ===== */
const siteHeader = document.querySelector('[data-site-header]');

function updateHeaderState() {
  if (!siteHeader) return;
  if (window.scrollY > 24) {
    siteHeader.classList.add('is-scrolled');
  } else {
    siteHeader.classList.remove('is-scrolled');
  }
}

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

/* ===== Mobile nav ===== */
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');

function closeMobileNav() {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menu');
  navMenu.classList.remove('is-open');
}

function toggleMobileNav() {
  if (!navToggle || !navMenu) return;
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  navMenu.classList.toggle('is-open', !isOpen);
}

navToggle?.addEventListener('click', toggleMobileNav);

navMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileNav);
});

/* ===== Scrollspy ===== */
const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
const sectionTargets = navLinks
  .map((link) => {
    const id = link.getAttribute('href');
    return id ? document.querySelector(id) : null;
  })
  .filter(Boolean);

if (sectionTargets.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      });
    },
    {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0,
    }
  );

  sectionTargets.forEach((section) => sectionObserver.observe(section));
}

/* ===== Scroll reveal ===== */
const revealElements = document.querySelectorAll('[data-reveal]');

if (revealElements.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

/* ===== Feedback carousel ===== */
const feedbackCarouselElement = document.querySelector('[data-feedback-carousel]');
const feedbackCards = feedbackCarouselElement
  ? Array.from(feedbackCarouselElement.querySelectorAll('.feedback-card'))
  : [];
const feedbackDotsContainer = document.querySelector('[data-feedback-dots]');
const feedbackPrevButton = document.querySelector('[data-feedback-prev]');
const feedbackNextButton = document.querySelector('[data-feedback-next]');

let activeFeedbackIndex = 0;
let feedbackAutoPlayId;

function createFeedbackDots() {
  if (!feedbackDotsContainer) return [];
  feedbackDotsContainer.innerHTML = '';

  return feedbackCards.map((_, cardIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'feedback-carousel__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir para feedback ${cardIndex + 1}`);
    if (cardIndex === activeFeedbackIndex) {
      dot.classList.add('is-active');
      dot.setAttribute('aria-selected', 'true');
    } else {
      dot.setAttribute('aria-selected', 'false');
    }
    dot.addEventListener('click', () => {
      showFeedbackCard(cardIndex);
      restartFeedbackAutoPlay();
    });
    feedbackDotsContainer.appendChild(dot);
    return dot;
  });
}

const feedbackDots = createFeedbackDots();

function showFeedbackCard(nextIndex) {
  if (!feedbackCards.length) return;

  feedbackCards[activeFeedbackIndex].classList.remove('is-active');
  feedbackDots[activeFeedbackIndex]?.classList.remove('is-active');
  feedbackDots[activeFeedbackIndex]?.setAttribute('aria-selected', 'false');

  activeFeedbackIndex = (nextIndex + feedbackCards.length) % feedbackCards.length;

  feedbackCards[activeFeedbackIndex].classList.add('is-active');
  feedbackDots[activeFeedbackIndex]?.classList.add('is-active');
  feedbackDots[activeFeedbackIndex]?.setAttribute('aria-selected', 'true');
}

function showNextFeedbackCard() {
  showFeedbackCard(activeFeedbackIndex + 1);
}

function showPreviousFeedbackCard() {
  showFeedbackCard(activeFeedbackIndex - 1);
}

function startFeedbackAutoPlay() {
  if (feedbackCards.length <= 1 || prefersReducedMotion) return;
  feedbackAutoPlayId = window.setInterval(showNextFeedbackCard, 5200);
}

function restartFeedbackAutoPlay() {
  window.clearInterval(feedbackAutoPlayId);
  startFeedbackAutoPlay();
}

if (feedbackCards.length) {
  feedbackPrevButton?.addEventListener('click', () => {
    showPreviousFeedbackCard();
    restartFeedbackAutoPlay();
  });

  feedbackNextButton?.addEventListener('click', () => {
    showNextFeedbackCard();
    restartFeedbackAutoPlay();
  });

  feedbackCarouselElement?.addEventListener('mouseenter', () => {
    window.clearInterval(feedbackAutoPlayId);
  });

  feedbackCarouselElement?.addEventListener('mouseleave', () => {
    restartFeedbackAutoPlay();
  });

  startFeedbackAutoPlay();
}
