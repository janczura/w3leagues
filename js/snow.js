// Gentle background snowfall drawn on a full-viewport canvas that sits behind the
// page content. Honours prefers-reduced-motion (renders a still, faint scatter) and
// pauses while the tab is hidden to save battery.
(function () {
    const canvas = document.getElementById('snow');
    if (!canvas || !canvas.getContext) {
        return;
    }
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let flakes = [];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Scale flake count to the viewport, but keep it modest so it stays subtle.
        const target = Math.min(140, Math.round((width * height) / 16000));
        flakes = [];
        for (let i = 0; i < target; i++) {
            flakes.push(makeFlake(true));
        }
    }

    function makeFlake(anywhere) {
        return {
            x: Math.random() * width,
            y: anywhere ? Math.random() * height : -10,
            r: 0.8 + Math.random() * 2.6,          // radius
            speed: 0.25 + Math.random() * 0.75,    // slow fall
            drift: -0.3 + Math.random() * 0.6,     // gentle sideways sway
            phase: Math.random() * Math.PI * 2,    // sway offset
            opacity: 0.4 + Math.random() * 0.5
        };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (const f of flakes) {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + f.opacity + ')';
            ctx.fill();
        }
    }

    function step(now) {
        for (const f of flakes) {
            f.y += f.speed;
            f.x += f.drift + Math.sin((now / 1000) + f.phase) * 0.3;
            if (f.y - f.r > height) {
                Object.assign(f, makeFlake(false), { x: Math.random() * width });
            }
            if (f.x < -10) {
                f.x = width + 10;
            } else if (f.x > width + 10) {
                f.x = -10;
            }
        }
        draw();
        raf = window.requestAnimationFrame(step);
    }

    let raf = null;

    function start() {
        if (raf == null) {
            raf = window.requestAnimationFrame(step);
        }
    }

    function stop() {
        if (raf != null) {
            window.cancelAnimationFrame(raf);
            raf = null;
        }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stop();
        } else if (!reduce) {
            start();
        }
    });

    resize();
    if (reduce) {
        draw(); // a single, still frame — no animation
    } else {
        start();
    }
})();
