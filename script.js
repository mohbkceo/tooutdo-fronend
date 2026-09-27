"use strict";

const projects = [
  {
    name: "Orbit",
    category: "Productivity / In development",
    description:
      "A personal organization system for tasks, finances, goals and the moving parts of everyday life.",
    url: "orbit.tooutdo.com",
  },
];

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const touchPointer = window.matchMedia("(hover: none), (pointer: coarse)");

function renderProjects() {
  const list = document.getElementById("projects-list");
  if (!list) return;

  const fragment = document.createDocumentFragment();
  projects.forEach((project, index) => {
    const article = document.createElement("article");
    article.className = "project-panel reveal";
    article.setAttribute(
      "aria-label",
      `View ${project.name} project preview, ${project.category}`,
    );
    article.setAttribute("role", "button");
    article.setAttribute("tabindex", "0");
    article.innerHTML = `
      <div class="project-panel__info">
        <span class="project-panel__eyebrow"><i aria-hidden="true"></i>${project.category}</span>
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <span class="project-panel__foot"><span aria-hidden="true"></span> Project ${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="project-panel__visual" aria-hidden="true">
        <div class="orbit-preview">
          <span class="orbit-preview__ring"></span><span class="orbit-preview__ring"></span><span class="orbit-preview__ring"></span>
          <div class="orbit-preview__device">
            <div class="orbit-ui">
              <div class="orbit-ui__top"><span>orbit<span class="orbit-ui__period">.</span></span><span></span></div>
              <div class="orbit-ui__label">Today, in focus</div>
              <div class="orbit-ui__row"><i></i> Make space for what matters</div>
              <div class="orbit-ui__row"><i></i> Review weekly goals</div>
              <div class="orbit-ui__row"><i></i> Plan the next move</div>
              <div class="orbit-ui__chart"></div>
            </div>
          </div>
        </div>
        <span class="project-panel__hover">In the<br>works ↗</span>
      </div>`;
    fragment.appendChild(article);
    const open = () => {
      if (project.url && project.url !== "#") {
        window.location.href = project.url;
      } else {
        document.getElementById("project-dialog").showModal();
      }
    };
    article.addEventListener("click", open);
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
  list.appendChild(fragment);
}

function initLoader() {
  root.classList.add("has-js");
  if (reducedMotion.matches) {
    root.classList.add("is-ready");
    return;
  }
  window.setTimeout(() => root.classList.add("is-ready"), 1150);
}

function initNavigation() {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("nav-links");
  let menuOpen = false;

  const setMenu = (open) => {
    menuOpen = open;
    document.body.classList.toggle("menu-open", open);
    document.querySelector("main").inert = open;
    document.querySelector("footer").inert = open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) menu.querySelector("a")?.focus();
    else toggle.focus();
  };

  toggle.addEventListener("click", () => setMenu(!menuOpen));
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      if (menuOpen) setMenu(false);
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false);
  });
  window
    .matchMedia("(min-width: 621px)")
    .addEventListener("change", (event) => {
      if (event.matches && menuOpen) setMenu(false);
    });

  let ticking = false;
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 38);
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );
  updateHeader();
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
  );
  items.forEach((item) => observer.observe(item));

  const cta = document.querySelector(".cta");
  const ctaObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        cta.classList.add("is-visible");
        ctaObserver.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  ctaObserver.observe(cta);
}

function initHero() {
  const hero = document.querySelector(".hero");
  const symbol = document.getElementById("hero-symbol");
  if (reducedMotion.matches || touchPointer.matches) return;
  let heroHeight = hero.offsetHeight;
  window.addEventListener(
    "resize",
    () => {
      heroHeight = hero.offsetHeight;
    },
    { passive: true },
  );

  let idleTimer;
  hero.addEventListener(
    "pointermove",
    (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      hero.style.setProperty("--cursor-x", `${(x * 100).toFixed(1)}%`);
      hero.style.setProperty("--cursor-y", `${(y * 100).toFixed(1)}%`);
      symbol.style.setProperty(
        "--hero-rotate",
        `${((x - 0.5) * 13).toFixed(2)}deg`,
      );
      symbol.style.setProperty(
        "--hero-burst",
        `${-Math.round(8 + Math.abs(x - 0.5) * 15)}px`,
      );
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        symbol.style.setProperty("--hero-rotate", "0deg");
        symbol.style.setProperty("--hero-burst", "0px");
      }, 420);
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    symbol.style.setProperty("--hero-rotate", "0deg");
    symbol.style.setProperty("--hero-burst", "0px");
  });

  let scrollScheduled = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(() => {
        const progress = Math.min(1, window.scrollY / Math.max(1, heroHeight));
        symbol.style.setProperty(
          "--hero-scale",
          (1 - progress * 0.09).toFixed(3),
        );
        scrollScheduled = false;
      });
    },
    { passive: true },
  );
}

function initDiscovery() {
  const section = document.querySelector(".discovery");
  const rail = document.querySelector(".discovery__rail");
  const track = document.getElementById("discovery-track");
  const progressBar = document.getElementById("discovery-progress");
  if (!section || !track) return;

  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (window.innerWidth <= 620 || reducedMotion.matches) {
      track.style.transform = "";
      const railTravel = Math.max(1, rail.scrollWidth - rail.clientWidth);
      progressBar.style.width = `${Math.min(1, rail.scrollLeft / railTravel) * 100}%`;
      return;
    }
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, -rect.top / travel));
    const maxShift = Math.max(0, track.scrollWidth - window.innerWidth + 52);
    track.style.transform = `translate3d(${-ratio * maxShift}px,0,0)`;
    progressBar.style.width = `${ratio * 100}%`;
  };
  const schedule = () => {
    if (!scheduled) {
      window.requestAnimationFrame(update);
      scheduled = true;
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  rail.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener("change", schedule);
  schedule();
}

function initPointer() {
  if (touchPointer.matches || reducedMotion.matches) return;
  const cursor = document.querySelector(".cursor");
  const label = cursor.querySelector(".cursor__label");
  let x = -100;
  let y = -100;
  let raf = 0;
  const render = () => {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    raf = 0;
  };
  document.addEventListener(
    "pointermove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.style.opacity = "1";
      if (!raf) raf = window.requestAnimationFrame(render);
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    cursor.style.opacity = "0";
  });
  document.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("pointerenter", () =>
      cursor.classList.add("is-link"),
    );
    item.addEventListener("pointerleave", () =>
      cursor.classList.remove("is-link"),
    );
  });
  document.querySelectorAll(".project-panel").forEach((item) => {
    item.addEventListener("pointerenter", () => {
      label.textContent = "VIEW";
      cursor.classList.add("is-project");
    });
    item.addEventListener("pointerleave", () =>
      cursor.classList.remove("is-project"),
    );
  });
  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener(
      "pointermove",
      (event) => {
        const rect = item.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        item.style.transform = `translate3d(${dx * 0.12}px,${dy * 0.12}px,0)`;
      },
      { passive: true },
    );
    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
}

function initProjectDialog() {
  const dialog = document.getElementById("project-dialog");
  const close = dialog.querySelector(".project-dialog__close");
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

renderProjects();
initLoader();
initNavigation();
initReveals();
initHero();
initDiscovery();
initProjectDialog();
initPointer();
document.getElementById("year").textContent = new Date().getFullYear();
