const currentYearElement = document.querySelector('#ano-atual');

if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
}
