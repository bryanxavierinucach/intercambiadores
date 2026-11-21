const quote = document.querySelector('#quote');

if (quote) {
  const category = quote.elements.categoria;
  category.value = new URLSearchParams(location.search).get('categoria') ?? '';
  quote.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(quote);
    const message = [
      'Hola, EPS Supplier. Quisiera solicitar una cotización.',
      'Nombre o empresa: ' + data.get('nombre'),
      'Correo electrónico: ' + data.get('correo'),
      'Categoría: ' + category.selectedOptions[0].textContent,
      'Marca, modelo y repuesto: ' + data.get('detalle'),
    ].join('\n');
    location.assign(quote.action + '?text=' + encodeURIComponent(message));
  });
}

const header = document.querySelector('.site-header');
const menuToggle = header.querySelector('.menu-toggle');
const menu = header.querySelector('#primary-menu');
const mobileMenu = window.matchMedia('(max-width: 900px)');

function setMenuOpen(open, returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', String(open));
  if (returnFocus) menuToggle.focus();
}

const backdrop = document.createElement('div');
backdrop.className = 'menu-backdrop';
backdrop.setAttribute('aria-hidden', 'true');
header.append(backdrop);
header.classList.add('menu-ready');

backdrop.addEventListener('click', () => setMenuOpen(false, true));

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') === 'false');
});

menu.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!mobileMenu.matches || !link) return;
  setMenuOpen(false);

  if (link.getAttribute('href').startsWith('#')) {
    const section = document.getElementById(link.hash.slice(1));
    if (section) {
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false, true);
  }
});

document.addEventListener('click', (event) => {
  if (!header.contains(event.target) && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false, menu.contains(document.activeElement));
  }
});

mobileMenu.addEventListener('change', () => setMenuOpen(false, mobileMenu.matches && menu.contains(document.activeElement)));

const sections = [...menu.querySelectorAll('a[href^="#"]:not(.menu-quote)')].map((link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
})).filter(({ section }) => section);

if (sections.length) {
  let currentLink = menu.querySelector('[aria-current]');
  let pendingFrame = 0;

  function updateCurrentSection() {
    pendingFrame = 0;
    const readingLine = header.getBoundingClientRect().bottom + 28;
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const current = atPageEnd
      ? sections.at(-1)
      : sections.findLast(({ section }) => section.getBoundingClientRect().top <= readingLine) ?? sections[0];

    if (current.link === currentLink) return;
    currentLink?.removeAttribute('aria-current');
    currentLink = current.link;
    currentLink.setAttribute('aria-current', 'location');
  }

  function scheduleSectionUpdate() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(updateCurrentSection);
  }

  window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
  window.addEventListener('resize', scheduleSectionUpdate);
  window.addEventListener('pageshow', scheduleSectionUpdate);
  window.addEventListener('hashchange', scheduleSectionUpdate);
  updateCurrentSection();
}
