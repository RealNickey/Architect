// Codrops Sketch 021: SVG Path Page Transition (Vertical)
// Source: https://github.com/codrops/codrops-sketches/tree/main/021-svg-path-page-transition-vertical
// Copied verbatim: paths, timeline segments, durations and easings.
// Minimal wiring only: cover on internal link click, uncover on arrival.

// overlay (SVG path element)
const overlayPath = document.querySelector('.overlay__path');

// paths
// edit here: https://yqnn.github.io/svg-path-editor/
const paths = {
    step1: {
        unfilled: 'M 0 100 V 100 Q 50 100 100 100 V 100 z',
        inBetween: {
            curve1: 'M 0 100 V 50 Q 50 0 100 50 V 100 z',
            curve2: 'M 0 100 V 50 Q 50 100 100 50 V 100 z'
        },
        filled: 'M 0 100 V 0 Q 50 0 100 0 V 100 z',
    },
    step2: {
        filled: 'M 0 0 V 100 Q 50 100 100 100 V 0 z',
        inBetween: {
            curve1: 'M 0 0 V 50 Q 50 0 100 50 V 0 z',
            curve2: 'M 0 0 V 50 Q 50 100 100 50 V 0 z'
        },
        unfilled: 'M 0 0 V 0 Q 50 0 100 0 V 0 z',
    }
};

let isAnimating = false;

// Wiring for multi-page site: cover, then navigate.
// Uncover runs on the next page (see loader below).
const coverAndGo = (url) => {

    if ( isAnimating ) return;
    isAnimating = true;

    gsap.timeline({
            onComplete: () => { window.location.href = url; }
        })
        .set(overlayPath, {
            attr: { d: paths.step1.unfilled }
        })
        .to(overlayPath, {
            duration: 0.8,
            ease: 'power4.in',
            attr: { d: paths.step1.inBetween.curve1 }
        }, 0)
        .to(overlayPath, {
            duration: 0.2,
            ease: 'power1',
            attr: { d: paths.step1.filled }
        });

    // Safety: never trap the user if navigation stalls.
    setTimeout(() => {
        if ( window.location.href !== url ) window.location.href = url;
    }, 2200);
};

// Uncover on arrival (verbatim second half of Codrops reveal).
const uncover = () => {

    if ( isAnimating ) return;
    isAnimating = true;

    gsap.timeline({
            onComplete: () => isAnimating = false
        })
        .set(overlayPath, {
            attr: { d: paths.step2.filled }
        })

        .to(overlayPath, {
            duration: 0.2,
            ease: 'sine.in',
            attr: { d: paths.step2.inBetween.curve1 }
        })
        .to(overlayPath, {
            duration: 1,
            ease: 'power4',
            attr: { d: paths.step2.unfilled }
        });
};

try {
    if ( sessionStorage.getItem('codrops021') === '1' ) {
        sessionStorage.removeItem('codrops021');
        uncover();
    }
} catch (e) {}

// Intercept internal page hops: cover, then navigate.
document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if ( !a || isAnimating ) return;
    const href = a.getAttribute('href');
    if ( !href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 ) return;
    if ( a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) return;
    let url;
    try { url = new URL(href, window.location.href); }
    catch (err) { return; }
    if ( url.origin !== window.location.origin ) return;
    const samePath = url.pathname === window.location.pathname;
    if ( samePath ) return;
    if ( url.pathname.indexOf('.html') === -1 && !url.pathname.endsWith('/') ) return;
    e.preventDefault();
    try { sessionStorage.setItem('codrops021', '1'); } catch (err) {}
    coverAndGo(url.href);
}, true);
