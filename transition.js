/* G.T Architects — SVG curve page transition. Minimalist luxury veil. */
(function () {
  "use strict";

  var veil = document.getElementById("veil");
  if (!veil || typeof window.gsap === "undefined") return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var panel = veil.querySelector(".veil__panel");
  var center = veil.querySelector(".veil__center");
  var curves = veil.querySelectorAll(".veil__curve");
  var KEY = "gt-veil";
  var busy = false;

  gsap.set(veil, { yPercent: 100, visibility: "visible" });
  gsap.set(center, { opacity: 0, y: 18 });

  function cover(done) {
    if (busy) return;
    busy = true;
    veil.classList.add("is-live");
    var tl = gsap.timeline({ onComplete: function () { busy = false; if (done) done(); } });
    tl.set(veil, { visibility: "visible" });
    tl.to(veil, { yPercent: 0, duration: 0.85, ease: "power4.inOut" }, 0);
    tl.fromTo(curves, { scaleY: 1.25 }, { scaleY: 0.55, duration: 0.85, ease: "power4.inOut", transformOrigin: "center bottom" }, 0);
    tl.to(center, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.45);
    tl.to(center, { opacity: 0, y: -14, duration: 0.3, ease: "power2.in" }, "+=0.18");
    tl.to(curves, { scaleY: 1.1, duration: 0.3, ease: "power2.inOut" }, "<");
  }

  function reveal() {
    busy = true;
    veil.classList.add("is-live");
    gsap.set(veil, { yPercent: 0, visibility: "visible" });
    gsap.set(center, { opacity: 0, y: -14 });
    var tl = gsap.timeline({ onComplete: function () {
      busy = false;
      veil.classList.remove("is-live");
      gsap.set(veil, { yPercent: 100, visibility: "hidden" });
      gsap.set(center, { opacity: 0, y: 18 });
      gsap.set(curves, { scaleY: 1.25 });
    } });
    tl.to(veil, { yPercent: -100, duration: 1, ease: "power4.inOut" }, 0.1);
    tl.fromTo(curves, { scaleY: 0.55 }, { scaleY: 1.25, duration: 1, ease: "power4.inOut" }, 0.1);
  }

  /* Returning from another page: veil starts covering, lift it away. */
  try {
    if (sessionStorage.getItem(KEY) === "1") {
      sessionStorage.removeItem(KEY);
      gsap.set(veil, { yPercent: 0, visibility: "visible" });
      gsap.set(curves, { scaleY: 0.55 });
      window.addEventListener("load", reveal);
      /* Fallback if load already fired. */
      if (document.readyState === "complete") reveal();
      else setTimeout(function () { if (busy === false && veil.style.visibility !== "hidden") reveal(); }, 2500);
    } else {
      gsap.set(veil, { visibility: "hidden" });
    }
  } catch (e) {
    gsap.set(veil, { visibility: "hidden" });
  }

  /* Intercept internal page hops: cover, then navigate. */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || busy) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    /* Same-page file with only a hash change: let the app handle it. */
    var url;
    try { url = new URL(href, window.location.href); }
    catch (err) { return; }
    if (url.origin !== window.location.origin) return;
    var samePath = url.pathname === window.location.pathname;
    if (samePath && url.hash) return;
    if (samePath && !url.hash) return;
    if (url.pathname.indexOf(".html") === -1 && url.pathname.slice(-1) === "/") { /* allow clean urls */ }
    else if (url.pathname.indexOf(".html") === -1) return;
    e.preventDefault();
    try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
    cover(function () { window.location.href = url.href; });
    /* Safety: never trap the user if GSAP stalls. */
    setTimeout(function () {
      if (window.location.href !== url.href) window.location.href = url.href;
    }, 2200);
  }, true);
})();
