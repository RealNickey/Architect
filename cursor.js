/* G.T Architects - CAD crosshair cursor (pickbox aperture, live X/Y readout,
   dashed full-viewport hairlines on press-and-hold, INDEX PAGE ONLY).
   Fine pointers only; touch keeps native. Non-index pages exit immediately. */
(function () {
  "use strict";

  /* Scope: index page only (.hero exists only there). */
  if (!document.querySelector(".hero")) return;

  if (!window.matchMedia("(pointer: fine)").matches) return;

  var root = document.createElement("div");
  root.className = "cad-cursor";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    '<div class="cad-cursor__h"></div>' +
    '<div class="cad-cursor__v"></div>' +
    '<div class="cad-cursor__box"></div>' +
    '<div class="cad-cursor__tag"><span class="cad-cursor__coords">X 0000 · Y 0000</span></div>';
  document.body.appendChild(root);

  /* Full hairlines are an index-page treat (.hero only exists there),
     revealed on press-and-hold via the .is-down state. */
  if (document.querySelector(".hero")) root.classList.add("has-lines");

  var hLine = root.querySelector(".cad-cursor__h");
  var vLine = root.querySelector(".cad-cursor__v");
  var box = root.querySelector(".cad-cursor__box");
  var tag = root.querySelector(".cad-cursor__tag");
  var coords = root.querySelector(".cad-cursor__coords");

  var shown = false;
  var HOVER_SEL = "a, button, [role='button'], input, textarea, select, label, .stack__item, .pcard";
  var DARK_SEL = ".finale, .pmodal, .menu";
  var pageIsDark = false; /* cursor is index-only; index is a light page */

  function pad(n) {
    n = Math.max(0, Math.round(n));
    return String(n).padStart(4, "0");
  }

  function render(x, y) {
    hLine.style.transform = "translate3d(0," + y + "px,0)";
    vLine.style.transform = "translate3d(" + x + "px,0,0)";
    box.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
    var tx = Math.min(x + 20, window.innerWidth - 132);
    var ty = Math.min(y + 22, window.innerHeight - 34);
    tag.style.transform = "translate3d(" + Math.max(8, tx) + "px," + Math.max(8, ty) + "px,0)";
    coords.textContent = "X " + pad(x) + " · Y " + pad(y);
  }

  window.addEventListener("mousemove", function (e) {
    if (!shown) {
      shown = true;
      root.classList.add("is-on");
      document.documentElement.classList.add("has-cad");
    }
    var t = e.target;
    var dark = pageIsDark || !!(t && t.closest && t.closest(DARK_SEL));
    root.classList.toggle("is-dark", dark);
    render(e.clientX, e.clientY);
  }, { passive: true });

  function release() { root.classList.remove("is-down"); }
  document.documentElement.addEventListener("mouseleave", function () {
    root.classList.remove("is-on");
    release();
  });
  window.addEventListener("blur", release);
  document.documentElement.addEventListener("mouseenter", function () {
    if (shown) root.classList.add("is-on");
  });

  document.addEventListener("mouseover", function (e) {
    if (e.target && e.target.closest && e.target.closest(HOVER_SEL)) root.classList.add("is-hover");
  });
  document.addEventListener("mouseout", function (e) {
    if (e.target && e.target.closest && e.target.closest(HOVER_SEL)) root.classList.remove("is-hover");
  });
  document.addEventListener("mousedown", function () { root.classList.add("is-down"); });
  document.addEventListener("mouseup", function () { root.classList.remove("is-down"); });
})();
