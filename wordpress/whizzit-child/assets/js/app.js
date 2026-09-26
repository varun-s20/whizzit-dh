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
  initHeader();
  initMegaMenu();
  initMobileNavigation();
  initTabs();
  initFilters();
  initRails();
  initQuotes();
  initCarousels();
  initCounters();
  initRevealAnimations();
  initServiceStage();
  initOnView();
  initTilt();
  initForms();
});


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

    const select = (index, focus = false) => {
      tabList.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (focus) tabList[index].focus();
    };

    tabList.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i));
      tab.addEventListener("keydown", (event) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabList.length - 1 };
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
