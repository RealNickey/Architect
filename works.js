/* Works page — full port of Codrops ContentLayoutTransition (stack to content).
 * Original: https://github.com/codrops/ContentLayoutTransition (MIT).
 * Adapted to globals (no bundler): uses window.gsap + Flip + Observer from CDN.
 * Images are the studio's own project covers in original-site/images/.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  if (!hasGsap) {
    document.body.classList.remove("loading");
    return;
  }
  var Flip = window.Flip;
  var Observer = window.Observer;
  var hasFlip = typeof Flip !== "undefined";
  var hasObserver = typeof Observer !== "undefined";
  if (hasFlip) gsap.registerPlugin(Flip);
  if (hasObserver) gsap.registerPlugin(Observer);

  var body = document.body;
  var stackEl = document.getElementById("stack");
  if (!stackEl) {
    body.classList.remove("loading");
    return;
  }

  var winsize = { width: window.innerWidth, height: window.innerHeight };
  window.addEventListener("resize", function () {
    winsize = { width: window.innerWidth, height: window.innerHeight };
  });

  /* ---------- floating header: always visible, shadow deepens on scroll ---------- */
  var head = document.getElementById("siteHead");
  function getY() {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  function onY(y) {
    if (!head) return;
    if (typeof y !== "number" || isNaN(y)) y = getY();
    head.classList.toggle("is-solid", y > 24);
    head.classList.remove("is-hidden");
  }
  window.addEventListener("scroll", function () { onY(getY()); }, { passive: true });
  window.addEventListener("load", function () { onY(getY()); });
  onY(getY());

  /* ---------- nav pill ---------- */
  var nav = document.querySelector(".site-nav");
  if (nav && !reduceMotion) {
    var pill = nav.querySelector(".nav-pill");
    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    var active = nav.querySelector("a.is-active") || links[0];
    function movePill(el, animate) {
      if (!el || !pill) return;
      var props = { x: el.offsetLeft, width: el.offsetWidth };
      if (animate === false) gsap.set(pill, props);
      else gsap.to(pill, Object.assign(props, { duration: 0.45, ease: "power3.out" }));
    }
    function placeActive(animate) { movePill(nav.querySelector("a.is-active") || active, animate); }
    placeActive(false);
    window.addEventListener("load", function () { placeActive(false); });
    window.addEventListener("resize", function () { placeActive(false); });
    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () { movePill(a); });
      a.addEventListener("focus", function () { movePill(a); });
    });
    nav.addEventListener("mouseleave", function () { placeActive(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeActive(false); });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("menuOverlay");
  var menuOpen = false, menuTl = null;
  if (menuBtn && menu) {
    gsap.set(menu, { visibility: "hidden" });
    gsap.set(".menu__bg", { yPercent: -100 });
    gsap.set(".menu__nav a", { y: 40, opacity: 0 });
    gsap.set(".menu__foot", { opacity: 0 });
    menuTl = gsap.timeline({ paused: true })
      .set(menu, { visibility: "visible" })
      .to(".menu__bg", { yPercent: 0, duration: 0.65, ease: "power4.inOut" })
      .to(".menu__nav a", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.06 }, "-=0.2")
      .to(".menu__foot", { opacity: 1, duration: 0.4 }, "-=0.35");
    menuTl.eventCallback("onReverseComplete", function () { gsap.set(menu, { visibility: "hidden" }); });
    menuBtn.addEventListener("click", function () {
      menuOpen = !menuOpen;
      menuBtn.setAttribute("aria-expanded", String(menuOpen));
      menu.setAttribute("aria-hidden", String(!menuOpen));
      if (menuOpen) menuTl.timeScale(1).play();
      else menuTl.timeScale(1.4).reverse();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { if (menuOpen) menuBtn.click(); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) menuBtn.click();
    });
  }

  /* ---------- ContentItem (port of js/contentItem.js) ---------- */
  function ContentItem(el) {
    this.el = el;
    this.texts = Array.prototype.slice.call(el.querySelectorAll(".oh > .oh__inner"));
  }

  /* ---------- Slideshow (port of js/slideshow.js) ---------- */
  function Slideshow(stack) {
    this.DOM = {
      el: stack,
      items: Array.prototype.slice.call(stack.querySelectorAll(".stack__item:not(.stack__item--empty)")),
      stackWrap: document.querySelector(".stack-wrap"),
      slides: document.querySelector(".slides"),
      content: document.getElementById("content"),
      contentItems: Array.prototype.slice.call(document.querySelectorAll(".content__item")),
      mainTitleTexts: Array.prototype.slice.call(document.querySelectorAll(".title > .oh > .oh__inner, .title__sub.oh > .oh__inner")),
      backCtrl: document.getElementById("contentBack"),
      navArrows: {
        prev: document.getElementById("navPrev"),
        next: document.getElementById("navNext")
      }
    };
    this.contentItems = [];
    this.DOM.contentItems.forEach(function (item) { this.contentItems.push(new ContentItem(item)); }, this);
    this.isOpen = false;
    this.isAnimating = false;
    this.current = -1;
    this.totalItems = this.DOM.items.length;
    this.lastFocus = null;
    this.initEvents();
  }

  Slideshow.prototype.setCounter = function () {
    var label = this.current < 0 ? "01" : String(this.current + 1).padStart(2, "0");
    var pos = document.getElementById("worksPos");
    if (pos) pos.textContent = label;
    var posOpen = document.getElementById("worksPosOpen");
    if (posOpen) posOpen.textContent = label;
  };

  Slideshow.prototype.setHash = function (clear) {
    try {
      if (clear || this.current < 0) {
        history.replaceState(null, "", location.pathname);
      } else {
        var item = this.DOM.items[this.current];
        if (item && item.id) history.replaceState(null, "", "#" + item.id);
      }
    } catch (e) {}
  };

  Slideshow.prototype.initEvents = function () {
    var self = this;
    this.DOM.items.forEach(function (item) {
      item.addEventListener("click", function () { self.open(item); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); self.open(item); }
      });
    });
    if (this.DOM.backCtrl) this.DOM.backCtrl.addEventListener("click", function () { self.close(); });
    /* Arrow steppers removed from the UI: scroll drives prev/next.
       (Keyboard arrows stay as an accessible fallback.) */

    document.addEventListener("keydown", function (e) {
      if (!self.isOpen || self.isAnimating) {
        if (e.key === "Escape" && menuOpen && menuBtn) menuBtn.click();
        return;
      }
      if (e.key === "Escape") self.close();
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); self.navigate("next"); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); self.navigate("prev"); }
    });

    /* Open-state scroll: wheel/touch moves between projects instead of
       going back. Scrolling down past the last project exits (like Esc).
       Back happens only via the Back button or Escape. */
    var lastScrollNav = 0;
    function scrollDown() {
      if (!self.isOpen || self.isAnimating) return;
      var now = Date.now();
      if (now - lastScrollNav < 900) return;
      lastScrollNav = now;
      if (self.current >= self.totalItems - 1) self.close();
      else self.navigate("next");
    }
    function scrollUp() {
      if (!self.isOpen || self.isAnimating) return;
      var now = Date.now();
      if (now - lastScrollNav < 900) return;
      lastScrollNav = now;
      if (self.current > 0) self.navigate("prev");
    }
    if (hasObserver && !reduceMotion) {
      this.scrollObserver = Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: scrollDown,
        onUp: scrollUp,
        tolerance: 10,
        preventDefault: true
      });
      this.scrollObserver.disable();
    } else {
      /* Fallback when Observer is unavailable: plain wheel + swipe. */
      var touchY = null;
      window.addEventListener("wheel", function (e) {
        if (!self.isOpen) return;
        e.preventDefault();
        if (e.deltaY > 0) scrollDown();
        else if (e.deltaY < 0) scrollUp();
      }, { passive: false });
      window.addEventListener("touchstart", function (e) {
        if (!self.isOpen || !e.touches || !e.touches[0]) return;
        touchY = e.touches[0].clientY;
      }, { passive: true });
      window.addEventListener("touchend", function (e) {
        if (!self.isOpen || touchY === null) return;
        var y = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : touchY;
        var dy = touchY - y;
        touchY = null;
        if (dy > 40) scrollDown();
        else if (dy < -40) scrollUp();
      }, { passive: true });
    }
  };

  Slideshow.prototype.open = function (stackItem) {
    if (this.isAnimating || this.isOpen) return;
    var idx = this.DOM.items.indexOf(stackItem);
    if (idx < 0) return;
    this.lastFocus = document.activeElement;

    if (reduceMotion || !hasFlip) {
      this.current = idx;
      if (this.scrollObserver) this.scrollObserver.enable();
      this.DOM.slides.appendChild(this.DOM.el);
      document.documentElement.scrollTop = document.body.scrollTop = 0;
      body.classList.add("oh", "is-open");
      this.DOM.content.classList.add("content--open");
      this.contentItems[this.current].el.classList.add("content__item--current");
      this.DOM.items[this.current].classList.add("stack__item--current");
      gsap.set(this.DOM.mainTitleTexts, { yPercent: -101 });
      gsap.set(this.contentItems[this.current].texts, { yPercent: 0 });
      this.isOpen = true;
      this.setCounter();
      this.setHash(false);
      if (this.DOM.backCtrl) this.DOM.backCtrl.focus();
      return;
    }

    this.isAnimating = true;
    this.current = idx;
    if (this.scrollObserver) this.scrollObserver.enable();

    var scrollY = window.scrollY;
    body.classList.add("oh", "is-open");
    this.DOM.content.classList.add("content--open");
    this.contentItems[this.current].el.classList.add("content__item--current");
    this.DOM.items[this.current].classList.add("stack__item--current");

    var state = Flip.getState(this.DOM.items, { props: "opacity" });
    this.DOM.slides.appendChild(this.DOM.el);
    var itemCenter = stackItem.offsetTop + stackItem.offsetHeight / 2;

    document.documentElement.scrollTop = document.body.scrollTop = 0;
    gsap.set(this.DOM.el, { y: winsize.height / 2 - itemCenter + scrollY });
    document.documentElement.scrollTop = document.body.scrollTop = 0;

    var self = this;
    Flip.from(state, {
      duration: 1,
      ease: "expo",
      absoluteOnLeave: true,
      onStart: function () { document.documentElement.scrollTop = document.body.scrollTop = scrollY; },
      onComplete: function () {
        self.isOpen = true;
        self.isAnimating = false;
        self.setCounter();
        self.setHash(false);
        if (self.DOM.backCtrl) self.DOM.backCtrl.focus();
      }
    })
    .to(this.DOM.mainTitleTexts, { duration: 0.9, ease: "expo", yPercent: -101 }, 0)
    .to(this.contentItems[this.current].texts, { duration: 1, ease: "expo", startAt: { yPercent: 101 }, yPercent: 0 }, 0)
    .to(this.DOM.backCtrl, { duration: 1, ease: "expo", startAt: { opacity: 0 }, opacity: 1 }, 0)
    .to([this.DOM.navArrows.prev, this.DOM.navArrows.next], {
      duration: 1,
      ease: "expo",
      startAt: { opacity: 0, y: function (pos) { return pos ? -150 : 150; } },
      y: 0,
      opacity: function (pos) {
        return (self.current === 0 && !pos) || (self.current === self.totalItems - 1 && pos) ? 0 : 1;
      }
    }, 0);
  };

  Slideshow.prototype.close = function () {
    if (this.isAnimating || !this.isOpen) return;

    if (reduceMotion || !hasFlip) {
      if (this.scrollObserver) this.scrollObserver.disable();
      this.DOM.items[this.current].classList.remove("stack__item--current");
      this.contentItems[this.current].el.classList.remove("content__item--current");
      body.classList.remove("oh", "is-open");
      this.DOM.stackWrap.appendChild(this.DOM.el);
      gsap.set(this.DOM.el, { y: 0 });
      gsap.set(this.DOM.mainTitleTexts, { yPercent: 0 });
      this.DOM.content.classList.remove("content--open");
      this.current = -1;
      this.isOpen = false;
      this.setCounter();
      this.setHash(true);
      if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
      return;
    }

    this.isAnimating = true;
    if (this.scrollObserver) this.scrollObserver.disable();
    this.DOM.items[this.current].classList.remove("stack__item--current");
    body.classList.remove("oh");

    var state = Flip.getState(this.DOM.items, { props: "opacity" });
    this.DOM.stackWrap.appendChild(this.DOM.el);
    gsap.set(this.DOM.el, { y: 0 });

    var self = this;
    var closingIndex = this.current;
    Flip.from(state, {
      duration: 1,
      ease: "expo",
      absoluteOnLeave: true,
      onComplete: function () {
        self.DOM.content.classList.remove("content--open");
        body.classList.remove("is-open");
        self.contentItems[closingIndex].el.classList.remove("content__item--current");
        self.current = -1;
        self.isOpen = false;
        self.isAnimating = false;
        self.setCounter();
        self.setHash(true);
        if (self.lastFocus && self.lastFocus.focus) self.lastFocus.focus();
      }
    })
    .to(this.DOM.mainTitleTexts, { duration: 0.9, ease: "expo", startAt: { yPercent: 101 }, yPercent: 0 }, 0)
    .to(this.contentItems[this.current].texts, { duration: 1, ease: "expo", yPercent: -101 }, 0)
    .to(this.DOM.backCtrl, { duration: 1, ease: "expo", opacity: 0 }, 0)
    .to([this.DOM.navArrows.prev, this.DOM.navArrows.next], {
      duration: 1,
      ease: "expo",
      y: function (pos) { return pos ? 100 : -100; },
      opacity: 0
    }, 0);
  };

  Slideshow.prototype.navigate = function (direction) {
    if (this.isAnimating ||
        (direction === "next" && this.current === this.totalItems - 1) ||
        (direction === "prev" && this.current === 0)) return;
    this.isAnimating = true;

    var previousCurrent = this.current;
    var currentItem = this.DOM.items[previousCurrent];
    this.current = direction === "next" ? this.current + 1 : this.current - 1;
    var upcomingItem = this.DOM.items[this.current];

    currentItem.classList.remove("stack__item--current");
    upcomingItem.classList.add("stack__item--current");

    gsap.set(this.DOM.navArrows.prev, { opacity: this.current > 0 ? 1 : 0 });
    gsap.set(this.DOM.navArrows.next, { opacity: this.current < this.totalItems - 1 ? 1 : 0 });

    var self = this;
    this.setHash(false);
    this.setCounter();

    if (reduceMotion) {
      this.contentItems[previousCurrent].el.classList.remove("content__item--current");
      this.contentItems[this.current].el.classList.add("content__item--current");
      this.isAnimating = false;
      return;
    }

    gsap.timeline({ onComplete: function () { self.isAnimating = false; } })
      .to(this.DOM.el, {
        duration: 1,
        ease: "expo",
        /* Step by the measured item pitch (16:9 frames), not a fixed viewport
           fraction, so the next frame lands centered in the slides column. */
        y: direction === "next"
          ? "-=" + itemStep(currentItem, upcomingItem)
          : "+=" + itemStep(currentItem, upcomingItem)
      }, 0)
      .to(this.contentItems[previousCurrent].texts, {
        duration: 0.2,
        ease: "power1",
        yPercent: direction === "next" ? 101 : -101,
        onComplete: function () { self.contentItems[previousCurrent].el.classList.remove("content__item--current"); }
      }, 0)
      .to(this.contentItems[this.current].texts, {
        duration: 0.9,
        ease: "expo",
        startAt: { yPercent: direction === "next" ? -101 : 101 },
        onStart: function () { self.contentItems[self.current].el.classList.add("content__item--current"); },
        yPercent: 0
      }, 0.2);
  };

  /* Measured pitch between two stack frames (falls back to half viewport). */
  function itemStep(a, b) {
    try {
      var d = Math.abs((b.offsetTop || 0) - (a.offsetTop || 0));
      if (d > 10) return d;
    } catch (e) {}
    return window.innerHeight / 2 + window.innerHeight * 0.02;
  }

  /* ---------- boot: preload stack backgrounds, then reveal (port of index.js + utils.js) ---------- */
  var slideshow = new Slideshow(stackEl);
  slideshow.setCounter();

  function bgUrls() {
    var urls = [];
    slideshow.DOM.items.forEach(function (item) {
      var bg = item.style.backgroundImage || "";
      var m = /url\(["']?([^"')]+)["']?\)/.exec(bg);
      if (m && m[1]) urls.push(m[1]);
    });
    return urls;
  }

  function preload(urls) {
    return Promise.all(urls.map(function (src) {
      return new Promise(function (resolve) {
        var im = new Image();
        im.onload = im.onerror = function () { resolve(); };
        im.src = src;
      });
    }));
  }

  function openFromHash() {
    var id = (location.hash || "").replace("#", "");
    if (!id) return;
    var item = document.getElementById(id);
    if (item && item.classList.contains("stack__item") && !slideshow.isOpen) {
      slideshow.open(item);
    }
  }

  preload(bgUrls()).then(function () {
    body.classList.remove("loading");
    openFromHash();
  });
  // Safety: never trap the user behind the loader.
  setTimeout(function () {
    if (body.classList.contains("loading")) {
      body.classList.remove("loading");
      openFromHash();
    }
  }, 4000);
  window.addEventListener("hashchange", openFromHash);
})();
