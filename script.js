// Year
const currentYearElement = document.querySelector('#ano-atual');
if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
}

// Scroll-in animations
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-up').forEach((el) => fadeObserver.observe(el));

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.site-nav__link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove('is-active'));
        const active = document.querySelector(`.site-nav__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('is-active');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => sectionObserver.observe(section));

// Hamburger menu
const hamburger = document.querySelector('.nav-hamburger');
const navCollapse = document.querySelector('.nav-collapse');

if (hamburger && navCollapse) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    navCollapse.classList.toggle('is-open', !isOpen);
  });

  navCollapse.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navCollapse.classList.remove('is-open');
    });
  });
}
