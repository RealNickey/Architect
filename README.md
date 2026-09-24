# GT Architects — Scrape + Luxury Redesign Base

Source: https://www.gtarchitects.in/index.html (mirrored Sep 2026)

## Structure
- `original-site/` — full static mirror (preserved for redesign reference)
  - `index.html, about.html, services.html, portfolio.html, gallery.html, contact.html, robots.txt`
  - `css/` (7 files: style.css, bootstrap.css, animate.css, icomoon.css, themify-icons.css, owl.carousel + theme)
  - `js/` (9 files: jquery, bootstrap, easing, waypoints, owl.carousel, main.js, modernizr, respond, google_map.js)
  - `fonts/` (icomoon + themify eot/svg/ttf/woff)
  - `images/` (35 files, ~24MB — sliders, logo, staff, 7 projects x3-4 photos)
  - `content-inventory.json / .md` — all text, nav, footer, projects, images per page
  - `palette.json / .md` — colors, fonts, luxury redesign notes
- `mirror_site.py` — scrape script (urllib, preserves structure, parses CSS url())

## Inventory Summary
- Pages: 6/6 (index 223w, about 361w, services 196w, portfolio 291w, gallery 22w, contact 141w — ~1234w total)
- Images: 35 (logo2.jpg, slider_1-3.jpg, staff_2-3.jpg, Alias x4, Banquet x4, Devi x4, Long Court x4, Peter x4, Raju x4, Synch x3, loader.gif)
- Contact: Palathinkal Genesis Complex, 1st Floor Shop C4, Thiruvankulam P.O, Ernakulam KL 682305 / +91 98954 44232 / info@gtarchitects.in
- Projects (7): TRIGON Alias Residence, Emerald Banquet Hall, Devi Residence, Long Court, Peter Residence, Raju Residence, Synch House
- Palette: #52D681 mint accent, #000 headings, #777 body, #262626/#1A1A1A footer, #F6F6F6 section, #FFF bg / Merriweather body + Montserrat headings / FH5CO Aesthetic + Bootstrap 3 + Owl Carousel
- Note: filenames contain spaces — URL-encode (%20) on redesign. 20 false-positive 404s skipped (meta strings, img_1-3.jpg commented out, sitemap/favicon). Externals skipped: Google Fonts, Google Maps, freehtml5/pixeden/unsplash.

## Redesign Next Steps
Use `original-site/images/` + `content-inventory.*` + `palette.*` to build luxury architecture agency site (bronze/champagne replacing mint, ivory/espresso neutrals, light serif + tight sans).
