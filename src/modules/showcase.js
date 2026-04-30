import { prefersReducedMotion, finePointer } from '../lib/motion.js';

export const initShowcases = () => {
  document.querySelectorAll('[data-site-showcase]').forEach((showcase) => {
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

    topics.forEach((topic, index) => {
      topic.tabIndex = index === activeIndex ? 0 : -1;
      topic.addEventListener('pointerenter', () => setActiveSite(index));
      topic.addEventListener('focus', () => setActiveSite(index, { scroll: false }));
      topic.addEventListener('click', () => setActiveSite(index, { resetProjects: true }));
      topic.addEventListener('keydown', (event) => {
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
      });
    });

    if (topicPrev) topicPrev.addEventListener('click', () => moveActiveTopic(-1));
    if (topicNext) topicNext.addEventListener('click', () => moveActiveTopic(1));

    if (topicList && finePointer) {
      topicList.addEventListener('pointermove', (event) => {
        const hoveredTopic = event.target.closest('[data-site-topic]');
        if (!hoveredTopic) return;
        const hoveredIndex = Number(hoveredTopic.getAttribute('data-site-index'));
        if (hoveredIndex !== activeIndex) setActiveSite(hoveredIndex, { resetProjects: true });
      });
    }

    if (showcaseOrb) {
      showcase.addEventListener('pointermove', (event) => {
        const rect = showcaseOrb.getBoundingClientRect();
        const lightX = Math.max(12, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100));
        const lightY = Math.max(12, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
        showcaseOrb.style.setProperty('--orb-light-x', `${lightX}%`);
        showcaseOrb.style.setProperty('--orb-light-y', `${lightY}%`);
      }, { passive: true });
    }
  });
};

export const initProjectCarousels = () => {
  document.querySelectorAll('[data-project-carousel]').forEach((carousel) => {
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

    if (prev) prev.addEventListener('click', () => scrollProjects(-1));
    if (next) next.addEventListener('click', () => scrollProjects(1));
  });
};
