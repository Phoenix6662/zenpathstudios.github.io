const body = document.body;
const base = body.dataset.base || ".";
const activePage = body.dataset.page || "";

const navLinks = [
  { label: "Home", href: `${base}/index.html`, page: "home" },
  { label: "Apps", href: `${base}/apps.html`, page: "apps" },
  { label: "Books", href: `${base}/books.html`, page: "books" },
  { label: "Videos", href: `${base}/videos.html`, page: "videos" },
  { label: "Freebies", href: `${base}/freebies.html`, page: "freebies" },
  { label: "Login", href: `${base}/app-login.html`, page: "app-login" }
];

const footerLinks = [
  { label: "Privacy Policy", href: `${base}/privacy.html` },
  { label: "Contact", href: `${base}/contact.html` },
  { label: "Login", href: `${base}/app-login.html` },
  { label: "Apps", href: `${base}/apps.html` },
  { label: "Books", href: `${base}/books.html` },
  { label: "Videos", href: `${base}/videos.html` },
  { label: "Freebies", href: `${base}/freebies.html` }
];

function createHeader() {
  const headerHost = document.querySelector("[data-site-header]");
  if (!headerHost) return;

  const linkMarkup = navLinks
    .map(
      (link) => `
        <a href="${link.href}" class="${activePage === link.page ? "is-active" : ""}">
          ${link.label}
        </a>
      `
    )
    .join("");

  headerHost.innerHTML = `
    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="${base}/index.html" aria-label="ZenPath Studios home">
          <span class="brand__mark">ZP</span>
          <span class="brand__text">
            <span class="brand__name">ZenPath Studios</span>
            <span class="brand__tag">Real tools for real life</span>
          </span>
        </a>

        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round">
            <path d="M4 7h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 17h16"></path>
          </svg>
          <span class="sr-only">Toggle navigation</span>
        </button>

        <nav id="site-nav" class="nav__links" aria-label="Primary">
          ${linkMarkup}
        </nav>
      </div>
    </header>
  `;
}

function createFooter() {
  const footerHost = document.querySelector("[data-site-footer]");
  if (!footerHost) return;

  const footerLinkMarkup = footerLinks
    .map((link) => `<a href="${link.href}">${link.label}</a>`)
    .join("");

  footerHost.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__links" aria-label="Footer links">
            ${footerLinkMarkup}
          </div>
        </div>
        <div class="footer__bottom">&copy; ZenPath Studios</div>
      </div>
    </footer>
  `;
}

function setupNavigation() {
  const button = document.querySelector(".nav__toggle");
  const nav = document.querySelector(".nav__links");

  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function setupAutoReel() {
  const reel = document.querySelector("[data-auto-reel]");
  if (!reel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let isPaused = false;
  let autoScroll;

  const scrollCardWidth = () => {
    const firstCard = reel.querySelector(".showcase-card");
    if (!firstCard) return 0;
    const cardStyles = window.getComputedStyle(reel);
    const gap = Number.parseFloat(cardStyles.columnGap || cardStyles.gap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  const step = () => {
    if (isPaused) return;

    const distance = scrollCardWidth();
    if (!distance) return;

    const maxScroll = reel.scrollWidth - reel.clientWidth;
    const next = reel.scrollLeft + distance;

    reel.scrollTo({
      left: next >= maxScroll ? 0 : next,
      behavior: "smooth"
    });
  };

  autoScroll = window.setInterval(step, 4200);

  ["mouseenter", "focusin", "touchstart"].forEach((eventName) => {
    reel.addEventListener(eventName, () => {
      isPaused = true;
    });
  });

  ["mouseleave", "focusout"].forEach((eventName) => {
    reel.addEventListener(eventName, () => {
      isPaused = false;
    });
  });

  window.addEventListener("beforeunload", () => {
    window.clearInterval(autoScroll);
  });
}

createHeader();
createFooter();
setupNavigation();
setupAutoReel();
