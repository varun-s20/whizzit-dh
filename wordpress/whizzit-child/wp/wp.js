/* WhizzIT on WordPress. The header and mobile menu are one generated part for
   every page, so the current section is marked here rather than in the markup.
   Each menu item carries its own list of the pages it covers (data-nav-match,
   generated from NAV in _build/site.mjs, "*" for a prefix) and, for sectors
   added later, a body class (data-nav-body). Only that list counts: a link
   inside a dropdown, such as "Book a consultation", never marks it current. */
(function () {
  var here = location.pathname.replace(/\/?$/, "/");
  var path = function (a) { return new URL(a.getAttribute("href"), location.href).pathname.replace(/\/?$/, "/"); };

  var covers = function (el) {
    var paths = (el.getAttribute("data-nav-match") || "").split(" ").filter(Boolean);
    var bodies = (el.getAttribute("data-nav-body") || "").split(" ").filter(Boolean);
    return paths.some(function (m) {
      return m.slice(-1) === "*" ? here.indexOf(m.slice(0, -1)) === 0 : here === m;
    }) || bodies.some(function (c) { return document.body.classList.contains(c); });
  };

  // Desktop bar: underline the one section this page belongs to.
  document.querySelectorAll(".primary-nav__item[data-nav-match]").forEach(function (item) {
    if (covers(item)) item.classList.add("is-current");
  });

  // Mobile menu: open that section's group.
  document.querySelectorAll(".mobile-nav__item[data-nav-match]").forEach(function (item) {
    if (!covers(item)) return;
    var toggle = item.querySelector(".mobile-nav__toggle");
    var sub = item.querySelector(".mobile-nav__sub");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (sub) sub.hidden = false;
  });

  // The link to this exact page, wherever it appears, is marked for assistive tech.
  document.querySelectorAll(".primary-nav a[href^='/'], .mobile-nav a[href^='/'], .site-footer a[href^='/']").forEach(function (a) {
    if (path(a) === here) a.setAttribute("aria-current", "page");
  });
})();
