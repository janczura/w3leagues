// Frostmourne-style runes in the side margins that stay invisible until the cursor's
// "light" falls near them. We feed the pointer position into CSS custom properties;
// a radial mask on the veil (see app.css) reveals only the runes within that glow.
(function () {
    const veil = document.getElementById('runes');
    if (!veil) {
        return;
    }
    // No hover on touch devices — nothing would ever reveal the runes, so skip.
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
        return;
    }

    let mx = -9999;
    let my = -9999;
    let queued = false;

    function apply() {
        queued = false;
        veil.style.setProperty('--mx', mx + 'px');
        veil.style.setProperty('--my', my + 'px');
    }

    function schedule() {
        if (!queued) {
            queued = true;
            window.requestAnimationFrame(apply);
        }
    }

    window.addEventListener('pointermove', function (e) {
        mx = e.clientX;
        my = e.clientY;
        schedule();
    }, { passive: true });

    // Move the light off-screen when the pointer leaves the window so runes fade out.
    function dim() {
        mx = -9999;
        my = -9999;
        schedule();
    }
    document.addEventListener('mouseleave', dim);
    window.addEventListener('blur', dim);
})();
