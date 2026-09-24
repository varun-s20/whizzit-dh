/* WhizzIT on WordPress. The header is one generated part for every page, so the
   current page is marked here rather than in the markup: a menu section is
   current when one of its links is this page or a parent of it. */
(function () {
  var here = location.pathname.replace(/\/?$/, "/");
  var path = function (a) { return new URL(a.getAttribute("href"), location.href).pathname.replace(/\/?$/, "/"); };

  document.querySelectorAll(".primary-nav__item").forEach(function (item) {
    var current = false;
    item.querySelectorAll("a[href^='/']").forEach(function (a) {
      var p = path(a);
      if (p === here) {
        a.setAttribute("aria-current", "page");
        current = true;
      } else if (p !== "/" && here.indexOf(p) === 0) {
        current = true;
      }
    });
    if (current) item.classList.add("is-current");
  });

  document.querySelectorAll(".mobile-nav a[href^='/'], .site-footer a[href^='/']").forEach(function (a) {
    if (path(a) === here) a.setAttribute("aria-current", "page");
  });
})();
