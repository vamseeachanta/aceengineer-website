/* Vanilla JS navbar toggle - replaces jQuery + Bootstrap JS (68KB savings) */
(function() {
    'use strict';

    var COLLAPSE_TRANSITION_MS = 350; // matches .collapsing transition-duration: 0.35s

    document.addEventListener('DOMContentLoaded', function() {
        var toggleBtn = document.querySelector('[data-toggle="collapse"]');
        if (!toggleBtn) return;

        var targetId = toggleBtn.getAttribute('data-target');
        var target = document.querySelector(targetId);
        if (!target) return;

        toggleBtn.addEventListener('click', function() {
            var isOpen = target.classList.contains('in');

            if (isOpen) {
                // Collapse: animate height to 0
                target.style.height = target.scrollHeight + 'px';
                target.offsetHeight; // force reflow
                target.style.height = '0px';
                target.classList.add('collapsing');
                target.classList.remove('collapse', 'in');

                setTimeout(function() {
                    target.classList.remove('collapsing');
                    target.classList.add('collapse');
                    target.style.height = '';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }, COLLAPSE_TRANSITION_MS);
            } else {
                // Expand: animate height from 0 to scrollHeight
                target.classList.remove('collapse');
                target.classList.add('collapsing');
                target.style.height = '0px';
                target.offsetHeight; // force reflow
                target.style.height = target.scrollHeight + 'px';

                setTimeout(function() {
                    target.classList.remove('collapsing');
                    target.classList.add('collapse', 'in');
                    target.style.height = '';
                    toggleBtn.setAttribute('aria-expanded', 'true');
                }, COLLAPSE_TRANSITION_MS);
            }
        });
    });
})();
