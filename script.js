(() => {
  "use strict";

  const projects = [
    {
      name: "Orbit",
      category: "Productivity / In development",
      description:
        "A personal organization system for tasks, finances, goals and the moving parts of everyday life.",
      preview: "orbit",
      tags: ["Tasks", "Finances", "Goals", "Everyday tracking"],
      url: "https://orbit.tooutdo.com/",
    },
  ];

  const media = {
    mobile: window.matchMedia("(max-width: 820px)"),
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)"),
    pointer: window.matchMedia("(hover: hover) and (pointer: fine)"),
    short: window.matchMedia("(max-height: 700px)"),
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const canUsePointer = () =>
    media.pointer.matches && !media.mobile.matches && !media.reduced.matches;

  function projectUrl(value) {
    if (!value || value === "#") return null;
    try {
      const complete = /^[a-z][a-z\d+.-]*:/i.test(value)
        ? value
        : `https://${value}`;
      const url = new URL(complete);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function renderProjects(list) {
    if (!list) return;
    const fragment = document.createDocumentFragment();

    projects.forEach((project, index) => {
      const article = document.createElement("article");
      article.className = "project-panel reveal";
      article.innerHTML = `
        <div class="project-panel__info">
          <span class="project-panel__eyebrow"><i aria-hidden="true"></i><span data-project-category></span></span>
          <h3 data-project-name></h3>
          <p data-project-description></p>
          <span class="project-panel__foot"><span aria-hidden="true"></span><span data-project-number></span></span>
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
        </div>
        <button class="project-panel__trigger" type="button"></button>`;

      const title = article.querySelector("[data-project-name]");
      title.id = `project-title-${index + 1}`;
      title.textContent = project.name;
      article.querySelector("[data-project-category]").textContent =
        project.category;
      article.querySelector("[data-project-description]").textContent =
        project.description;
      article.querySelector("[data-project-number]").textContent =
        `Project ${String(index + 1).padStart(2, "0")}`;

      const trigger = article.querySelector(".project-panel__trigger");
      trigger.setAttribute("aria-label", `Preview ${project.name}`);
      trigger.dataset.projectIndex = String(index);

      if (project.preview !== "orbit") {
        const preview = article.querySelector(".orbit-preview");
        const mark = document.createElement("img");
        mark.src = "assets/logo-mark.svg";
        mark.alt = "";
        mark.width = 180;
        mark.height = 180;
        mark.loading = "lazy";
        preview.className = "project-preview-mark";
        preview.replaceChildren(mark);
      }
      fragment.append(article);
    });

    list.replaceChildren(fragment);
  }

  function setupNavigation() {
    const header = document.getElementById("site-header");
    const menu = document.getElementById("nav-links");
    const toggle = document.querySelector(".menu-toggle");
    const main = document.getElementById("main");
    const footer = document.querySelector(".footer");
    if (!header || !menu || !toggle || !main || !footer) return;

    let open = false;
    const setMenu = (next, restoreFocus = true) => {
      if (open === next) return;
      open = next;
      document.documentElement.classList.toggle("menu-open", open);
      document.body.classList.toggle("menu-open", open);
      main.inert = open;
      footer.inert = open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) menu.querySelector("a")?.focus({ preventScroll: true });
      else if (restoreFocus) toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener("click", () => setMenu(!open));
    menu.addEventListener("click", (event) => {
      const link =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || !open) return;
      setMenu(false, false);
      const section = link.hash && document.getElementById(link.hash.slice(1));
      if (!section) return;
      const target = section.querySelector("h1, h2") || section;
      target.tabIndex = -1;
      window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    });

    document.addEventListener("keydown", (event) => {
      if (!open) return;
      if (event.key === "Escape") {
        setMenu(false);
        return;
      }
      if (event.key !== "Tab") return;
      const brand = header.querySelector(".brand");
      const focusable = [
        ...(brand ? [brand] : []),
        ...menu.querySelectorAll("a"),
        toggle,
      ];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    media.mobile.addEventListener("change", () => {
      if (!media.mobile.matches) setMenu(false, false);
    });
  }

  function setupProjectDialog(list) {
    const dialog = document.getElementById("project-dialog");
    if (!list || !dialog) return;
    const name = dialog.querySelector("[data-dialog-name]");
    const category = dialog.querySelector("[data-dialog-category]");
    const description = dialog.querySelector("[data-dialog-description]");
    const tags = dialog.querySelector("[data-dialog-tags]");
    const link = dialog.querySelector(".project-dialog__link");
    const close = dialog.querySelector(".project-dialog__close");
    if (!name || !category || !description || !tags || !link || !close) return;

    list.addEventListener("click", (event) => {
      const trigger =
        event.target instanceof Element
          ? event.target.closest(".project-panel__trigger")
          : null;
      if (!trigger) return;
      const project = projects[Number(trigger.dataset.projectIndex)];
      if (!project) return;

      name.textContent = project.name;
      category.textContent = `TOOUTDO / ${project.category}`;
      description.textContent = project.description;
      tags.replaceChildren(
        ...(project.tags || []).map((text) => {
          const chip = document.createElement("span");
          chip.textContent = text;
          return chip;
        }),
      );
      const url = projectUrl(project.url);
      link.hidden = !url;
      if (url) link.href = url;
      link.textContent = `Visit ${project.name} ↗`;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else if (url) window.location.assign(url);
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function setupReveals() {
    const items = document.querySelectorAll(".reveal");
    const cta = document.querySelector(".cta");
    if (media.reduced.matches || !window.IntersectionObserver) {
      items.forEach((item) => item.classList.add("is-visible"));
      cta?.classList.add("is-visible");
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
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    items.forEach((item) => observer.observe(item));

    if (!cta) return;
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        cta.classList.add("is-visible");
        ctaObserver.disconnect();
      },
      { threshold: 0.2 },
    );
    ctaObserver.observe(cta);
  }

  function setupScrollStory(metrics) {
    const header = document.getElementById("site-header");
    const hero = document.querySelector(".hero");
    const symbol = document.getElementById("hero-symbol");
    const section = document.querySelector(".discovery");
    const rail = document.querySelector(".discovery__rail");
    const track = document.getElementById("discovery-track");
    const progress = document.getElementById("discovery-progress");
    if (!header || !hero || !symbol || !section || !rail || !track || !progress)
      return;

    let layoutFrame = 0;
    let scrollFrame = 0;
    let sectionTop = 0;
    let sectionTravel = 1;
    let trackShift = 0;
    let railTravel = 1;
    let horizontal = false;
    let lastProgress = -1;

    function updateScroll() {
      scrollFrame = 0;
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 38);
      const ratio = horizontal
        ? clamp((y - sectionTop) / sectionTravel, 0, 1)
        : clamp(rail.scrollLeft / railTravel, 0, 1);
      if (Math.abs(ratio - lastProgress) > 0.001) {
        if (horizontal)
          track.style.transform = `translate3d(${-ratio * trackShift}px, 0, 0)`;
        progress.style.transform = `scaleX(${ratio})`;
        lastProgress = ratio;
      }
      if (
        !media.reduced.matches &&
        !media.mobile.matches &&
        y <= metrics.heroHeight + 100
      ) {
        symbol.style.setProperty(
          "--hero-scale",
          (1 - clamp(y / metrics.heroHeight, 0, 1) * 0.09).toFixed(3),
        );
      }
    }

    function measureLayout() {
      layoutFrame = 0;
      metrics.heroHeight = Math.max(1, hero.offsetHeight);
      trackShift = Math.max(0, track.scrollWidth - rail.clientWidth);
      railTravel = Math.max(1, rail.scrollWidth - rail.clientWidth);
      horizontal =
        !media.mobile.matches &&
        !media.reduced.matches &&
        !media.short.matches &&
        trackShift > 0;
      section.classList.toggle("is-horizontal", horizontal);
      rail.tabIndex = horizontal ? -1 : 0;

      if (horizontal) {
        const travel = Math.max(trackShift * 1.1, window.innerHeight * 0.8);
        section.style.height = `${Math.ceil(window.innerHeight + travel)}px`;
        sectionTop = section.getBoundingClientRect().top + window.scrollY;
        sectionTravel = Math.max(1, section.offsetHeight - window.innerHeight);
      } else {
        section.style.height = "";
        track.style.transform = "";
      }
      lastProgress = -1;
      updateScroll();
    }

    const scheduleLayout = () => {
      if (!layoutFrame)
        layoutFrame = window.requestAnimationFrame(measureLayout);
    };
    const scheduleScroll = () => {
      if (!scrollFrame)
        scrollFrame = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleLayout, { passive: true });
    rail.addEventListener("scroll", scheduleScroll, { passive: true });
    media.mobile.addEventListener("change", scheduleLayout);
    media.short.addEventListener("change", scheduleLayout);
    media.reduced.addEventListener("change", () => {
      symbol.style.removeProperty("--hero-scale");
      scheduleLayout();
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(scheduleLayout);
      observer.observe(hero);
      observer.observe(track);
    }
    document.fonts?.ready.then(scheduleLayout);
    measureLayout();
  }

  function setupHeroPointer(metrics) {
    const hero = document.querySelector(".hero");
    const symbol = document.getElementById("hero-symbol");
    if (!hero || !symbol) return;
    let frame = 0;
    let idleTimer = 0;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
      window.clearTimeout(idleTimer);
      symbol.style.setProperty("--hero-rotate", "0deg");
      symbol.style.setProperty("--hero-burst", "0px");
    };

    hero.addEventListener(
      "pointermove",
      (event) => {
        if (!canUsePointer()) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          const x = clamp(pointerX / window.innerWidth, 0, 1);
          const y = clamp(
            (pointerY + window.scrollY) / metrics.heroHeight,
            0,
            1,
          );
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
          idleTimer = window.setTimeout(reset, 420);
        });
      },
      { passive: true },
    );
    hero.addEventListener("pointerleave", reset);
    media.reduced.addEventListener("change", reset);
    media.mobile.addEventListener("change", reset);
  }

  function setupPointer() {
    const root = document.documentElement;
    const cursor = document.querySelector(".cursor");
    if (!cursor) return;
    const magnetic = document.querySelectorAll(".magnetic");
    let frame = 0;
    let x = -100;
    let y = -100;
    let visible = false;
    let kind = "";

    const updateMode = () => {
      root.classList.toggle("has-pointer", canUsePointer());
      if (!canUsePointer()) {
        cursor.style.opacity = "0";
        visible = false;
        kind = "";
        magnetic.forEach((item) => {
          item.style.transform = "";
        });
      }
    };
    updateMode();
    media.mobile.addEventListener("change", updateMode);
    media.reduced.addEventListener("change", updateMode);
    media.pointer.addEventListener("change", updateMode);

    document.addEventListener(
      "pointermove",
      (event) => {
        if (!canUsePointer()) return;
        x = event.clientX;
        y = event.clientY;
        const target = event.target instanceof Element ? event.target : null;
        const nextKind = target?.closest(".project-panel")
          ? "project"
          : target?.closest("a, button")
            ? "link"
            : "default";
        if (nextKind !== kind) {
          cursor.classList.toggle("is-project", nextKind === "project");
          cursor.classList.toggle("is-link", nextKind === "link");
          kind = nextKind;
        }
        if (!visible) {
          cursor.style.opacity = "1";
          visible = true;
        }
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${x - 35}px, ${y - 35}px, 0)`;
          frame = 0;
        });
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => {
      cursor.style.opacity = "0";
      visible = false;
    });

    magnetic.forEach((item) => {
      let bounds;
      let motionFrame = 0;
      let pointerX = 0;
      let pointerY = 0;
      item.addEventListener("pointerenter", () => {
        if (canUsePointer()) bounds = item.getBoundingClientRect();
      });
      item.addEventListener(
        "pointermove",
        (event) => {
          if (!canUsePointer() || !bounds) return;
          pointerX = event.clientX;
          pointerY = event.clientY;
          if (motionFrame) return;
          motionFrame = window.requestAnimationFrame(() => {
            const dx = pointerX - (bounds.left + bounds.width / 2);
            const dy = pointerY - (bounds.top + bounds.height / 2);
            item.style.transform = `translate3d(${dx * 0.12}px, ${dy * 0.12}px, 0)`;
            motionFrame = 0;
          });
        },
        { passive: true },
      );
      item.addEventListener("pointerleave", () => {
        if (motionFrame) window.cancelAnimationFrame(motionFrame);
        motionFrame = 0;
        bounds = null;
        item.style.transform = "";
      });
    });
  }

  function init() {
    document.documentElement.classList.add("has-js");
    renderProjects(document.getElementById("projects-list"));
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    if (media.reduced.matches)
      document.documentElement.classList.add("is-ready");
    else
      window.setTimeout(
        () => document.documentElement.classList.add("is-ready"),
        1150,
      );

    setupNavigation();
    setupProjectDialog(document.getElementById("projects-list"));
    setupReveals();
    const metrics = { heroHeight: 1 };
    setupScrollStory(metrics);
    setupHeroPointer(metrics);
    setupPointer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
