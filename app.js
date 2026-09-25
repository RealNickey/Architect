/* G.T Architects - Lenis plus GSAP. Navbar pill, reveals, works drawer, haptics, gallery wall. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  if (!hasGsap) return;
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* Project image series, names match the original portfolio archive */
  var IMG = "original-site/images/";
  var PROJECTS = {
    trigon: { no: "01 of 07", title: "Trigon Alias Residence", meta: "Private residence, Pambra, Ernakulam",
      frames: ["Alias%20Residence%20-1.jpg", "Alias%20Residence-2.jpg", "Alias%20Residence-3.jpg", "Alias%20Residence-4.jpg"], alt: "Trigon Alias Residence" },
    emerald: { no: "02 of 07", title: "Emerald Banquet Hall", meta: "Hospitality and events, Ernakulam, Kerala",
      frames: ["Banquet%20hall-1.jpg", "Banquet%20hall-2.jpg", "Banquet%20hall-3.jpg", "Banquet%20hall-4.jpg"], alt: "Emerald Banquet Hall" },
    devi: { no: "03 of 07", title: "Devi Residence", meta: "Residence and interior, Thripunithura, Ernakulam",
      frames: ["Devi%20Residence-1.jpg", "Devi%20Residence-2.jpg", "Devi%20Residence-3.jpg", "Devi%20Residence-4.jpg"], alt: "Devi Residence" },
    longcourt: { no: "04 of 07", title: "Long Court", meta: "Private residence, Ernakulam, Kerala",
      frames: ["Long%20Court-1.jpg", "Long%20Court-2.jpg", "Long%20Court-3.jpg", "Long%20Court-4.jpg"], alt: "Long Court" },
    peter: { no: "05 of 07", title: "Peter Residence", meta: "Residence and landscape, Ernakulam, Kerala",
      frames: ["Peter%20-1.jpg", "Peter%20-2.jpg", "Peter%20-3.jpg", "Peter%20-4.jpg"], alt: "Peter Residence" },
    raju: { no: "06 of 07", title: "Raju Residence", meta: "Private residence, Thiruvaniyoor, Ernakulam",
      frames: ["Raju%20Residence-1.jpg", "Raju%20Residence-2.jpg", "Raju%20Residence-3.jpg", "Raju%20Residence-4.jpg"], alt: "Raju Residence" },
    synch: { no: "07 of 07", title: "Synch House", meta: "Private residence, Ernakulam, Kerala",
      frames: ["Synch-1.jpg", "Synch-2.jpg", "Synch-3.jpg"], alt: "Synch House" }
  };

  /* Android haptics, tiered by interaction weight */
  var isAndroid = /Android/i.test(navigator.userAgent || "") && ("vibrate" in navigator);
  function buzz(pattern) {
    if (!isAndroid) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }
  var H = { light: 12, medium: 25, strong: 45, page: 65 };
  function haptic(kind) {
    if (kind === "page") buzz(H.page);
    else if (kind === "strong") buzz(H.strong);
    else if (kind === "medium") buzz(H.medium);
    else buzz(H.light);
  }

  /* Lenis smooth scroll */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    if (hasST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  }
  function scrollToTarget(target) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el && target !== 0) return;
    if (lenis) lenis.scrollTo(target === 0 ? 0 : el, { duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  /* Header solid plus hide on scroll */
  var head = document.getElementById("siteHead");
  var lastY = 0;
  function onY(y) {
    if (!head) return;
    head.classList.toggle("is-solid", y > 40);
    if (y > 500 && y > lastY + 4) head.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 200) head.classList.remove("is-hidden");
    lastY = y;
  }
  if (lenis) lenis.on("scroll", function (e) { onY(e.scroll); });
  else window.addEventListener("scroll", function () { onY(window.scrollY); }, { passive: true });

  /* GSAP interactive navbar pill */
  var nav = document.querySelector(".site-nav");
  if (nav && !reduceMotion) {
    var pill = nav.querySelector(".nav-pill");
    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    function movePill(el, animate) {
      if (!el || !pill) return;
      var props = { x: el.offsetLeft, width: el.offsetWidth };
      if (animate === false) gsap.set(pill, props);
      else gsap.to(pill, Object.assign(props, { duration: 0.45, ease: "power3.out" }));
    }
    var active = nav.querySelector("a.is-active") || links[0];
    gsap.from(".site-head", { y: -24, opacity: 0, duration: 0.9, ease: "power3.out" });
    gsap.from(links, { y: -12, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, delay: 0.15 });
    function placeActive(animate) { movePill(nav.querySelector("a.is-active") || active, animate); }
    placeActive(false);
    window.addEventListener("load", function () { placeActive(false); });
    window.addEventListener("resize", function () { placeActive(false); });
    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () { movePill(a); });
      a.addEventListener("focus", function () { movePill(a); });
      /* subtle magnetic lift */
      a.addEventListener("mousemove", function (e) {
        var r = a.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        gsap.to(a, { x: dx * 5, duration: 0.3, ease: "power2.out" });
      });
      a.addEventListener("mouseleave", function () { gsap.to(a, { x: 0, duration: 0.35, ease: "power3.out" }); });
      a.addEventListener("click", function () { haptic("page"); });
    });
    nav.addEventListener("mouseleave", function () { placeActive(true); });
    /* keep pill on active after fonts settle */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeActive(false); });
  } else if (nav) {
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { haptic("page"); });
    });
  }

  /* Mobile menu */
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
      haptic("light");
      menuBtn.setAttribute("aria-expanded", String(menuOpen));
      menu.setAttribute("aria-hidden", String(!menuOpen));
      if (menuOpen) { menuTl.timeScale(1).play(); if (lenis) lenis.stop(); }
      else { menuTl.timeScale(1.4).reverse(); if (lenis) lenis.start(); }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { haptic("page"); if (menuOpen) menuBtn.click(); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) menuBtn.click();
    });
  }

  /* Entrances */
  function entrance(scope) {
    var lines = scope.querySelectorAll(".line__inner");
    var media = scope.querySelector("[data-hero-media]");
    var fades = scope.querySelectorAll("[data-hero-fade]");
    if (reduceMotion) {
      gsap.set(lines, { yPercent: 0 });
      gsap.set(fades, { opacity: 1, y: 0 });
      return;
    }
    gsap.set(lines, { yPercent: 115 });
    gsap.set(fades, { opacity: 0, y: 24 });
    if (media) gsap.set(media, { scale: 1.18 });
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    if (media) tl.to(media, { scale: 1.04, duration: 2.2, ease: "power3.out" }, 0);
    tl.to(lines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.15);
    tl.to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.6);
  }
  var hero = document.querySelector(".hero");
  if (hero) {
    entrance(hero);
    if (hasST && !reduceMotion) {
      gsap.to(hero.querySelector("[data-hero-media]"), {
        yPercent: 14, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }
  }
  var phero = document.querySelector(".page-hero");
  if (phero) entrance(phero);

  /* Generic reveals plus parallax, Lenis aware */
  if (hasST && !reduceMotion) {
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 42 }, {
        opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    gsap.utils.toArray("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: img.closest("figure, div") || img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    if (document.querySelector(".finale__giant span")) {
      gsap.fromTo(".finale__giant span", { yPercent: 34 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: ".finale__giant", start: "top bottom", end: "top 45%", scrub: true }
      });
    }
    if (document.querySelector(".finale__glow")) {
      gsap.fromTo(".finale__glow", { opacity: 0.2 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".finale", start: "top 80%", end: "top 30%", scrub: true }
      });
    }
  }

  /* Gallery wall, 3 row horizontal parallax with drag, wheel drift and morph dialog */
  var prowViewport = document.querySelector("[data-prows]");
  if (prowViewport) {
    var rows = Array.prototype.slice.call(prowViewport.querySelectorAll(".prow")).map(function (row) {
      var track = row.querySelector(".prow__track");
      var speed = parseFloat(row.dataset.speed || "1");
      /* duplicate one set for infinite loop wrapping */
      track.innerHTML += track.innerHTML;
      Array.prototype.slice.call(track.querySelectorAll(".pcard")).forEach(function (card, i, all) {
        if (i >= all.length / 2) { card.tabIndex = -1; card.setAttribute("aria-hidden", "true"); }
      });
      return { row: row, track: track, speed: speed, half: 1 };
    });
    var pTarget = 0, pCurrent = 0, pVel = 0, pDragging = false, pMoved = 0;
    var pDownX = 0, pDownTarget = 0, pLastDx = 0, blurCap = 12;
    function measureRows() {
      rows.forEach(function (r) {
        r.half = Math.max(1, r.track.scrollWidth / 2);
      });
      blurCap = window.innerWidth < 640 ? 8 : 12;
    }
    measureRows();
    window.addEventListener("load", measureRows);
    window.addEventListener("resize", measureRows);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureRows);
    /* directional motion blur, one SVG filter per row, intensity follows row speed */
    var blurNodes = rows.map(function (r, i) {
      var node = { prim: null, track: r.track, prev: 0, cur: 0, on: false };
      if (reduceMotion) return node;
      try {
        var prim = document.querySelector("#motion-blur-" + i + " feGaussianBlur");
        if (prim) {
          node.prim = prim;
          r.track.style.filter = "url(#motion-blur-" + i + ")";
          node.on = true;
        }
      } catch (e) {}
      return node;
    });
    /* gentle auto drift, paused while dragging or when reduced motion is on */
    var pLast = performance.now();
    function tick(now) {
      var dt = Math.min(64, now - pLast) / 1000;
      pLast = now;
      if (!reduceMotion && !pDragging && !pModalOpen) pTarget += dt * 26;
      if (!pDragging && pVel !== 0) {
        pTarget += pVel * dt * 60;
        pVel *= Math.pow(0.94, dt * 60);
        if (Math.abs(pVel) < 0.05) pVel = 0;
      }
      pCurrent += (pTarget - pCurrent) * (reduceMotion ? 1 : 0.09);
      rows.forEach(function (r, i) {
        var off = -(((pCurrent * r.speed) % r.half + r.half) % r.half);
        r.track.style.transform = "translate3d(" + off + "px,0,0)";
        var bn = blurNodes[i];
        if (bn && bn.prim) {
          var speed = Math.abs(off - bn.prev);
          bn.prev = off;
          var want = Math.min(blurCap, speed * 0.45);
          bn.cur += (want - bn.cur) * 0.35;
          if (bn.cur < 0.25) {
            if (bn.on) {
              bn.prim.setAttribute("stdDeviation", "0,0");
              bn.track.style.filter = "";
              bn.on = false;
            }
          } else {
            if (!bn.on) { bn.track.style.filter = "url(#motion-blur-" + i + ")"; bn.on = true; }
            var v = bn.cur.toFixed(2);
            if (v !== bn.shown) { bn.prim.setAttribute("stdDeviation", v + ",0"); bn.shown = v; }
          }
        }
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    /* vertical wheel drifts the wall, page scroll stays intact for friendly UX */
    prowViewport.addEventListener("wheel", function (e) {
      var d = (e.deltaY || 0) + (e.deltaX || 0);
      if (e.deltaMode === 1) d *= 16;
      pTarget += d * 0.55;
      pVel += d * 0.002;
    }, { passive: true });
    /* click and drag panning with inertia, tracked on window so clicks still reach cards */
    prowViewport.addEventListener("pointerdown", function (e) {
      if (pModalOpen) return;
      if (!e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pDragging = true; pMoved = 0; pVel = 0;
      pDownX = e.clientX; pDownTarget = pTarget; pLastDx = 0;
      prowViewport.classList.add("is-dragging");
      window.addEventListener("pointermove", onDragMove);
      window.addEventListener("pointerup", onDragEnd);
      window.addEventListener("pointercancel", onDragEnd);
    });
    function onDragMove(e) {
      if (!pDragging) return;
      var dx = pDownX - e.clientX;
      pMoved = Math.max(pMoved, Math.abs(dx));
      pTarget = pDownTarget + dx;
      pVel = (dx - pLastDx) * 0.6;
      pLastDx = dx;
    }
    function onDragEnd() {
      if (!pDragging) return;
      pDragging = false;
      prowViewport.classList.remove("is-dragging");
      pVel = Math.max(-28, Math.min(28, pVel * 2.2));
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragEnd);
      window.removeEventListener("pointercancel", onDragEnd);
    }
    prowViewport.addEventListener("dragstart", function (e) { e.preventDefault(); });
    /* suppress clicks that were really drags */
    prowViewport.addEventListener("click", function (e) {
      if (pMoved > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    if (hasST && !reduceMotion) {
      gsap.from(rows.map(function (r) { return r.row; }), {
        opacity: 0, y: 36, duration: 0.9, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: prowViewport, start: "top 85%", once: true }
      });
    }
  }

  /* Shared element morph dialog, GSAP FLIP style: the frame itself flies to center */
  var pModal = document.getElementById("pmodal");
  var pModalOpen = false, pSourceCard = null, pLastFocus = null, pGhost = null, pMorphed = false;
  function fillFrame(card) {
    var pmImg = document.getElementById("pmImg");
    var pmGraphic = document.getElementById("pmGraphic");
    var fig = pModal.querySelector(".pmodal__fig");
    var title = card.dataset.title || "Frame";
    var meta = card.dataset.meta || "";
    fig.setAttribute("aria-label", meta ? title + ", " + meta : title);
    var isGraphic = !!card.dataset.graphic;
    if (isGraphic) {
      pmImg.removeAttribute("src");
      pmImg.style.display = "none";
      pmGraphic.hidden = false;
      pmGraphic.textContent = card.dataset.graphic;
    } else {
      pmGraphic.hidden = true;
      pmImg.style.display = "";
      pmImg.src = card.dataset.full || "";
      pmImg.alt = meta ? title + ", " + meta : title;
    }
    return isGraphic;
  }
  function makeGhost(card, rect, isGraphic) {
    var g;
    if (isGraphic) {
      g = document.createElement("div");
      g.className = "pghost pghost--graphic";
      var t = document.createElement("div");
      t.className = "pmodal__graphic";
      t.textContent = card.dataset.graphic;
      g.appendChild(t);
    } else {
      g = document.createElement("div");
      g.className = "pghost";
      var im = document.createElement("img");
      im.src = card.dataset.full || "";
      im.alt = "";
      im.style.filter = "grayscale(28%)";
      g.appendChild(im);
    }
    g.style.left = rect.left + "px";
    g.style.top = rect.top + "px";
    g.style.width = rect.width + "px";
    g.style.height = rect.height + "px";
    document.body.appendChild(g);
    return g;
  }
  function openFrame(card) {
    if (!pModal || pModalOpen) return;
    var isGraphic = fillFrame(card);
    pLastFocus = document.activeElement;
    pModalOpen = true;
    pSourceCard = card;
    haptic("medium");
    if (lenis) lenis.stop();
    var media = card.querySelector(".pcard__media, .pcard__type");
    var fig = pModal.querySelector(".pmodal__fig");
    var backdrop = pModal.querySelector(".pmodal__backdrop");
    var pmMedia = document.getElementById("pmMedia");
    var pmImg = document.getElementById("pmImg");
    if (reduceMotion || !media) {
      pModal.hidden = false;
      var closeBtn = pModal.querySelector("[data-pclose].pmodal__close");
      if (closeBtn) closeBtn.focus();
      return;
    }
    /* lay out the dialog invisibly, then morph once the image box is known */
    pModal.hidden = false;
    fig.classList.add("is-hidden");
    gsap.set(backdrop, { opacity: 0 });
    gsap.set(pModal.querySelector(".pmodal__close"), { opacity: 0 });
    var started = false;
    function begin() {
      if (started) return;
      started = true;
      var srcRect = media.getBoundingClientRect();
      var dstRect = pmMedia.getBoundingClientRect();
      media.style.visibility = "hidden";
      pGhost = makeGhost(card, srcRect, isGraphic);
      var img = pGhost.querySelector("img");
      var tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: function () {
        if (pGhost && pGhost.parentNode) pGhost.parentNode.removeChild(pGhost);
        pGhost = null;
        fig.classList.remove("is-hidden");
        gsap.to(pModal.querySelector(".pmodal__close"), { opacity: 1, duration: 0.2, delay: 0.15 });
        var btn = pModal.querySelector("[data-pclose].pmodal__close");
        if (btn) btn.focus();
      }});
      tl.to(backdrop, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);
      tl.to(pGhost, { left: dstRect.left, top: dstRect.top, width: dstRect.width, height: dstRect.height, duration: 0.38 }, 0);
      if (img) tl.to(img, { filter: "grayscale(0%)", duration: 0.38 }, 0);
    }
    if (isGraphic || (pmImg.complete && pmImg.naturalWidth)) begin();
    else {
      pmImg.addEventListener("load", begin, { once: true });
      setTimeout(begin, 900);
    }
    pMorphed = true;
  }
  function closeFrame() {
    if (!pModal || !pModalOpen) return;
    haptic("light");
    var backdrop = pModal.querySelector(".pmodal__backdrop");
    var fig = pModal.querySelector(".pmodal__fig");
    var pmMedia = document.getElementById("pmMedia");
    function done() {
      if (pGhost && pGhost.parentNode) pGhost.parentNode.removeChild(pGhost);
      pGhost = null;
      var media = pSourceCard ? pSourceCard.querySelector(".pcard__media, .pcard__type") : null;
      if (media) media.style.visibility = "";
      pModal.hidden = true;
      pModalOpen = false;
      pMorphed = false;
      pSourceCard = null;
      fig.classList.remove("is-hidden");
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(pModal.querySelector(".pmodal__close"), { opacity: 1 });
      if (lenis) lenis.start();
      if (pLastFocus && pLastFocus.focus) pLastFocus.focus();
    }
    if (reduceMotion || !pMorphed || !pSourceCard || !document.contains(pSourceCard)) { done(); return; }
    var isGraphic = !!pSourceCard.dataset.graphic;
    var media = pSourceCard.querySelector(".pcard__media, .pcard__type");
    var fromRect = pmMedia.getBoundingClientRect();
    var toRect = media.getBoundingClientRect();
    fig.classList.add("is-hidden");
    gsap.set(pModal.querySelector(".pmodal__close"), { opacity: 0 });
    pGhost = makeGhost(pSourceCard, fromRect, isGraphic);
    var img = pGhost.querySelector("img");
    if (img) img.style.filter = "grayscale(0%)";
    var tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: done });
    tl.to(backdrop, { opacity: 0, duration: 0.28, ease: "power2.in" }, 0);
    tl.to(pGhost, { left: toRect.left, top: toRect.top, width: toRect.width, height: toRect.height, duration: 0.36 }, 0);
    if (img) tl.to(img, { filter: "grayscale(28%)", duration: 0.36 }, 0);
  }
  if (pModal) {
    document.querySelectorAll("[data-prows] .pcard").forEach(function (card) {
      card.addEventListener("pointerdown", function () { haptic("light"); });
      card.addEventListener("click", function () { openFrame(card); });
    });
    pModal.querySelectorAll("[data-pclose]").forEach(function (el) { el.addEventListener("click", closeFrame); });
    pModal.addEventListener("click", function () { closeFrame(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && pModalOpen) closeFrame();
    });
  }

  /* Works inline expanding series, replaces the old popup carousel */
  var workList = document.getElementById("workList");
  if (workList) {
    Object.keys(PROJECTS).forEach(function (k) {
      var im = new Image(); im.src = IMG + PROJECTS[k].frames[0];
    });
    var openKey = null;
    function buildDrawer(li, key) {
      var p = PROJECTS[key];
      var drawer = li.querySelector(".work__drawer");
      if (drawer.dataset.built === "1") return drawer;
      var inner = document.createElement("div");
      inner.className = "work__drawer-inner";
      var grid = document.createElement("div");
      grid.className = "work__frames";
      p.frames.forEach(function (file, idx) {
        var fig = document.createElement("figure");
        var im = document.createElement("img");
        im.src = IMG + file;
        im.alt = p.alt + ", frame " + (idx + 1) + " of " + p.frames.length;
        im.loading = "lazy";
        im.decoding = "async";
        var cap = document.createElement("figcaption");
        cap.textContent = "Frame " + String(idx + 1).padStart(2, "0") + " of " + p.frames.length;
        fig.appendChild(im);
        fig.appendChild(cap);
        grid.appendChild(fig);
        im.addEventListener("pointerdown", function () { haptic("light"); });
      });
      inner.appendChild(grid);
      drawer.appendChild(inner);
      drawer.dataset.built = "1";
      return drawer;
    }
    function setDrawer(li, open) {
      var drawer = li.querySelector(".work__drawer");
      var btn = li.querySelector(".work__open");
      if (open) {
        li.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        var inner = drawer.querySelector(".work__drawer-inner");
        var target = inner ? inner.offsetHeight : 0;
        if (!reduceMotion) {
          gsap.to(drawer, { height: target, duration: 0.7, ease: "power4.out", onComplete: function () {
            drawer.style.height = "auto";
            if (hasST) ScrollTrigger.refresh();
          }});
          gsap.fromTo(drawer.querySelectorAll(".work__frames figure"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 0.1 });
        } else { drawer.style.height = "auto"; }
      } else {
        li.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        if (!reduceMotion) {
          var cur = drawer.offsetHeight;
          gsap.fromTo(drawer, { height: cur }, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: function () {
            if (hasST) ScrollTrigger.refresh();
          }});
        } else { drawer.style.height = "0px"; }
      }
    }
    function closeOthers(except) {
      workList.querySelectorAll(".work.is-open").forEach(function (li) {
        if (li !== except) setDrawer(li, false);
      });
    }
    workList.querySelectorAll(".work").forEach(function (li) {
      var key = li.dataset.project;
      if (!PROJECTS[key]) return;
      buildDrawer(li, key);
      var btn = li.querySelector(".work__open");
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var willOpen = !li.classList.contains("is-open");
        haptic(willOpen ? "medium" : "light");
        if (willOpen) { closeOthers(li); openKey = key; }
        else if (openKey === key) openKey = null;
        setDrawer(li, willOpen);
        if (willOpen && history.replaceState) {
          try { history.replaceState(null, "", "#" + key); } catch (e) {}
        }
      });
    });
    /* deep link opens its series */
    function openFromHash() {
      var id = (location.hash || "").replace("#", "");
      if (!id || !PROJECTS[id]) return;
      var li = workList.querySelector('[data-project="' + id + '"]');
      if (li && !li.classList.contains("is-open")) {
        closeOthers(li);
        setDrawer(li, true);
        openKey = id;
        setTimeout(function () {
          if (lenis) lenis.scrollTo(li, { offset: -90, duration: 1.2 });
          else li.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
  }

  /* Small taps get a light tick */
  document.querySelectorAll(".peek, .menu-btn, .practice-grid li").forEach(function (el) {
    el.addEventListener("pointerdown", function () { haptic("light"); });
  });
  document.querySelectorAll(".btn, .to-top, .finale__copy, .work__open").forEach(function (el) {
    el.addEventListener("click", function () { haptic("medium"); });
  });
  document.querySelectorAll('.finale__grid a').forEach(function (a) {
    a.addEventListener("click", function () {
      if (a.hasAttribute("data-copy")) return;
      haptic("page");
    });
  });

  /* Copy email plus toast */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.innerHTML = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2400);
  }
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;
      haptic("strong");
      function done() { showToast("Email copied: <b>" + text + "</b>"); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(); });
      } else fallback();
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); }
        catch (e) { showToast(text); }
        document.body.removeChild(ta);
      }
    });
  });

  /* Kochi clock */
  document.querySelectorAll("[data-kochi]").forEach(function (el) {
    try {
      var fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
      (function tick() {
        try { el.textContent = fmt.format(new Date()) + " IST, Kochi"; } catch (e) { el.textContent = "Kochi, India"; }
      })();
      setInterval(function () {
        try { el.textContent = fmt.format(new Date()) + " IST, Kochi"; } catch (e) {}
      }, 30000);
    } catch (e) { el.textContent = "Kochi, India"; }
  });

  /* Back to top via Lenis */
  document.querySelectorAll("[data-top]").forEach(function (btn) {
    btn.addEventListener("click", function () { haptic("medium"); scrollToTarget(0); });
  });

  window.addEventListener("load", function () { if (hasST) ScrollTrigger.refresh(); });
})();
