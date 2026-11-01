"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   1. TYPING EFFECT on the main heading
   ============================================================ */
(function typeHeading() {
    const h1 = document.querySelector(".heading h1");
    if (!h1) return;

    const fullText = h1.textContent.trim();
    if (reduceMotion) return;

    h1.textContent = "";
    const textNode = document.createTextNode("");
    const caret = document.createElement("span");
    caret.className = "caret";
    h1.append(textNode, caret);

    let i = 0;
    function type() {
        textNode.nodeValue = fullText.slice(0, ++i);
        if (i < fullText.length) setTimeout(type, 55);
    }
    setTimeout(type, 400);
})();

/* ============================================================
   2. PARTICLE BACKGROUND (connected dots that react to mouse)
   ============================================================ */
(function particles() {
    if (reduceMotion) return;

    const canvas = document.createElement("canvas");
    canvas.id = "bg-canvas";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");

    let w, h, dots;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = Math.min(90, Math.floor((w * h) / 16000));
        dots = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.6 + 0.6
        }));
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < dots.length; i++) {
            const p = dots[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(167, 139, 250, 0.8)";
            ctx.fill();

            // lines between close dots
            for (let j = i + 1; j < dots.length; j++) {
                const q = dots[j];
                const d = Math.hypot(p.x - q.x, p.y - q.y);
                if (d < 120) {
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.18 * (1 - d / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            // lines from dots to the mouse
            const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dm < 160) {
                ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 * (1 - dm / 160)})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ============================================================
   3. CURSOR GLOW that follows the mouse smoothly
   ============================================================ */
(function cursorGlow() {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let x = tx, y = ty;

    window.addEventListener("mousemove", (e) => {
        tx = e.clientX;
        ty = e.clientY;
    });

    (function follow() {
        x += (tx - x) * 0.12;
        y += (ty - y) * 0.12;
        glow.style.left = x + "px";
        glow.style.top = y + "px";
        requestAnimationFrame(follow);
    })();
})();

/* ============================================================
   4. SCROLL PROGRESS BAR
   ============================================================ */
(function progressBar() {
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    document.body.appendChild(bar);

    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
})();

/* ============================================================
   5. SCROLL REVEAL (elements fade + slide in one by one)
   ============================================================ */
(function scrollReveal() {
    const targets = [
        ...document.querySelectorAll(".details > *"),
        ...document.querySelectorAll("footer > *, footer form > div")
    ];

    targets.forEach((el, i) => {
        el.classList.add("reveal");
        el.style.setProperty("--delay", (i % 5) * 0.08 + "s");
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));
})();

/* ============================================================
   6. 3D TILT on the profile photo
   ============================================================ */
(function tiltPhoto() {
    const img = document.querySelector(".details > img");
    if (!img || reduceMotion) return;

    img.addEventListener("mousemove", (e) => {
        const r = img.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `perspective(600px) rotateY(${x * 28}deg) rotateX(${-y * 28}deg) scale(1.06)`;
    });

    img.addEventListener("mouseleave", () => {
        img.style.transform = "";
    });
})();

/* ============================================================
   7. BUTTON RIPPLE + FORM HANDLING with toast message
   ============================================================ */
(function formEffects() {
    const button = document.querySelector("button[type='submit']");
    const form = document.querySelector("form");
    if (!button || !form) return;

    // ripple where you click
    button.addEventListener("click", (e) => {
        const r = button.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - r.left - size / 2 + "px";
        ripple.style.top = e.clientY - r.top - size / 2 + "px";
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // toast popup
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // stops the page from going to /submit (which doesn't exist yet)
        const name = form.querySelector("#name").value.trim();
        showToast(`Thanks ${name}! Your message was sent ✨`);
        form.reset();
    });
})();