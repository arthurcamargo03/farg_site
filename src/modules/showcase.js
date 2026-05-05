import { prefersReducedMotion, finePointer } from '../lib/motion.js';

export const initShowcases = (root = document) => {
  const showcases = root.querySelectorAll('[data-site-showcase]');
  if (!showcases.length) return null;

  const cleanups = [];

  showcases.forEach((showcase) => {
    const topics = Array.from(showcase.querySelectorAll('[data-site-topic]'));
    const previews = Array.from(showcase.querySelectorAll('[data-site-preview]'));
    const topicList = showcase.querySelector('[data-topic-list]');
    const topicPrev = showcase.querySelector('[data-topic-prev]');
    const topicNext = showcase.querySelector('[data-topic-next]');
    const showcaseOrb = showcase.querySelector('[data-showcase-orb]');
    let activeIndex = Math.max(0, topics.findIndex((t) => t.classList.contains('is-active')));

    const setActiveSite = (nextIndex, options = {}) => {
      if (!topics[nextIndex]) return;
      const didChange = nextIndex !== activeIndex;
      activeIndex = nextIndex;

      topics.forEach((topic, index) => {
        const isActive = index === activeIndex;
        topic.classList.toggle('is-active', isActive);
        topic.setAttribute('aria-selected', String(isActive));
        topic.tabIndex = isActive ? 0 : -1;
      });

      previews.forEach((preview, index) => {
        const isActive = index === activeIndex;
        preview.classList.toggle('is-active', isActive);
        preview.setAttribute('aria-hidden', String(!isActive));
        preview.inert = !isActive;
        if (isActive && (didChange || options.resetProjects)) {
          const projectViewport = preview.querySelector('[data-project-viewport]');
          if (projectViewport) projectViewport.scrollTo({ left: 0, behavior: 'auto' });
        }
      });

      if (options.scroll !== false) {
        topics[activeIndex].scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: prefersReducedMotion() || options.instant ? 'auto' : 'smooth',
        });
      }
    };

    const moveActiveTopic = (direction) => {
      const nextIndex = (activeIndex + direction + topics.length) % topics.length;
      setActiveSite(nextIndex, { resetProjects: true });
      topics[nextIndex].focus({ preventScroll: true });
    };

    setActiveSite(activeIndex, { scroll: false, instant: true });

    const topicHandlers = [];
    topics.forEach((topic, index) => {
      topic.tabIndex = index === activeIndex ? 0 : -1;
      const onEnter = () => setActiveSite(index);
      const onFocus = () => setActiveSite(index, { scroll: false });
      const onClick = () => setActiveSite(index, { resetProjects: true });
      const onKey = (event) => {
        const lastIndex = topics.length - 1;
        let nextIndex = activeIndex;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = Math.min(activeIndex + 1, lastIndex);
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = Math.max(activeIndex - 1, 0);
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = lastIndex;
        if (nextIndex === activeIndex) return;
        event.preventDefault();
        setActiveSite(nextIndex, { resetProjects: true });
        topics[nextIndex].focus({ preventScroll: true });
      };
      topic.addEventListener('pointerenter', onEnter);
      topic.addEventListener('focus', onFocus);
      topic.addEventListener('click', onClick);
      topic.addEventListener('keydown', onKey);
      topicHandlers.push([topic, onEnter, onFocus, onClick, onKey]);
    });

    const onPrev = () => moveActiveTopic(-1);
    const onNext = () => moveActiveTopic(1);
    if (topicPrev) topicPrev.addEventListener('click', onPrev);
    if (topicNext) topicNext.addEventListener('click', onNext);

    let onListMove = null;
    if (topicList && finePointer) {
      onListMove = (event) => {
        const hoveredTopic = event.target.closest('[data-site-topic]');
        if (!hoveredTopic) return;
        const hoveredIndex = Number(hoveredTopic.getAttribute('data-site-index'));
        if (hoveredIndex !== activeIndex) setActiveSite(hoveredIndex, { resetProjects: true });
      };
      topicList.addEventListener('pointermove', onListMove);
    }

    let onShowcaseMove = null;
    if (showcaseOrb) {
      onShowcaseMove = (event) => {
        const rect = showcaseOrb.getBoundingClientRect();
        const lightX = Math.max(12, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100));
        const lightY = Math.max(12, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
        showcaseOrb.style.setProperty('--orb-light-x', `${lightX}%`);
        showcaseOrb.style.setProperty('--orb-light-y', `${lightY}%`);
      };
      showcase.addEventListener('pointermove', onShowcaseMove, { passive: true });
    }

    cleanups.push(() => {
      topicHandlers.forEach(([topic, onEnter, onFocus, onClick, onKey]) => {
        topic.removeEventListener('pointerenter', onEnter);
        topic.removeEventListener('focus', onFocus);
        topic.removeEventListener('click', onClick);
        topic.removeEventListener('keydown', onKey);
      });
      if (topicPrev) topicPrev.removeEventListener('click', onPrev);
      if (topicNext) topicNext.removeEventListener('click', onNext);
      if (topicList && onListMove) topicList.removeEventListener('pointermove', onListMove);
      if (showcaseOrb && onShowcaseMove) showcase.removeEventListener('pointermove', onShowcaseMove);
    });
  });

  return cleanups.length ? () => cleanups.forEach((fn) => fn()) : null;
};

export const initProjectCarousels = (root = document) => {
  const carousels = root.querySelectorAll('[data-project-carousel]');
  if (!carousels.length) return null;

  const cleanups = [];

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector('[data-project-viewport]');
    const track = carousel.querySelector('[data-project-track]');
    const prev = carousel.querySelector('[data-project-prev]');
    const next = carousel.querySelector('[data-project-next]');
    if (!viewport || !track) return;

    const scrollProjects = (direction) => {
      const firstCard = track.querySelector('.project-card');
      const trackStyles = window.getComputedStyle(track);
      const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
      const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth * 0.85;
      viewport.scrollBy({
        left: direction * distance,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    };

    const onPrev = () => scrollProjects(-1);
    const onNext = () => scrollProjects(1);
    if (prev) prev.addEventListener('click', onPrev);
    if (next) next.addEventListener('click', onNext);

    cleanups.push(() => {
      if (prev) prev.removeEventListener('click', onPrev);
      if (next) next.removeEventListener('click', onNext);
    });
  });

  return cleanups.length ? () => cleanups.forEach((fn) => fn()) : null;
};
