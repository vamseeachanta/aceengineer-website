/* CTA tracking (W10, aceengineer-website#29)
 *
 * Turns the data-cta / data-src tags on call-to-action links into Google
 * Analytics events, so hand-offs into the capability surface are attributable
 * by source tag (src_web_<domain>[_<workflow>]).
 *
 * The tags were originally minted for web -> Telegram hand-offs. Those CTAs were
 * removed site-wide on 2026-07-28 (#89: /capabilities/ is the sole destination),
 * and the src_ tags were carried over onto the replacement links so the existing
 * attribution history stays continuous rather than resetting.
 *
 * Emits gtag('event', 'cta_click', { cta_type, cta_source, destination,
 * page_path }). Falls back to dataLayer.push when gtag isn't ready, and is a
 * no-op if neither exists, so it never breaks a page.
 */
(function () {
    'use strict';

    function send(eventName, params) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params);
            return true;
        }
        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push(Object.assign({ event: eventName }, params));
            return true;
        }
        return false;
    }

    function onClick(el) {
        return function () {
            send('cta_click', {
                cta_type: el.getAttribute('data-cta') || 'unknown',
                cta_source: el.getAttribute('data-src') || '',
                destination: el.getAttribute('href') || '',
                page_path: window.location ? window.location.pathname : ''
            });
        };
    }

    function init() {
        var ctas = document.querySelectorAll('[data-cta]');
        for (var i = 0; i < ctas.length; i++) {
            ctas[i].addEventListener('click', onClick(ctas[i]));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exposed for unit testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { send: send, init: init };
    }
})();
