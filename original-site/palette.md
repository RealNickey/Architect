# GT Architects — Original Site Design Inventory
Source: https://www.gtarchitects.in/ (template: Aesthetic by freehtml5.co)
Date: 2026-09-24
CSS analyzed: `css/style.css` (custom theme), `css/bootstrap.css` (v3.3.5 stock), `css/animate.css` (no colors), `css/owl.carousel.min.css` + `css/owl.theme.default.min.css`, `css/icomoon.css` + `css/themify-icons.css` (icon fonts)
Google Fonts: `https://fonts.googleapis.com/css?family=Merriweather:300,400|Montserrat:400,700`

No images downloaded. No git init. See `palette.json` for machine-readable frequencies.

## Primary palette (7 — visual weight, not just count)

| # | Name / usage | Hex |
|---|---|---|
| 1 | Mint / emerald accent — links `a`, `::selection`, `.btn-primary` bg/border, counter, news h3, social icons | `#52D681` |
| 2 | Pure black — `h1-h6`, logo link, nav hover/active, dropdown bg, blockquote | `#000000` |
| 3 | Body gray — `body{color}`, `.gtco-item p` | `#777777` |
| 4 | Footer charcoal — `#gtco-footer{background}` | `#262626` |
| 5 | Copyright near-black — `.gtco-copyright{background}` | `#1A1A1A` |
| 6 | Light section gray — `.gtco-gray`, `.gtco-client{background}` | `#F6F6F6` |
| 7 | White — page bg, footer `h3`, cover headings | `#FFFFFF` |

Supporting neutrals: `#CCCCCC` nav links / dots / icons, `#B3B3B3` post-date / carousel arrows, `#4D4D4D` section `h2` + active dot, `#666666` mobile nav border / testimonial author, `#D3F1ED` hero text (pale mint).

## Color swatches — full hex list (style.css, normalized 6-digit, case-insensitive count)

Top 20 by frequency in `style.css` (total 154 hex tokens, 32 unique):

```
#FFFFFF x44
#52D681 x24
#000000 x21
#CCCCCC x6
#5CB85C x5
#5BC0DE x5
#F0AD4E x5
#D9534F x5
#B3B3B3 x3
#252525 x3
#777777 x2
#666666 x2
#F6F6F6 x2
#D3F1ED x2
#4D4D4D x2
#67DB90 x2 (btn-primary hover)
#4CAE4C x2
#46B8DA x2
#EEA236 x2
#D43F3A x2
```

Remaining (x2/x1 — still load-bearing for luxury mapping):
```
#2F9051 x2 (btn-special text)
#999999 x1 (dropdown link)
#262626 x1 (footer bg — large area)
#1A1A1A x1 (copyright bar — large area)
#BFBFBF x1 (.role)
#F2F2F2 x1 (news border)
#34A7BD x1 (header .btn)
#D9D9D9 x1 (section border-bottom)
#898989 x1 (section p)
#444444 x1 (nav-toggle active)
#303841 x1 (#gtco-portfolio bg slate)
#E6E6E6 x1 (.gto-features top border)
```

RGBA tokens (shadows/overlays):
```
rgba(0,0,0,0.75) x9 (hero bottom gradient shadow, btn-cta hover)
rgba(0,0,0,0.15) x6 (dropdown shadow, btn shadow)
rgba(0,0,0,0.1) x4 (btn hover, form border rgba(0,0,0,0.1))
rgba(0,0,0,0.7) x2 (offcanvas overlay, carousel nav bg)
rgba(0,0,0,0.5) x2 (counter-label, gototop bg)
rgba(29,43,83,0.89) x1 (.gtco-cover .overlay navy)
rgba(255,255,255,0.5/0.8/0.2) x3 (offcanvas links)
rgba(255,255,255,0.7) x1 (portfolio heading p)
```

Owl theme defaults (stock, overridden in style.css): `#FFFFFF`, `#D6D6D6` (dot/nav bg), `#869791` (active/hover).
Bootstrap v3.3.5 stock (not custom): `#337AB7` links, `#333333` body, `#EEEEEE` hr, `#777777` muted — overridden by style.css where used.

## Fonts

- Body: `"Merriweather", serif`, 400, 14px, line-height 1.7, `#777` — serif paragraphs, justified on index Work section.
- Headings: `"Montserrat", sans-serif`, 400, `#000`, margin `0 0 20px 0` — `h1,h2,h3,h4,h5,h6,figure`.
- Nav: Montserrat, logo 20px uppercase bold `#000`; links 13px uppercase ls `.05em`, `#CCCCCC` → hover/active `#000`; padding `30px 10px`.
- Section heading: `.gtco-heading h2` 40px/1.5 `#4D4D4D` weight 300; `p` 18px/1.7 `#898989`.
- Hero: `#gtco-header h1` 50px (cover 59px, mobile 34px) weight 100 `#D3F1ED`/`#FFF`; `p` 20px `#D3F1ED`.
- Buttons `.btn`: Montserrat 13px 700 ls 2px uppercase, padding `20px 30px`, radius 0 (square), shadow `0 5px 10px rgba(0,0,0,0.15)`; variants primary/success/info/warning/danger/white/special all 2px solid.
- Footer: `h3` `#FFF`; links uppercase 13px Montserrat; copyright `p` Montserrat.
- Icons: `icomoon` + `themify-icons` (e.g. `.ti-zip/.ti-hummer/.ti-plug`, `icon-arrow-up` gototop).

## Background images / logo (refs only, not downloaded)

- `images/logo2.jpg` — header `#gtco-logo a img` (replaces text logo `G. T. Architects`).
- `images/slider_1.jpg`, `slider_2.jpg`, `slider_3.jpg` — hero Owl fullwidth slides.
- `../images/loader.gif` on `#FFF` — `.gtco-loader` fullscreen z 9999.
- `owl.video.play.png` — Owl video play icon (unused on index).
- CSS overlays: `.gtco-cover .overlay rgba(29,43,83,0.89)` navy; hero item `:after` inset black gradient `rgba(0,0,0,0.75)`.

## Layout notes

- Container: `.gtco-container{max-width:1140px;margin:0 auto;padding:0 15px}` (not Bootstrap `.container`).
- Grid: Bootstrap v3 floats — `row` + `col-sm-2/col-xs-12` logo, `col-xs-10 menu-1`, `col-md-8 col-md-offset-2` centered heading, `col-md-4` footer widgets, `col-md-6` news/testimonials (commented out).
- Nav: `.gtco-nav{padding:30px 0;z-index:1001}`; mobile ≤768px `padding:10px 0;border-bottom:1px solid #666`; `menu-1/menu-2 display:none` → offcanvas `#gtco-offcanvas{width:270px;background:black}`.
- Carousel: Owl Carousel 2 — `.owl-carousel-fullwidth` hero (`.slider-copy h2` 24px/100 white bottom-left, dots `#CCC`→`#4D4D4D`, nav `rgba(0,0,0,0.7)`); `.owl-carousel-carousel` project strip (commented out on live index) with nav offset ±170px (desktop) / ±50px (≤992px), hidden ≤768px.
- Sections: `.gtco-section{padding:3em 0}`; `.gtco-gray #F6F6F6`; `#gtco-portfolio #303841 min-height:500px`; `.gto-features{border-top:1px solid #E6E6E6}`.
- Footer: `#gtco-footer{background:#262626;padding:7em 0 0}`; `.gtco-copyright{background:#1A1A1A;padding:30px 0}`.
- Forms: `.form-control{height:54px;font-size:18px;weight:300;border:2px solid rgba(0,0,0,0.1)}:focus{border-color:#52D681}`.
- Motion: Animate.css + `.animate-box{opacity:0}` JS reveal; `.gototop{50x50 rgba(0,0,0,0.5) radius:4px}`.

## Notes for luxury redesign (keep vs replace)

- Keep structure: 1140px container, editorial centered `h2+p` intro, fullwidth hero slider, dark footer — maps well to luxury (generous whitespace, centered serif intro).
- Replace mint `#52D681` (sporty/startup feel) with restrained luxury accent: deep bronze/champagne `#B9975B` or muted emerald `#1E3A32`; keep one accent only, drop Bootstrap semantic rainbow (`#5CB85C/#5BC0DE/#F0AD4E/#D9534F`) entirely.
- Elevate neutrals: `#777` body → warmer stone `#57534E` on ivory `#FAF9F6` (not pure `#FFF`); `#262626/#1A1A1A` footer → richer espresso `#1C1917` with hairline `rgba(255,255,255,0.12)` borders; `#F6F6F6` sections → `#F5F3EF`.
- Typography: swap Merriweather 14px/1.7 (small, blog-like) for larger light serif (e.g. Cormorant Garamond / Fraunces 17-18px/1.8 body, 300-400 display headings); tighten Montserrat uppercase nav/buttons (11-12px, ls .12-.2em) or move to refined grotesk (Inter/Manrope) + serif display pairing.
- Buttons: remove square 0-radius + heavy shadow; use 1px hairline outline or pill with subtle blur; reduce padding `20px 30px` → `14px 28px`.
- Hero: keep Owl/fullwidth pattern but replace gradient `rgba(0,0,0,0.75)` scrim with softer bottom scrim + oversized serif caption + thin rule; consider 70-85vh height instead of 900px fixed.
- Logo: `logo2.jpg` JPG (opaque) → SVG wordmark with wide tracking on transparent; ensure legible over imagery.
- Accessibility: `#CCCCCC` on white and `#52D681` on white fail contrast — luxury palette must pass AA for small uppercase labels.
