/* ==========================================================================
   WhizzIT — Global JavaScript
   One file for every page. Each initialiser looks for its component and
   returns early when the page does not use it. Content never depends on
   this file: it enhances navigation, tabs, filters, forms and motion.
   ========================================================================== */

document.documentElement.classList.replace("no-js", "js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopNav = window.matchMedia("(min-width: 1100px)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

document.addEventListener("DOMContentLoaded", () => {
  initStuckHeader();
  initHeader();
  initMegaMenu();
  initMobileNavigation();
  initTabs();
  initServiceIndex();
  initFilters();
  initRails();
  initQuotes();
  initCarousels();
  initCounters();
  initRevealAnimations();
  initServiceStage();
  initOnView();
  initTilt();
  initSectorPreview();
  initHScroll();
  initSectorPage();
  initLibrary();
  initCoverageMap();
  initAboutFilm();
  initForms();
});


/* Where the header ends on screen once it has stuck: its sticky offset (negative
   on desktop, where the contact strip scrolls away above the edge; pushed down
   by WordPress's admin bar when logged in) plus its height. Published as
   --stuck-h for everything that sticks beneath it. */
function stuckHeaderHeight() {
  const header = document.querySelector(".site-header");
  if (!header) return 0;
  return Math.max(0, (parseFloat(getComputedStyle(header).top) || 0) + header.offsetHeight);
}

function initStuckHeader() {
  const set = () => document.documentElement.style.setProperty("--stuck-h", `${stuckHeaderHeight()}px`);
  set();
  window.addEventListener("resize", set);
}

/* Sticky header: observe a 1px sentinel instead of listening to scroll */
function initHeader() {
  const header = document.querySelector("[data-header]");
  const sentinel = document.querySelector("[data-header-sentinel]");
  if (!header || !sentinel || !("IntersectionObserver" in window)) return;

  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
  }).observe(sentinel);
}


/* Desktop mega menu. Each label is a link to its overview page; the chevron
   button beside it opens the panel on click or keyboard, and mouse users get
   hover intent on the whole item. */
function initMegaMenu() {
  const triggers = [...document.querySelectorAll("[data-mega-trigger]")];
  if (!triggers.length) return;

  let openTrigger = null;
  let hoverTimer;

  const panelFor = (trigger) => document.getElementById(trigger.getAttribute("aria-controls"));

  const close = (trigger = openTrigger, { restoreFocus = false } = {}) => {
    if (!trigger) return;
    trigger.setAttribute("aria-expanded", "false");
    trigger.closest("li").classList.remove("is-open");
    panelFor(trigger)?.classList.remove("is-open");
    if (restoreFocus) trigger.focus();
    if (openTrigger === trigger) openTrigger = null;
  };

  const open = (trigger) => {
    if (openTrigger && openTrigger !== trigger) close(openTrigger);
    trigger.setAttribute("aria-expanded", "true");
    trigger.closest("li").classList.add("is-open");
    panelFor(trigger)?.classList.add("is-open");
    openTrigger = trigger;
  };

  triggers.forEach((trigger) => {
    const item = trigger.closest("li");
    const panel = panelFor(trigger);
    const link = item.querySelector("[data-mega-link]");

    trigger.addEventListener("click", () => {
      trigger.getAttribute("aria-expanded") === "true" ? close(trigger) : open(trigger);
    });

    // Down arrow from the label or the chevron opens the panel at its first link.
    [trigger, link].forEach((el) => el?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open(trigger);
        panel?.querySelector(FOCUSABLE)?.focus();
      }
    }));

    // Close when focus leaves the whole menu item
    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) close(trigger);
    });

    // Hover intent — mouse users only, small delay avoids flicker
    item.addEventListener("mouseenter", () => {
      if (!finePointer.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => open(trigger), 90);
    });

    item.addEventListener("mouseleave", () => {
      if (!finePointer.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => close(trigger), 180);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && openTrigger) close(openTrigger, { restoreFocus: true });
  });

  document.addEventListener("click", (event) => {
    if (openTrigger && !openTrigger.closest("li").contains(event.target)) close(openTrigger);
  });

  desktopNav.addEventListener("change", () => close());
}


/* Mobile drawer: focus trap, Escape to close, focus restored on close */
function initMobileNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const drawer = document.getElementById(toggle?.getAttribute("aria-controls"));
  if (!toggle || !drawer) return;

  const panel = drawer.querySelector(".mobile-nav__panel");
  const outside = [...document.querySelectorAll("body > :not(.mobile-nav):not(script)")];

  const setOpen = (isOpen) => {
    drawer.classList.toggle("is-open", isOpen);
    drawer.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-locked", isOpen);
    outside.forEach((el) => (el.inert = isOpen));

    if (isOpen) {
      drawer.querySelector("button[data-menu-close]")?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => setOpen(true));
  drawer.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", () => setOpen(false)));

  drawer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
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

  // Accordion groups inside the drawer
  drawer.querySelectorAll("[data-accordion-trigger]").forEach((button) => {
    const region = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      region.hidden = expanded;
    });
  });

  desktopNav.addEventListener("change", (event) => {
    if (event.matches && drawer.classList.contains("is-open")) setOpen(false);
  });
}


/* Tabs: WAI-ARIA pattern with roving tabindex. Without JS all panels show. */
function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const tabList = [...tabs.querySelectorAll('[role="tab"]')];
    const panels = tabList.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

    // A vertical list (the IT services explorer) moves with Up/Down as well, and
    // can carry an indicator that slides to the selected tab.
    const vertical = tabs.querySelector('[role="tablist"]')?.getAttribute("aria-orientation") === "vertical";
    const indicator = tabs.querySelector(".explorer__indicator");
    let current = -1;

    const place = () => {
      if (!indicator || current < 0) return;
      const tab = tabList[current];
      indicator.style.transform = `translateY(${tab.offsetTop}px)`;
      indicator.style.height = `${tab.offsetHeight}px`;
    };

    const select = (index, focus = false) => {
      current = index;
      tabList.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      place();
      if (focus) tabList[index].focus();
    };

    if (indicator) {
      window.addEventListener("resize", place);
      // Placed without a transition first, so it does not slide in from the top on load.
      requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.add("is-ready")));
    }

    tabList.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i));
      tab.addEventListener("keydown", (event) => {
        const keys = vertical
          ? { ArrowDown: i + 1, ArrowUp: i - 1, ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabList.length - 1 }
          : { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabList.length - 1 };
        if (!(event.key in keys)) return;
        event.preventDefault();
        select((keys[event.key] + tabList.length) % tabList.length, true);
      });
    });

    select(0);
  });
}


/* Static content filters (blog). Supports ?category= in the URL. */
function initFilters() {
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const chips = [...group.querySelectorAll("[data-filter]")];
    const items = [...document.querySelectorAll(group.dataset.filterTarget)];
    const status = document.querySelector(group.dataset.filterStatus);
    if (!chips.length || !items.length) return;

    const apply = (value) => {
      let shown = 0;
      chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filter === value)));
      items.forEach((item) => {
        const match = value === "all" || item.dataset.category === value;
        item.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });
      if (status) {
        const label = chips.find((chip) => chip.dataset.filter === value)?.textContent.trim();
        status.textContent =
          value === "all" ? `Showing all ${shown} articles` : `Showing ${shown} ${shown === 1 ? "article" : "articles"} in ${label}`;
      }
    };

    chips.forEach((chip) =>
      chip.addEventListener("click", () => {
        apply(chip.dataset.filter);
        const url = new URL(window.location.href);
        chip.dataset.filter === "all" ? url.searchParams.delete("category") : url.searchParams.set("category", chip.dataset.filter);
        history.replaceState(null, "", url);
      })
    );

    const initial = new URLSearchParams(window.location.search).get("category");
    apply(chips.some((chip) => chip.dataset.filter === initial) ? initial : "all");
  });
}


/* Scroll-snap rails: previous / next buttons */
function initRails() {
  document.querySelectorAll("[data-rail-controls]").forEach((controls) => {
    const rail = document.getElementById(controls.dataset.railControls);
    if (!rail) return;
    const step = () => (rail.firstElementChild?.getBoundingClientRect().width || 320) + 24;
    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";

    controls.querySelector("[data-rail-prev]")?.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior }));
    controls.querySelector("[data-rail-next]")?.addEventListener("click", () => rail.scrollBy({ left: step(), behavior }));
  });
}


/* Testimonial slider: dots act as tabs, arrows cycle. Without JS all quotes show. */
function initQuotes() {
  document.querySelectorAll("[data-quotes]").forEach((slider) => {
    const dots = [...slider.querySelectorAll('[role="tab"]')];
    const items = [...slider.querySelectorAll('[role="tabpanel"]')];
    let current = Math.max(0, dots.findIndex((a) => a.getAttribute("aria-selected") === "true"));

    const show = (index) => {
      current = (index + items.length) % items.length;
      dots.forEach((a, i) => a.setAttribute("aria-selected", String(i === current)));
      items.forEach((item, i) => {
        item.removeAttribute("data-hidden");
        item.hidden = i !== current;
      });
    };

    dots.forEach((a, i) => {
      a.addEventListener("click", () => show(i));
      a.addEventListener("keydown", (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1, Home: -current, End: items.length - 1 - current }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        show(current + step);
        dots[current].focus();
      });
    });
    slider.querySelector("[data-quote-prev]")?.addEventListener("click", () => show(current - 1));
    slider.querySelector("[data-quote-next]")?.addEventListener("click", () => show(current + 1));
    show(current);
  });
}


/* Photo carousel: an auto slider on a scroll-snap track, so it also swipes
   natively. Each photo holds for SLIDE_MS while its bar fills, then the next
   slides in; after the last it returns to the first. The timer (and the bar,
   via .is-paused) waits while the mouse is over it, while keyboard focus is in
   it, while it is off screen or the tab is hidden, and carries on after.
   Arrows, bars and swipes start the new photo's time afresh. Timing lives
   here, not in the CSS animation, because reduced motion collapses every
   animation to nothing; there the photo changes without sliding. */
const SLIDE_MS = 5000;

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = [...track.children];
    const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
    const holds = new Set();
    let current = 0;
    let heading = null;
    let timer = null;
    let startedAt = 0;
    let remaining = SLIDE_MS;

    carousel.style.setProperty("--carousel-slide", `${SLIDE_MS}ms`);
    carousel.classList.add("is-auto");

    // Re-applied (with a reflow) even on the same bar, so its fill restarts with the timer.
    const mark = () => dots.forEach((dot, i) => {
      dot.removeAttribute("aria-current");
      if (i !== current) return;
      void dot.offsetWidth;
      dot.setAttribute("aria-current", "true");
    });

    const schedule = () => {
      clearTimeout(timer);
      timer = null;
      if (holds.size) return;
      startedAt = performance.now();
      timer = setTimeout(() => go(current + 1), remaining);
    };

    const restart = () => {
      remaining = SLIDE_MS;
      schedule();
    };

    const go = (index) => {
      current = (index + slides.length) % slides.length;
      heading = current;
      track.scrollTo({ left: slides[current].offsetLeft, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
      mark();
      restart();
    };

    const hold = (reason, on) => {
      if (on === holds.has(reason)) return;
      if (on) {
        holds.add(reason);
        if (timer) remaining = Math.max(0, remaining - (performance.now() - startedAt));
      } else holds.delete(reason);
      carousel.classList.toggle("is-paused", holds.size > 0);
      schedule();
    };

    // Swipes and trackpad scrolls move the track directly; follow them. A slide
    // the carousel is scrolling to itself (heading) is not a swipe, so its
    // in-between positions are ignored until it arrives or a hand takes over.
    let frame;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (heading !== null) {
          if (Math.abs(track.scrollLeft - slides[heading].offsetLeft) < 2) heading = null;
          return;
        }
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (index === current) return;
        current = index;
        mark();
        restart();
      });
    }, { passive: true });
    ["pointerdown", "wheel"].forEach((type) => track.addEventListener(type, () => { heading = null; }, { passive: true }));

    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => go(current - 1));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => go(current + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => go(i)));

    carousel.addEventListener("mouseenter", () => hold("hover", true));
    carousel.addEventListener("mouseleave", () => hold("hover", false));
    // Keyboard focus only: a mouse click on an arrow should not freeze it.
    carousel.addEventListener("focusin", (event) => hold("focus", event.target.matches(":focus-visible")));
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) hold("focus", false);
    });
    document.addEventListener("visibilitychange", () => hold("hidden", document.hidden));

    if (!("IntersectionObserver" in window)) return schedule();
    hold("offscreen", true);
    new IntersectionObserver(([entry]) => {
      // Load the photos still to come, so none arrives blank.
      if (entry.isIntersecting) slides.forEach((slide) => slide.querySelector("img")?.setAttribute("loading", "eager"));
      hold("offscreen", !entry.isIntersecting);
    }, { threshold: 0.35 }).observe(carousel);
  });
}


/* Counters animate only for verified values supplied via data-count */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const render = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    el.textContent = `${el.dataset.prefix || ""}${value.toLocaleString("en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${el.dataset.suffix || ""}`;
  };

  const run = (el) => {
    const target = Number(el.dataset.count);
    if (prefersReducedMotion.matches) return render(el, target);
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      render(el, target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) return counters.forEach(run);

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      }),
    { threshold: 0.6 }
  );
  counters.forEach((el) => observer.observe(el));
}


/* Scroll reveal.
   Sections are tagged here rather than in the markup so every page gets the same
   treatment without 100 templates repeating the attribute. A section reveals as
   two kinds of unit: its own blocks (heading, intro, call to action) and, where a
   block is a grid of cards, the cards inside it, so a row cascades instead of
   arriving as one slab.

   Timing follows the rest of the site: opacity and transform only, one custom
   ease, ~500ms, and a short stagger that stops compounding after five steps so a
   twelve-card grid never takes a second to finish. Each element reveals once and
   is then unobserved. Nothing here is required to read the page: without JS, and
   under prefers-reduced-motion, everything is simply visible. */

// Blocks whose children should cascade rather than arrive together.
const REVEAL_GROUPS = [
  ".svc-list", ".case-grid", ".project-grid", ".sector-cards", ".sector-directory", ".value-grid",
  ".people-grid", ".cred-grid", ".review-wall", ".review-grid", ".insight-grid",
  ".detail-grid", ".sub-grid", ".story-list", ".post-grid", ".stat-band__grid",
  ".card-grid", ".check-grid", ".step-list", ".location-grid", ".logo-row",
  ".cred-badges", ".client-wall", ".film-values__grid", ".film-team__grid", ".film-figures__grid", ".cov-steps",
  ".proof-bento", ".pricing-boxes",
].join(",");

const REVEAL_STAGGER_CAP = 5;

function markRevealTargets() {
  document.querySelectorAll("section.section, section.block").forEach((section) => {
    if (section.closest(".hero") || section.hasAttribute("data-no-reveal")) return;

    const scope = section.querySelector(":scope > .container") || section;

    // Long-form reading content is left alone. Revealing an article or a privacy
    // policy a paragraph at a time makes it harder to read, not more alive.
    if (scope.matches(".prose, .article-body, .container--copy")) return;

    let index = 0;

    const tag = (el) => {
      if (el.hasAttribute("data-reveal") || el.hasAttribute("data-no-reveal")) return;
      // Screen-reader-only and hidden elements have no box, so the observer would
      // never fire for them and would hold the reference for the page's lifetime.
      if (el.hidden || el.classList.contains("visually-hidden")) return;
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--reveal-i", String(Math.min(index, REVEAL_STAGGER_CAP)));
      index += 1;
    };

    [...scope.children].forEach((child) => {
      if (child.matches(REVEAL_GROUPS) && child.children.length > 1) {
        [...child.children].forEach(tag);
      } else {
        tag(child);
      }
    });
  });
}

function initRevealAnimations() {
  markRevealTargets();

  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        // Reveal on entry, or if the element is already above the viewport. The
        // second case matters: the bottom rootMargin below leaves a band that a
        // jump — an anchor link, End, dragging the scrollbar — can skip straight
        // over, which would strand that content invisible for good.
        const passed = entry.rootBounds && entry.boundingClientRect.bottom < entry.rootBounds.top;
        if (!entry.isIntersecting && !passed) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }),
    // threshold 0 rather than a fraction: a section taller than the viewport can
    // never show 8% of itself, so a fractional threshold would leave it hidden.
    { rootMargin: "0px 0px -12% 0px", threshold: 0 }
  );
  items.forEach((el) => observer.observe(el));

  // Safety sweep. An IntersectionObserver only reports threshold crossings, so an
  // element that moves from below the viewport to above it between two frames —
  // a jump to an anchor, End, a flicked scrollbar — is never reported at all and
  // would stay invisible permanently. This catches those. The set only shrinks,
  // and the listener removes itself once it is empty.
  let pending = [...items];
  let queued = false;

  const sweep = () => {
    queued = false;
    pending = pending.filter((el) => {
      if (el.classList.contains("is-visible")) return false;
      if (el.getBoundingClientRect().bottom > 0) return true;
      el.classList.add("is-visible");
      observer.unobserve(el);
      return false;
    });
    if (!pending.length) window.removeEventListener("scroll", onScroll);
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sweep);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}


/* Form UX validation. Server-side validation is still required once a
   backend is connected — this only improves the experience. */
/* Live form sending: the same contract as the current whizzit.co.uk site. The
   form posts its FormData to its action (/api/submit.php) and asks for JSON; any
   reply that is not an error and does not say success:false counts as sent.
   reCAPTCHA v2 is fetched only once someone engages with a form, and revealed
   on the first press of submit; if Google's script cannot load at all, the form
   still posts and the server decides, so an outage never costs a lead. */
const captcha = (() => {
  let started = false;
  let failed = false;
  const ready = () => Boolean(window.grecaptcha && typeof window.grecaptcha.getResponse === "function");
  const load = () => {
    if (started || ready()) return;
    started = true;
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => { failed = true; };
    document.head.append(script);
  };
  // Read this form's own token: getResponse() with no widget id only reads the
  // first widget on the page, and a page can carry two forms.
  const tokenFor = (form) => form.querySelector('textarea[name="g-recaptcha-response"]')?.value || "";
  return { load, ready, tokenFor, failed: () => failed };
})();

function initCaptchaLoading() {
  const rows = [...document.querySelectorAll(".g-recaptcha")];
  if (!rows.length) return;
  const go = () => captcha.load();
  rows.forEach((row) => {
    const form = row.closest("form");
    form?.addEventListener("focusin", go, { passive: true });
    form?.addEventListener("pointerdown", go, { passive: true });
  });
  if (!("IntersectionObserver" in window)) return go();
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      go();
      io.disconnect();
    }
  }, { rootMargin: "600px" });
  rows.forEach((row) => io.observe(row));
}

function sendLive(form) {
  const honeypot = form.querySelector('[name="botcheck"]');
  if (honeypot?.checked) return;

  const row = form.querySelector(".captcha-row");
  const errorBox = form.querySelector(".form-error");
  if (errorBox) errorBox.hidden = true;

  if (row && !captcha.failed()) {
    captcha.load();
    if (!captcha.ready() || !captcha.tokenFor(form)) {
      // First press reveals the check; only a second press without it complains.
      if (row.classList.contains("is-armed")) row.classList.add("has-error");
      row.classList.add("is-armed");
      row.scrollIntoView({ block: "center", behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
      return;
    }
  }
  row?.classList.remove("has-error");

  const button = form.querySelector('[type="submit"]');
  button?.setAttribute("aria-busy", "true");
  if (button) button.disabled = true;

  fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
    .then((r) => r.json().catch(() => ({})).then((data) => r.ok && data.success !== false))
    .then((ok) => {
      if (!ok) throw new Error("rejected");
      const kind = form.querySelector('[name="form_name"]')?.value || "contact";
      (window.dataLayer = window.dataLayer || []).push({ event: "generate_lead", form_name: kind, page_path: location.pathname });
      const success = document.getElementById(form.dataset.success);
      form.reset();
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }
    })
    .catch(() => {
      if (errorBox) errorBox.hidden = false;
    })
    .finally(() => {
      button?.removeAttribute("aria-busy");
      if (button) button.disabled = false;
    });
}

function initForms() {
  initCaptchaLoading();
  document.querySelectorAll("form[data-validate]").forEach((form) => {
    form.noValidate = true;
    let attempted = false;

    const fields = [...form.querySelectorAll("input, select, textarea")].filter((el) => el.willValidate);

    const labelFor = (input) =>
      (form.querySelector(`label[for="${input.id}"]`)?.dataset.name ||
        form.querySelector(`label[for="${input.id}"]`)?.textContent ||
        "this field")
        .replace(/\(optional\)/i, "")
        .trim()
        .toLowerCase();

    const messageFor = (input) => {
      const v = input.validity;
      if (v.valid) return "";
      if (v.valueMissing) {
        if (input.type === "checkbox") return input.dataset.msgRequired || "Tick this box to continue";
        if (input.tagName === "SELECT") return input.dataset.msgRequired || `Choose ${labelFor(input)}`;
        return input.dataset.msgRequired || `Enter your ${labelFor(input)}`;
      }
      if (v.typeMismatch && input.type === "email") return "Enter an email address in the correct format, like name@company.co.uk";
      if (v.patternMismatch && input.type === "tel") return "Enter a phone number using digits, spaces or a leading +";
      if (v.tooShort) return `${labelFor(input)} must be at least ${input.minLength} characters`.replace(/^./, (c) => c.toUpperCase());
      return input.validationMessage;
    };

    const showState = (input) => {
      const field = input.closest(".field") || input.closest(".check");
      const error = field?.querySelector(".field__error");
      const message = messageFor(input);
      field?.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", String(Boolean(message)));
      if (error) error.textContent = message;
      return message;
    };

    fields.forEach((input) => {
      const event = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "blur";
      input.addEventListener(event, () => attempted && showState(input));
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") showState(input);
      });
    });

    form.addEventListener("submit", (event) => {
      attempted = true;
      const summary = form.querySelector("[data-error-summary]");
      const errors = fields.map((input) => ({ input, message: showState(input) })).filter((e) => e.message);

      if (errors.length) {
        event.preventDefault();
        if (summary) {
          summary.hidden = false;
          summary.querySelector("ul").innerHTML = errors
            .map(({ input, message }) => `<li><a href="#${input.id}">${message}</a></li>`)
            .join("");
          summary.focus();
        } else {
          errors[0].input.focus();
        }
        return;
      }

      if (summary) summary.hidden = true;

      if (!form.hasAttribute("data-demo")) {
        event.preventDefault();
        sendLive(form);
        return;
      }

      // Demo mode (the static preview): no backend, so show the success state in place.
      if (form.hasAttribute("data-demo")) {
        event.preventDefault();
        const button = form.querySelector('[type="submit"]');
        button?.setAttribute("aria-busy", "true");
        setTimeout(() => {
          const success = document.getElementById(form.dataset.success);
          form.reset();
          attempted = false;
          button?.removeAttribute("aria-busy");
          if (success) {
            form.hidden = true;
            success.hidden = false;
            success.focus();
          }
        }, 500);
      }
    });

    form.querySelector("[data-error-summary]")?.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      event.preventDefault();
      document.getElementById(link.getAttribute("href").slice(1))?.focus();
    });
  });
}


/* Homepage services stage.
   Follows the reader down the services list: the row crossing the middle of the
   viewport becomes active, its slide takes the stage, and --svc-progress (0 at
   the top of the list, 1 at the bottom) drives the rail and the parallax drift in
   CSS. The scroll listener only exists while the band is on screen, and does its
   work once per frame. Desktop only — below 1024px the stage is hidden and the
   rows simply read as a list. */
function initServiceStage() {
  const band = document.querySelector("[data-service-stage]");
  const list = band?.querySelector(".svc-list");
  if (!band || !list || !("IntersectionObserver" in window)) return;

  const rows = [...list.querySelectorAll(".svc-row")];
  const slides = [...band.querySelectorAll(".svc-stage__slide")];
  const now = band.querySelector(".svc-stage__now");
  const wide = window.matchMedia("(min-width: 1024px)");
  let active = -1;
  let queued = false;

  const update = () => {
    queued = false;
    const mid = window.innerHeight / 2;
    const box = list.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (mid - box.top) / box.height));
    band.style.setProperty("--svc-progress", progress.toFixed(4));

    let index = rows.findIndex((row) => row.getBoundingClientRect().bottom > mid);
    if (index < 0) index = rows.length - 1;
    if (index === active) return;
    active = index;
    rows.forEach((row, i) => row.classList.toggle("is-active", i === index));
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    if (now) now.textContent = String(index + 1).padStart(2, "0");
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  const listen = (on) => {
    const method = on ? "addEventListener" : "removeEventListener";
    window[method]("scroll", onScroll, { passive: true });
    window[method]("resize", onScroll);
  };

  let inView = false;
  const sync = () => {
    const live = inView && wide.matches;
    band.classList.toggle("is-staged", wide.matches);
    listen(live);
    if (live) update();
  };

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }).observe(band);
  wide.addEventListener("change", sync);
}

/* One-off sequences that play the first time their element scrolls into view
   (the About page's value keys). The class only starts the animation: the
   resting state is complete without it, so no-JS and reduced motion lose
   nothing. */
function initOnView() {
  const items = document.querySelectorAll("[data-on-view]");
  if (!items.length) return;

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-on"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-on");
        observer.unobserve(entry.target);
      }),
    { rootMargin: "0px 0px -25% 0px", threshold: 0 }
  );
  items.forEach((el) => observer.observe(el));
}

/* Pointer tilt for the About page's photo stage. Writes three custom
   properties; the CSS turns them into a rotation and a moving sheen. Mouse and
   trackpad only, and never under reduced motion. */
function initTilt() {
  const areas = document.querySelectorAll("[data-tilt]");
  if (!areas.length || !finePointer.matches || prefersReducedMotion.matches) return;

  areas.forEach((area) => {
    let frame = 0;
    const set = (x, y) => {
      area.style.setProperty("--rx", `${(x * 6).toFixed(2)}deg`);
      area.style.setProperty("--ry", `${(y * -5).toFixed(2)}deg`);
      area.style.setProperty("--sheen", `${(x * -40).toFixed(1)}%`);
    };

    area.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = area.getBoundingClientRect();
        set((event.clientX - box.left) / box.width - 0.5, (event.clientY - box.top) / box.height - 0.5);
      });
    });
    area.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      set(0, 0);
    });
  });
}


/* Industries: the sector index. One list of sector tiles (the WordPress
   shortcode's markup) gets a different design per screen:
   - Desktop: each row's photograph is copied into one frame beside the list;
     pointing at or focusing a row wipes its photo in over the last one, and the
     frame itself links to the lit sector.
   - Phone: the tiles are a swipe carousel (CSS); this adds the row of sector
     chips above it, which jump to a sector and follow the swipe.
   Without JS the tiles are simply photo cards. */
function initSectorPreview() {
  const list = document.querySelector("[data-sector-preview]");
  if (!list) return;
  const tiles = [...list.querySelectorAll(".sector-tile")];
  if (!tiles.length) return;

  const titleOf = (tile) => tile.querySelector("h3")?.textContent.trim() || "";
  const linkOf = (tile) => tile.querySelector(".card-link")?.href || "";
  const pad = (n) => String(n).padStart(2, "0");

  /* ---- Desktop frame ---- */
  const frame = document.createElement("div");
  frame.className = "sector-preview";
  frame.setAttribute("aria-hidden", "true");
  frame.style.gridRow = `1 / span ${tiles.length}`;

  const count = document.createElement("span");
  count.className = "sector-preview__count";
  frame.append(count);

  const arrow = tiles[0].querySelector(".read-more svg")?.outerHTML || "";
  const shots = tiles.map((tile) => {
    const shot = document.createElement("figure");
    shot.className = "sector-preview__shot";
    const img = tile.querySelector(".sector-tile__photo img")?.cloneNode(true);
    if (img) {
      img.alt = "";
      img.loading = "lazy";
      img.sizes = "(min-width: 1024px) 40vw, 100vw";
      shot.append(img);
    }
    const caption = document.createElement("figcaption");
    const strong = document.createElement("strong");
    strong.textContent = titleOf(tile);
    const note = document.createElement("span");
    note.textContent = tile.querySelector(".sector-tile__note")?.textContent.trim() || "";
    const go = document.createElement("span");
    go.className = "sector-preview__go";
    go.textContent = tile.querySelector(".read-more")?.textContent.trim() || "";
    go.insertAdjacentHTML("beforeend", arrow);
    caption.append(strong, note, go);
    shot.append(caption);
    frame.append(shot);
    return shot;
  });

  list.append(frame);
  list.classList.add("has-preview");

  // The frame sticks just below the part of the header that stays on screen.
  const header = document.querySelector(".site-header");
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(() => list.style.setProperty("--header-now", `${stuckHeaderHeight()}px`)).observe(header);
  }

  let active = -1;
  const show = (index) => {
    if (index === active) return;
    active = index;
    tiles.forEach((tile, i) => tile.classList.toggle("is-active", i === index));
    shots.forEach((shot, i) => shot.classList.toggle("is-active", i === index));
    count.textContent = `${pad(index + 1)} / ${pad(tiles.length)}`;
  };

  tiles.forEach((tile, i) => {
    tile.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && show(i));
    tile.addEventListener("focusin", () => show(i));
  });
  // The frame is a mouse convenience; keyboard users have the row links.
  frame.addEventListener("click", () => {
    const href = linkOf(tiles[active]);
    if (href) window.location.href = href;
  });
  show(0);

  /* ---- Phone chips ---- */
  const nav = document.createElement("div");
  nav.className = "sector-nav";
  const chips = document.createElement("div");
  chips.className = "sector-nav__chips";
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Jump to a sector");
  const counter = document.createElement("span");
  counter.className = "sector-nav__count";
  counter.setAttribute("aria-hidden", "true");
  nav.append(chips, counter);

  const behavior = () => (prefersReducedMotion.matches ? "auto" : "smooth");
  const buttons = tiles.map((tile, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sector-nav__chip";
    button.textContent = titleOf(tile);
    button.addEventListener("click", () => {
      const band = list.closest("[data-hscroll]");
      if (band?.hscrollTo) band.hscrollTo(i);
      else list.scrollTo({ left: tile.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft), behavior: behavior() });
    });
    chips.append(button);
    return button;
  });
  list.before(nav);

  let current = -1;
  const mark = (index) => {
    if (index === current) return;
    current = index;
    buttons.forEach((button, i) => button.setAttribute("aria-current", String(i === index)));
    counter.innerHTML = `<span>${pad(index + 1)}</span> / ${pad(tiles.length)}`;
    // Keep the lit chip in view without moving the page.
    const chip = buttons[index];
    chips.scrollTo({ left: chip.offsetLeft - chips.clientWidth / 2 + chip.offsetWidth / 2, behavior: behavior() });
  };

  // The pinned band (initHScroll) says which card is in place, whether the row
  // is moved by the page scroll or swiped.
  list.closest("[data-hscroll]")?.addEventListener("hscroll:index", (event) => mark(event.detail.index));
  mark(0);
}

/* Pinned sideways scroll. A band marked [data-hscroll] pins below the header
   (CSS sticky) and is made as tall as its row's overflow, so scrolling down the
   page walks the row ([data-hscroll-track]) from its first item to its last.
   Used for the Industries sector stories (every width) and the sector cards
   (phones, data-hscroll-media).

   The row follows the scroll through a short ease (a lerp per frame) rather
   than jumping with each wheel notch, so a stepped mouse wheel still reads as
   one smooth glide; trackpads and touch, which already scroll smoothly, barely
   see it. Transform only. Items marked [data-hscroll-uncounted] (the closing
   "all stories" card) travel with the row but are not counted. The band
   announces its current item ("hscroll:index") and exposes band.hscrollTo(i),
   which the sector chips use. Under reduced motion, or outside its media
   query, the row is an ordinary swipe rail and the same event follows the
   swipe instead. */
function initHScroll() {
  document.querySelectorAll("[data-hscroll]").forEach(setupHScroll);
}

function setupHScroll(band) {
  const pin = band.querySelector("[data-hscroll-pin]");
  const track = band.querySelector("[data-hscroll-track]");
  if (!pin || !track) return;
  const viewport = band.querySelector("[data-hscroll-viewport]") || pin;
  const bar = band.querySelector("[data-hscroll-bar]");
  const now = band.querySelector("[data-hscroll-now]");
  const header = document.querySelector(".site-header");
  const media = window.matchMedia(band.dataset.hscrollMedia || "all");
  const runway = parseFloat(band.dataset.hscrollRunway) || 1.2;
  const parallax = band.dataset.hscrollParallax || "";

  // Decorative children (the desktop photo frame) are aria-hidden: not items.
  const items = [...track.children].filter((el) => el.getAttribute("aria-hidden") !== "true");
  const counted = items.filter((el) => !el.hasAttribute("data-hscroll-uncounted"));
  const photos = parallax ? items.map((el) => el.querySelector(parallax)) : [];

  let on = false;
  let distance = 0;
  let pinTop = 0;
  let width = 0;
  let inset = 0;
  let stops = [];
  let waypoints = [];
  let centres = [];
  let target = 0;
  let current = 0;
  let frame = 0;
  let shown = -1;

  // The line shows how far through the items you are: one of four is a quarter.
  const fill = (p) => ((1 + p * (counted.length - 1)) / counted.length).toFixed(4);

  const announce = (index) => {
    if (index === shown) return;
    shown = index;
    if (now) now.textContent = String(index + 1).padStart(2, "0");
    band.dispatchEvent(new CustomEvent("hscroll:index", { detail: { index } }));
  };

  // The item whose stop (the travel that brings it to the first item's place)
  // is nearest the current travel.
  const nearest = (x) => {
    let best = 0;
    stops.forEach((stop, i) => {
      if (Math.abs(stop - x) < Math.abs(stops[best] - x)) best = i;
    });
    return best;
  };

  // Read live: fonts and images above can still move the band after load.
  const progress = () => {
    if (!distance) return 0;
    const travelled = pinTop - band.getBoundingClientRect().top;
    return Math.min(1, Math.max(0, travelled / (distance * runway)));
  };

  // Scroll is shared out evenly between the cards. Within each share the row
  // rests on its card for the first and last part and eases across in the
  // middle, so wherever the scroll stops a card is in place, never half-way.
  const DWELL = 0.18;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const travel = (p) => {
    const segments = waypoints.length - 1;
    if (segments < 1) return p * distance;
    const u = Math.min(segments, Math.max(0, p * segments));
    const i = Math.min(segments - 1, Math.floor(u));
    const t = Math.min(1, Math.max(0, (u - i - DWELL) / (1 - 2 * DWELL)));
    return waypoints[i] + (waypoints[i + 1] - waypoints[i]) * easeInOut(t);
  };

  const render = (p) => {
    const x = travel(p);
    track.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
    if (bar) bar.style.transform = `scaleX(${fill(p)})`;
    photos.forEach((img, i) => {
      if (!img) return;
      const offset = (centres[i] + inset - x - width / 2) / width;
      img.style.transform = `translate3d(${(offset * -7).toFixed(2)}%, 0, 0) scale(1.16)`;
    });
    announce(nearest(x));
  };

  const tick = () => {
    current += (target - current) * 0.15;
    if (Math.abs(target - current) < 0.0003) current = target;
    render(current);
    frame = current === target ? 0 : requestAnimationFrame(tick);
  };

  const onScroll = () => {
    if (!on) return;
    target = progress();
    if (!frame) frame = requestAnimationFrame(tick);
  };

  // Outside pinned mode the row scrolls natively; follow it.
  const nativeIndex = () => {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    if (bar) bar.style.transform = `scaleX(${fill(p)})`;
    announce(nearest(track.scrollLeft));
  };

  const measure = () => {
    on = media.matches && !prefersReducedMotion.matches;
    band.classList.toggle("is-pinned", on);
    track.style.transform = "";
    photos.forEach((img) => img && (img.style.transform = ""));
    const first = counted[0];
    stops = counted.map((el) => el.offsetLeft - first.offsetLeft);
    if (!on) {
      band.style.height = "";
      nativeIndex();
      return;
    }
    pinTop = stuckHeaderHeight();
    band.style.setProperty("--pin-top", `${pinTop}px`);
    const vb = viewport.getBoundingClientRect();
    const tb = track.getBoundingClientRect();
    width = viewport.clientWidth;
    inset = tb.left - vb.left;
    distance = Math.max(0, tb.right - vb.right);
    // Items near the end can all reach their place only at the very end of the
    // travel (when several fit on screen at once). Share out that last stretch
    // so each still gets a turn as the current item.
    const k = stops.findIndex((stop) => stop >= distance);
    if (k > 0) {
      const from = stops[k - 1];
      const tail = stops.length - k;
      stops = stops.map((stop, i) => (i < k ? stop : from + ((distance - from) * (i - k + 1)) / tail));
    }
    centres = items.map((el) => el.offsetLeft + el.offsetWidth / 2);
    waypoints = stops[stops.length - 1] < distance - 1 ? [...stops, distance] : [...stops];
    band.style.height = `${pin.offsetHeight + distance * runway}px`;
    target = current = progress();
    render(current);
  };

  // Where the page has to be for item i to sit in the first item's place.
  const scrollFor = (i) => {
    const start = band.getBoundingClientRect().top + window.scrollY - pinTop;
    const segments = Math.max(1, waypoints.length - 1);
    return start + (i / segments) * distance * runway;
  };

  band.hscrollTo = (i) => {
    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";
    if (on) {
      window.scrollTo({ top: scrollFor(i), behavior });
    } else {
      const el = counted[i];
      track.scrollTo({ left: el.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior });
    }
  };

  let queued = false;
  track.addEventListener("scroll", () => {
    if (on || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      nativeIndex();
    });
  }, { passive: true });

  // Tabbing to an item scrolls the page to where it sits in view.
  track.addEventListener("focusin", (event) => {
    if (!on || !distance) return;
    const i = counted.indexOf(event.target.closest("[data-hscroll-track] > *"));
    if (i >= 0) window.scrollTo({ top: scrollFor(i) });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  media.addEventListener("change", measure);
  prefersReducedMotion.addEventListener?.("change", measure);
  // Pins just below the part of the header that stays on screen; re-measured
  // if the header's height changes (a font loading, a breakpoint).
  if (header && "ResizeObserver" in window) new ResizeObserver(measure).observe(header);
  measure();
}

/* Industry pages (sectors.mjs).
   - The "on this page" index marks the section being read: the last one whose
     top has passed a line a third of the way down the screen.
   - The bottom action bar (phones and tablets) slides in once the hero has
     scrolled away and gets out of the way while the callback box or the footer
     is on screen, so it never covers the thing it points to. While hidden it is
     out of the tab order and hidden from assistive tech. */
function initSectorPage() {
  const toc = document.querySelector("[data-sx-toc]");
  if (toc) {
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const targets = links.map((link) => document.getElementById(link.getAttribute("href").slice(1)));
    let current = -1;
    let queued = false;
    const spy = () => {
      queued = false;
      const line = window.innerHeight / 3;
      let index = 0;
      targets.forEach((target, i) => {
        if (target && target.getBoundingClientRect().top <= line) index = i;
      });
      if (index === current) return;
      current = index;
      links.forEach((link, i) => link.setAttribute("aria-current", String(i === index)));
    };
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(spy);
    }, { passive: true });
    spy();
  }

  const dock = document.querySelector("[data-sx-dock]");
  const hero = document.querySelector(".sx-hero");
  if (!dock || !hero || !("IntersectionObserver" in window)) return;

  const actions = [...dock.querySelectorAll("a")];
  const blockers = new Set();
  let pastHero = false;

  const update = () => {
    const show = pastHero && blockers.size === 0;
    dock.classList.toggle("is-shown", show);
    dock.setAttribute("aria-hidden", String(!show));
    actions.forEach((action) => (action.tabIndex = show ? 0 : -1));
  };

  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(hero);

  const watch = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? blockers.add(entry.target) : blockers.delete(entry.target)));
    update();
  });
  [document.getElementById("talk"), document.querySelector(".site-footer")].forEach((el) => el && watch.observe(el));
}

/* Resources: the article library (pages/blog.mjs).
   Works on the cards as printed (the WordPress shortcodes print the same), so
   everything here is enhancement: without JS the page is the full list.

   - Search: instant, every word must match (title, card text or topic), matches
     are highlighted. "/" jumps to it, Escape clears it. Typing never animates
     the grid: it happens many times a second, so the list just updates.
   - Topics: live counts on each chip, and one highlight that glides between
     them. The highlight is a copy of the chip row in its selected colours,
     clipped to the selected chip; animating the clip moves the colour change
     with the highlight instead of switching the text colour on its own.
   - Sort: newest (the listing's own order) or quickest reads first.
   - Topic and sort changes move the cards to their new places with a view
     transition where the browser has one; otherwise, and under reduced motion,
     the list simply updates.
   - The state lives in the address (?category=, ?q=, ?sort=), so a filtered
     view can be shared; ?category= is what the menu's topic links use. */
function initLibrary() {
  const lib = document.querySelector("[data-library]");
  const grid = lib?.querySelector("[data-lib-grid]");
  if (!lib || !grid) return;
  const cards = [...grid.querySelectorAll(".post-card")];
  if (!cards.length) return;

  const bar = lib.querySelector("[data-lib-bar]");
  const searchbox = lib.querySelector("[data-lib-searchbox]");
  const input = lib.querySelector("[data-lib-search]");
  const clear = lib.querySelector("[data-lib-clear]");
  const status = lib.querySelector("[data-lib-status]");
  const empty = lib.querySelector("[data-lib-empty]");
  const emptyQ = lib.querySelector("[data-lib-empty-q]");
  const topicsBox = lib.querySelector("[data-lib-topics]");
  const chips = [...topicsBox.querySelectorAll("[data-filter]")];
  const sorts = [...lib.querySelectorAll("[data-sort]")];

  const norm = (text) => text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[‘’]/g, "'");
  const esc = (text) => text.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';

  /* ---- Index each card once ---- */
  const items = cards.map((card, index) => {
    const link = card.querySelector(".post-card__title a");
    const text = card.querySelector(".post-card__body > p:not(.post-card__meta)");
    const label = card.querySelector(".post-card__meta .tag")?.textContent.trim() || "";
    const minutes = Number((card.querySelector(".post-card__meta")?.textContent.match(/(\d+)\s*min/) || [])[1]) || null;
    const title = link?.textContent.trim() || "";
    const excerpt = text?.textContent.trim() || "";

    // Footer: a reading-length meter (one segment a minute) and the read link.
    const foot = document.createElement("div");
    foot.className = "post-card__foot";
    foot.setAttribute("aria-hidden", "true");
    foot.innerHTML = `${minutes ? `<span class="read-meter" style="--m:${Math.min(minutes, 10)}"></span>` : "<span></span>"}<span class="post-card__go">Read the article ${ARROW}</span>`;
    card.querySelector(".post-card__body")?.append(foot);

    return { card, index, link, text, title, excerpt, label, minutes, category: card.dataset.category || "", haystack: norm(`${title} ${excerpt} ${label}`) };
  });

  // The newest article leads the grid until the list is filtered.
  const latest = document.createElement("span");
  latest.className = "post-card__latest";
  latest.textContent = "Latest article";
  items[0].card.querySelector(".post-card__body")?.prepend(latest);

  input.placeholder = `Search ${items.length} articles`;

  /* ---- Topic chips: counts, then the gliding highlight ---- */
  chips.forEach((chip) => {
    const key = chip.dataset.filter;
    const count = key === "all" ? items.length : items.filter((it) => it.category === key).length;
    // The space keeps the label and count apart for screen readers ("Cloud 6").
    chip.insertAdjacentHTML("beforeend", ` <span class="lib-topic__count">${count}</span>`);
  });
  const lit = document.createElement("div");
  lit.className = "lib-topics__lit";
  lit.setAttribute("aria-hidden", "true");
  chips.forEach((chip) => {
    const copy = document.createElement("span");
    copy.className = "lib-topics__lit-chip";
    copy.innerHTML = chip.innerHTML;
    lit.append(copy);
  });
  topicsBox.append(lit);

  const placeLit = () => {
    const chip = chips.find((c) => c.getAttribute("aria-pressed") === "true") || chips[0];
    const width = lit.offsetWidth;
    const height = lit.offsetHeight;
    const top = chip.offsetTop;
    const left = chip.offsetLeft;
    lit.style.clipPath = `inset(${top}px ${width - left - chip.offsetWidth}px ${height - top - chip.offsetHeight}px ${left}px round 999px)`;
  };

  /* ---- State ---- */
  const params = new URLSearchParams(window.location.search);
  const state = {
    topic: chips.some((c) => c.dataset.filter === params.get("category")) ? params.get("category") : "all",
    q: params.get("q") || "",
    sort: params.get("sort") === "quick" ? "quick" : "new",
  };
  input.value = state.q;

  const topicLabel = () => chips.find((c) => c.dataset.filter === state.topic)?.firstChild?.textContent.trim() || "";

  const highlight = (text, terms) => {
    if (!terms.length) return esc(text);
    const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return esc(text).replace(pattern, "<mark>$1</mark>");
  };

  let statusTimer = 0;
  const writeStatus = (shown, delay) => {
    const n = shown.length;
    const noun = n === 1 ? "article" : "articles";
    const q = state.q.trim();
    let html;
    if (!n) html = `No articles match${q ? ` <strong>“${esc(q)}”</strong>` : ""}${state.topic !== "all" ? ` in ${esc(topicLabel())}` : ""}`;
    else if (state.topic === "all" && !q) html = `Showing all <strong>${n}</strong> ${noun}`;
    else html = `<strong>${n}</strong> ${noun}${state.topic !== "all" ? ` in ${esc(topicLabel())}` : ""}${q ? ` matching <strong>“${esc(q)}”</strong>` : ""}`;
    if (state.sort === "quick" && n) html += ", quickest reads first";
    clearTimeout(statusTimer);
    // While typing, the live region waits for a pause so a screen reader is not
    // read every keystroke.
    statusTimer = setTimeout(() => (status.innerHTML = html), delay);
  };

  let urlTimer = 0;
  const writeUrl = () => {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const url = new URL(window.location.href);
      const set = (key, value, off) => (value && value !== off ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      set("category", state.topic, "all");
      set("q", state.q.trim(), "");
      set("sort", state.sort, "new");
      history.replaceState(null, "", url);
    }, 250);
  };

  const render = (typing) => {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);
    const shown = [];
    items.forEach((it) => {
      const match = (state.topic === "all" || it.category === state.topic) && terms.every((t) => it.haystack.includes(t));
      it.card.hidden = !match;
      if (match) shown.push(it);
      if (it.link) it.link.innerHTML = highlight(it.title, terms);
      if (it.text) it.text.innerHTML = highlight(it.excerpt, terms);
    });

    const order = [...items].sort((a, b) => (state.sort === "quick" ? (a.minutes ?? 99) - (b.minutes ?? 99) || a.index - b.index : a.index - b.index));
    if (order.some((it, i) => grid.children[i] !== it.card)) order.forEach((it) => grid.append(it.card));

    grid.classList.toggle("is-default", state.topic === "all" && !terms.length && state.sort === "new");
    empty.hidden = shown.length > 0;
    if (!shown.length) emptyQ.textContent = state.q.trim() ? `“${state.q.trim()}”` : topicLabel();

    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filter === state.topic)));
    sorts.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.sort === state.sort)));
    searchbox.classList.toggle("has-value", Boolean(state.q));
    placeLit();
    writeStatus(shown, typing ? 450 : 0);
    writeUrl();
  };

  // Topic and sort changes glide the cards to their new places. Names are set
  // only for the length of the transition.
  const reduced = () => prefersReducedMotion.matches;
  const update = (animate) => {
    if (!animate || reduced() || !document.startViewTransition) {
      render(!animate);
      return;
    }
    const visible = items.filter((it) => !it.card.hidden);
    visible.forEach((it) => (it.card.style.viewTransitionName = `post-${it.index}`));
    const transition = document.startViewTransition(() => {
      render(false);
      items.forEach((it) => (it.card.style.viewTransitionName = it.card.hidden ? "" : `post-${it.index}`));
    });
    transition.finished.finally(() => items.forEach((it) => (it.card.style.viewTransitionName = "")));
  };

  // Searching or filtering from the top of the page: the results are below the
  // fold, so bring the toolbar up to where it sticks and the results show under
  // it. Once it is up there this does nothing. The glide is driven frame by
  // frame and re-aims at the toolbar every frame, because each keystroke
  // re-filters the list and changes the page height, which cancels a native
  // smooth scroll. Scrolling by hand stops it at once.
  let revealFrame = 0;
  const stickAt = () => (getComputedStyle(bar).position === "sticky" ? parseFloat(getComputedStyle(bar).top) || 0 : stuckHeaderHeight() + 8);
  const stopReveal = () => {
    cancelAnimationFrame(revealFrame);
    revealFrame = 0;
  };
  const revealResults = () => {
    if (revealFrame) return;
    if (bar.getBoundingClientRect().top <= stickAt() + 1 || grid.getBoundingClientRect().top < window.innerHeight * 0.55) return;
    let lastY = -1;
    const step = () => {
      const gap = bar.getBoundingClientRect().top - stickAt();
      if (Math.abs(gap) < 1 || window.scrollY === lastY) {
        revealFrame = 0;
        return;
      }
      lastY = window.scrollY;
      window.scrollTo({ top: window.scrollY + (reduced() ? gap : gap * 0.2), behavior: "instant" });
      revealFrame = requestAnimationFrame(step);
    };
    revealFrame = requestAnimationFrame(step);
  };
  window.addEventListener("wheel", stopReveal, { passive: true });
  window.addEventListener("touchstart", stopReveal, { passive: true });

  /* ---- Events ---- */
  input.addEventListener("input", () => {
    state.q = input.value;
    update(false);
    revealResults();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (input.value) {
      input.value = "";
      state.q = "";
      update(false);
    } else {
      input.blur();
    }
  });
  clear.addEventListener("click", () => {
    input.value = "";
    state.q = "";
    update(false);
    input.focus();
  });
  chips.forEach((chip) => chip.addEventListener("click", () => {
    if (state.topic === chip.dataset.filter) return;
    state.topic = chip.dataset.filter;
    update(true);
    revealResults();
  }));
  sorts.forEach((btn) => btn.addEventListener("click", () => {
    if (state.sort === btn.dataset.sort) return;
    state.sort = btn.dataset.sort;
    update(true);
    revealResults();
  }));
  lib.querySelector("[data-lib-reset]")?.addEventListener("click", () => {
    input.value = "";
    Object.assign(state, { q: "", topic: "all" });
    update(true);
    input.focus();
  });

  // "/" jumps to the search from anywhere on the page (not while typing).
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    input.focus({ preventScroll: true });
    revealResults();
  });

  // The toolbar sticks just below the header; a deeper shadow once it does.
  const setStick = () => lib.style.setProperty("--lib-stick", `${stuckHeaderHeight()}px`);
  setStick();
  window.addEventListener("resize", () => {
    setStick();
    placeLit();
  });
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const stick = parseFloat(getComputedStyle(bar).top) || 0;
      bar.classList.toggle("is-stuck", getComputedStyle(bar).position === "sticky" && bar.getBoundingClientRect().top <= stick + 0.5);
    });
  }, { passive: true });

  render(false);
  writeStatus(items.filter((it) => !it.card.hidden), 0);
  // The highlight is placed without a transition first, then glides from then on.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    placeLit();
    lit.classList.add("is-ready");
  }));
  document.fonts?.ready.then(placeLit);

  // Arriving on a filtered view (a menu topic link, a shared link): go
  // straight to the library rather than the top of the page.
  if ((params.has("category") || params.has("q")) && !window.location.hash) {
    requestAnimationFrame(() => {
      const top = lib.getBoundingClientRect().top + window.scrollY - stuckHeaderHeight() - 8;
      window.scrollTo({ top, behavior: "auto" });
    });
  }

  /* ---- Hero: the library's titles, drifting behind the headline ---- */
  const titlesHost = document.querySelector("[data-lib-titles]");
  if (titlesHost) {
    const rows = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];
    titlesHost.innerHTML = rows.map((row) => {
      const line = row.map((it) => `<span>${esc(it.title)}</span>`).join("");
      return `<div class="lib-titles__row"><div class="lib-titles__track">${line}</div><div class="lib-titles__track">${line}</div></div>`;
    }).join("");
  }
}

/* Locations: the coverage map (pages/locations.mjs). Pointing at or focusing an
   area in the list lights its pin and route on the map and dims the rest;
   pointing at a pin lights its row in the list, and clicking it opens the area.
   The map's pins are decoration to assistive tech: the list is the navigation. */
function initCoverageMap() {
  const map = document.querySelector("[data-cov-map]");
  const list = document.querySelector("[data-cov-list]");
  if (!map || !list) return;
  const links = [...list.querySelectorAll("a[data-loc]")];
  const pins = [...map.querySelectorAll(".cov-pin[data-loc]")];
  const routes = [...map.querySelectorAll(".cov-route[data-loc]")];

  const set = (key) => {
    map.classList.toggle("has-active", Boolean(key));
    links.forEach((link) => link.classList.toggle("is-active", link.dataset.loc === key));
    pins.forEach((pin) => pin.classList.toggle("is-active", pin.dataset.loc === key));
    routes.forEach((route) => route.classList.toggle("is-active", route.dataset.loc === key));
  };

  links.forEach((link) => {
    link.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && set(link.dataset.loc));
    link.addEventListener("focus", () => set(link.dataset.loc));
    link.addEventListener("blur", () => set(null));
  });
  list.addEventListener("pointerleave", () => set(null));

  pins.forEach((pin) => {
    pin.addEventListener("pointerenter", () => set(pin.dataset.loc));
    pin.addEventListener("pointerleave", () => set(null));
    pin.addEventListener("click", () => {
      const link = links.find((l) => l.dataset.loc === pin.dataset.loc);
      if (link) window.location.href = link.href;
    });
  });
}

/* IT Services: each row of the hero's service index opens that service in the
   explorer below and brings the explorer into view. Without JS the row is a
   plain link to the service's own page. */
function initServiceIndex() {
  const rows = document.querySelectorAll("[data-svc-open]");
  const explorer = document.getElementById("explore");
  if (!rows.length || !explorer) return;
  rows.forEach((row) => row.addEventListener("click", (event) => {
    const tab = document.getElementById(`tab-${row.dataset.svcOpen}`);
    if (!tab) return;
    event.preventDefault();
    tab.click();
    const top = explorer.getBoundingClientRect().top + window.scrollY - stuckHeaderHeight() - 8;
    window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    tab.focus({ preventScroll: true });
  }));
}

/* About: the scroll scenes (pages/about.mjs). Each scene is laid out in full
   without this; here it becomes a tall sticky stage driven by the scroll.
   Transform and clip-path only, written straight onto the element each frame.
   Nothing runs under reduced motion. */
function initAboutFilm() {
  if (prefersReducedMotion.matches) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  /* The window: the team photo opens from a window to the full screen as the
     stage scrolls. Rounded corners from tablet up; square on phones. */
  const win = document.querySelector("[data-film-window]");
  if (win) {
    const stage = win.querySelector(".film-window__stage");
    const frame = win.querySelector(".film-window__frame");
    const img = win.querySelector(".film-window__photo img");
    const phone = window.matchMedia("(max-width: 767.98px)");
    let on = true;
    let queued = false;
    const draw = () => {
      queued = false;
      if (!on) return;
      const box = win.getBoundingClientRect();
      const run = box.height - stage.offsetHeight;
      const p = run > 0 ? clamp((stuckHeaderHeight() - box.top) / run) : 1;
      const open = ease(clamp(p / 0.55));
      const [iy, ix, radius] = phone.matches ? [10, 6, 0] : [16, 20, 28];
      const r = radius * (1 - open);
      frame.style.clipPath = `inset(${(iy * (1 - open)).toFixed(2)}% ${(ix * (1 - open)).toFixed(2)}% round ${r.toFixed(1)}px)`;
      if (img) img.style.transform = `scale(${(1.22 - 0.22 * open).toFixed(4)})`;
      if (p > 0.6) win.classList.add("is-open");
      else if (p < 0.5) win.classList.remove("is-open");
    };
    const sync = () => {
      win.classList.add("is-live");
      draw();
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(draw);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    phone.addEventListener("change", sync);
    sync();
  }

  /* Chapters: the pinned photo wipes to the chapter being read. */
  const chapters = document.querySelector("[data-film-chapters]");
  if (chapters && "IntersectionObserver" in window) {
    const items = [...chapters.querySelectorAll("[data-film-chapter]")];
    const shots = [...chapters.querySelectorAll("[data-film-shot]")];
    const now = chapters.querySelector("[data-film-now]");
    chapters.classList.add("is-live");
    const show = (index) => {
      items.forEach((item, i) => item.classList.toggle("is-active", i === index));
      shots.forEach((shot, i) => shot.classList.toggle("is-active", i === index));
      if (now) now.textContent = String(index + 1).padStart(2, "0");
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && show(items.indexOf(entry.target)));
    }, { rootMargin: "-45% 0px -45% 0px" });
    items.forEach((item) => io.observe(item));
    show(0);
  }
}
