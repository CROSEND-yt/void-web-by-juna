
const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");

let particles = [];

const mouse = {
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    active: false
};

const CONFIG = {
    count: 180,
    connectionDistance: 145,
    mouseRadius: 260,
    mouseInfluence: 0.045,
    naturalSpeed: 0.35,
    damping: 0.985,
    maxSpeed: 1.8
};

// CREATE PARTICLES
function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;

    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = [];

    const count = Math.min(
        CONFIG.count,
        Math.floor(innerWidth * innerHeight / 4000)
    );

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,

            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,

            size: Math.random() * 1.4 + 0.8,

            phase: Math.random() * Math.PI * 2,
            drift: Math.random() * 0.02 + 0.005
        });
    }
}

window.addEventListener("resize", resizeCanvas);

// MOUSE TRACKING
window.addEventListener("mousemove", e => {
    const newX = e.clientX;
    const newY = e.clientY;

    if (mouse.active) {
        mouse.vx = newX - mouse.x;
        mouse.vy = newY - mouse.y;
    }

    mouse.x = newX;
    mouse.y = newY;
    mouse.active = true;
});

window.addEventListener("mouseout", e => {
    if (!e.relatedTarget) {
        mouse.active = false;
    }
});

window.addEventListener("blur", () => {
    mouse.active = false;
});


// UPDATE PARTICLES
function updateParticles(time) {

    particles.forEach(p => {

        // NATURAL MOVEMENT
        p.phase += p.drift;

        p.vx += Math.sin(p.phase) * 0.008;
        p.vy += Math.cos(p.phase * 0.8) * 0.008;

        // MOUSE FOLLOWING
        if (mouse.active) {

            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;

            const distance = Math.hypot(dx, dy);

            if (distance < CONFIG.mouseRadius && distance > 0) {

                const influence =
                    Math.pow(
                        1 - distance / CONFIG.mouseRadius,
                        2
                    );

                // Follow mouse direction
                // Not attracted into one central point
                p.vx += mouse.vx * CONFIG.mouseInfluence * influence;
                p.vy += mouse.vy * CONFIG.mouseInfluence * influence;

                // Gentle orbital movement around cursor
                const orbit = influence * 0.012;

                p.vx += (-dy / distance) * orbit;
                p.vy += (dx / distance) * orbit;
            }
        }

        // VELOCITY DAMPING
        p.vx *= CONFIG.damping;
        p.vy *= CONFIG.damping;

        // SPEED LIMIT
        const speed = Math.hypot(p.vx, p.vy);

        if (speed > CONFIG.maxSpeed) {
            p.vx = (p.vx / speed) * CONFIG.maxSpeed;
            p.vy = (p.vy / speed) * CONFIG.maxSpeed;
        }

        // MOVE
        p.x += p.vx;
        p.y += p.vy;

        // SCREEN BOUNDARIES
        if (p.x < -10) p.x = innerWidth + 10;
        if (p.x > innerWidth + 10) p.x = -10;

        if (p.y < -10) p.y = innerHeight + 10;
        if (p.y > innerHeight + 10) p.y = -10;
    });

    // Mouse influence gradually fades
    mouse.vx *= 0.88;
    mouse.vy *= 0.88;
}


// DRAW NETWORK
function drawNetwork() {

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    // CONNECTION LINES
    for (let i = 0; i < particles.length; i++) {

        let connections = 0;

        for (let j = i + 1; j < particles.length; j++) {

            const a = particles[i];
            const b = particles[j];

            const dx = a.x - b.x;
            const dy = a.y - b.y;

            const distance = Math.hypot(dx, dy);

            if (
                distance < CONFIG.connectionDistance &&
                connections < 6
            ) {

                const opacity =
                    (1 - distance / CONFIG.connectionDistance) * 0.32;

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);

                ctx.strokeStyle =
                    `rgba(55,55,55,${opacity})`;

                ctx.lineWidth = 2.0;
                ctx.stroke();

                connections++;
            }
        }
    }

    // PARTICLE POINTS
    particles.forEach(p => {

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.fillStyle = "#444";
        ctx.fill();
    });
}


// MAIN ANIMATION
function animate(time) {

    updateParticles(time);
    drawNetwork();

    requestAnimationFrame(animate);
}

resizeCanvas();
animate();


// TYPING EFFECT
const words = [
    "CHEAT DEVELOPER",
    "NETWORK ENTHUSIAST",
    "ETHICAL HACKER",
    "GAME MODDER"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {

    const element = document.getElementById("typing");
    const currentWord = words[wordIndex];

    element.textContent = currentWord.substring(0, charIndex);

    if (!deleting && charIndex < currentWord.length) {
        charIndex++;
        setTimeout(typeEffect, 100);
    }
    else if (deleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeEffect, 50);
    }
    else {
        deleting = !deleting;

        if (!deleting) {
            wordIndex = (wordIndex + 1) % words.length;
        }

        setTimeout(typeEffect, 700);
    }
}

typeEffect();
