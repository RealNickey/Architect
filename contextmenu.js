/* G.T Architects - CAD-style right-click shortcut menu (nav + contact copy).
   Fine pointers only; touch keeps the native menu. */
(function () {
  "use strict";

  if (!window.matchMedia("(pointer: fine)").matches) return;

  var EMAIL = "info@gtarchitects.in";
  var PHONE = "+91 98954 44232";
  var MAPS = "https://www.google.com/maps/search/?api=1&query=Palathinkal+Genesis+Complex+Thiruvankulam+Ernakulam";

  var menu = document.createElement("div");
  menu.className = "cad-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Shortcut menu");
  menu.hidden = true;
  menu.innerHTML =
    '<p class="cad-menu__title">GT &middot; Shortcut</p>' +
    '<p class="cad-menu__group">Goto</p>' +
    '<a class="cad-menu__item" role="menuitem" href="index.html"><span>Home</span><kbd>H</kbd></a>' +
    '<a class="cad-menu__item" role="menuitem" href="works.html"><span>Works</span><kbd>W</kbd></a>' +
    '<a class="cad-menu__item" role="menuitem" href="gallery.html"><span>Gallery</span><kbd>G</kbd></a>' +
    '<button class="cad-menu__item" type="button" role="menuitem" data-act="top"><span>Top of page</span><kbd>T</kbd></button>' +
    '<p class="cad-menu__group">Studio</p>' +
    '<button class="cad-menu__item" type="button" role="menuitem" data-act="email"><span>Copy email</span><kbd>@</kbd></button>' +
    '<button class="cad-menu__item" type="button" role="menuitem" data-act="phone"><span>Copy phone</span><kbd>#</kbd></button>' +
    '<a class="cad-menu__item" role="menuitem" href="' + MAPS + '" target="_blank" rel="noopener"><span>Get directions</span><kbd>&#8599;</kbd></a>' +
    '<p class="cad-menu__coords">X 0000 &middot; Y 0000</p>';
  document.body.appendChild(menu);

  var coordsEl = menu.querySelector(".cad-menu__coords");
  var items = Array.prototype.slice.call(menu.querySelectorAll(".cad-menu__item"));
  var open = false;
  var lastFocus = null;

  function pad(n) {
    n = Math.max(0, Math.round(n));
    return String(n).padStart(4, "0");
  }

  function close(returnFocus) {
    if (!open) return;
    open = false;
    menu.hidden = true;
    if (returnFocus !== false && lastFocus && lastFocus.focus) {
      try { lastFocus.focus(); } catch (e) {}
    }
  }

  function markCurrent() {
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    items.forEach(function (it) {
      var href = it.getAttribute("href");
      if (href && href.toLowerCase() === page) it.classList.add("is-current");
      else it.classList.remove("is-current");
    });
  }

  function resetLabels() {
    items.forEach(function (it) {
      if (it.dataset.label) it.querySelector("span").textContent = it.dataset.label;
      it.classList.remove("is-copied");
    });
  }

  function place(x, y) {
    menu.hidden = false;
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var px = Math.min(x, window.innerWidth - w - 8);
    var py = Math.min(y, window.innerHeight - h - 8);
    menu.style.transform = "translate3d(" + Math.max(8, px) + "px," + Math.max(8, py) + "px,0)";
    coordsEl.textContent = "X " + pad(x) + " \u00B7 Y " + pad(y);
  }

  function flashCopied(btn) {
    var label = btn.querySelector("span");
    if (!btn.dataset.label) btn.dataset.label = label.textContent;
    label.textContent = "Copied to clipboard";
    btn.classList.add("is-copied");
    setTimeout(function () { close(false); }, 700);
  }

  function copyText(text, btn) {
    function done() { flashCopied(btn); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  document.addEventListener("contextmenu", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest("input, textarea, select, [contenteditable='true']")) return;
    e.preventDefault();
    lastFocus = document.activeElement;
    resetLabels();
    markCurrent();
    open = true;
    place(e.clientX, e.clientY);
    if (items[0]) items[0].focus();
  });

  menu.addEventListener("click", function (e) {
    var item = e.target && e.target.closest ? e.target.closest(".cad-menu__item") : null;
    if (!item) return;
    var act = item.getAttribute("data-act");
    if (act === "email") { copyText(EMAIL, item); return; }
    if (act === "phone") { copyText(PHONE, item); return; }
    if (act === "top") {
      close(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    close(false);
  });

  menu.addEventListener("keydown", function (e) {
    var i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1 + items.length) % items.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  });

  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    var k = (e.key || "").toLowerCase();
    if (k === "h") location.href = "index.html";
    else if (k === "w") location.href = "works.html";
    else if (k === "g") location.href = "gallery.html";
    else if (k === "t") { close(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });

  document.addEventListener("pointerdown", function (e) {
    if (open && !menu.contains(e.target)) close(false);
  }, true);
  window.addEventListener("scroll", function () { close(false); }, { passive: true, capture: true });
  window.addEventListener("resize", function () { close(false); });
  window.addEventListener("blur", function () { close(false); });
})();
