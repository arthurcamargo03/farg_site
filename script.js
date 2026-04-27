const currentYearElement = document.querySelector('#ano-atual');

if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
}

const heroAnimatedWordElement = document.querySelector('#hero-palavra-dinamica');

const heroAnimatedWords = [
  'Sites',
  'Sistemas',
  'Aplicativos',
  'google ads',
  'Trafego organico',
];

const heroTypingConfig = {
  typingSpeed: 85,
  deletingSpeed: 45,
  visibleDelay: 1200,
  nextWordDelay: 250,
};

let heroWordIndex = 0;
let heroLetterIndex = 0;
let isDeletingHeroWord = false;

function updateHeroAnimatedWord() {
  if (!heroAnimatedWordElement) {
    return;
  }

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

const feedbackCarouselElement = document.querySelector('[data-feedback-carousel]');
const feedbackCards = feedbackCarouselElement
  ? Array.from(feedbackCarouselElement.querySelectorAll('.feedback-card'))
  : [];
const feedbackDotsContainer = document.querySelector('[data-feedback-dots]');
const feedbackPrevButton = document.querySelector('[data-feedback-prev]');
const feedbackNextButton = document.querySelector('[data-feedback-next]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeFeedbackIndex = 0;
let feedbackAutoPlayId;

function createFeedbackDots() {
  if (!feedbackDotsContainer) {
    return [];
  }

  feedbackDotsContainer.innerHTML = '';

  return feedbackCards.map((_, cardIndex) => {
    const dot = document.createElement('span');
    dot.className = 'feedback-carousel__dot';

    if (cardIndex === activeFeedbackIndex) {
      dot.classList.add('is-active');
    }

    feedbackDotsContainer.appendChild(dot);
    return dot;
  });
}

const feedbackDots = createFeedbackDots();

function showFeedbackCard(nextIndex) {
  if (!feedbackCards.length) {
    return;
  }

  feedbackCards[activeFeedbackIndex].classList.remove('is-active');
  feedbackDots[activeFeedbackIndex]?.classList.remove('is-active');

  activeFeedbackIndex = (nextIndex + feedbackCards.length) % feedbackCards.length;

  feedbackCards[activeFeedbackIndex].classList.add('is-active');
  feedbackDots[activeFeedbackIndex]?.classList.add('is-active');
}

function showNextFeedbackCard() {
  showFeedbackCard(activeFeedbackIndex + 1);
}

function showPreviousFeedbackCard() {
  showFeedbackCard(activeFeedbackIndex - 1);
}

function startFeedbackAutoPlay() {
  if (feedbackCards.length <= 1 || prefersReducedMotion) {
    return;
  }

  feedbackAutoPlayId = window.setInterval(showNextFeedbackCard, 4200);
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

  startFeedbackAutoPlay();
}
