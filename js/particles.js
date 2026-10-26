/**
 * PARTICLES.JS - Interactive Cyber Constellation Background & Victory Fireworks
 */

class ParticleSystem {
  constructor() {
    this.bgCanvas = document.getElementById('bg-canvas');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    this.bgParticles = [];
    this.fxParticles = [];
    this.isFxRunning = false;

    this.init();
  }

  init() {
    if (!this.bgCanvas || !this.fxCanvas) return;
    this.resize();
    this.createBgParticles();

    window.addEventListener('resize', () => {
      this.resize();
      this.createBgParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = e.touches[0].clientX;
        this.mouse.targetY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    });

    this.animateBg();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    [this.bgCanvas, this.fxCanvas].forEach(canvas => {
      canvas.width = this.width * this.dpr;
      canvas.height = this.height * this.dpr;
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
    });

    if (this.bgCtx) this.bgCtx.scale(this.dpr, this.dpr);
    if (this.fxCtx) this.fxCtx.scale(this.dpr, this.dpr);
  }

  createBgParticles() {
    this.bgParticles = [];
    // Gentle ambient cyber-dust
    const count = Math.min(Math.floor((this.width * this.height) / 22000), 40);
    const colors = ['#00f0ff', '#38bdf8', '#64748b', '#94a3b8'];

    for (let i = 0; i < count; i++) {
      this.bgParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1, // gentle upward drift
        radius: Math.random() * 0.8 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.25 + 0.08
      });
    }
  }

  animateBg() {
    requestAnimationFrame(() => this.animateBg());

    if (!this.bgCtx) return;
    this.bgCtx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;

    const count = this.bgParticles.length;

    // Subtle ambient cyber-dust (no distracting constellation lines)
    for (let i = 0; i < count; i++) {
      const p = this.bgParticles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Screen wrap
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.bgCtx.fillStyle = p.color;
      this.bgCtx.globalAlpha = p.baseAlpha;
      this.bgCtx.beginPath();
      this.bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.bgCtx.fill();
    }

    this.bgCtx.globalAlpha = 1;
  }

  /**
   * Spawns an explosion of neon confetti & glowing sparks for victory
   * @param {number} originX Screen X coordinate
   * @param {number} originY Screen Y coordinate
   */
  fireVictory(originX = this.width / 2, originY = this.height / 2) {
    const colors = ['#00f3ff', '#ff007f', '#ffd700', '#ffffff', '#a855f7'];
    const count = 130;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 4;
      const isStreak = Math.random() > 0.6;

      this.fxParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 4 + 2),
        size: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.014 + 0.008,
        gravity: 0.22,
        drag: 0.965,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        isStreak
      });
    }

    if (!this.isFxRunning) {
      this.isFxRunning = true;
      this.animateFx();
    }
  }

  /**
   * Spawns radiant golden neon sparks & confetti on achievement unlock
   */
  fireAchievement(originX = this.width - 150, originY = 60) {
    const goldPalette = ['#ffd700', '#f59e0b', '#fbbf24', '#ffffff', '#00f0ff', '#ffe066'];
    const count = 48;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2.5;
      const isSpark = Math.random() > 0.45;

      this.fxParticles.push({
        x: originX + (Math.random() - 0.5) * 80,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 2.5 + 1),
        size: Math.random() * 3.5 + 2,
        color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.02 + 0.012,
        gravity: 0.14,
        drag: 0.965,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        isStreak: isSpark
      });
    }

    if (!this.isFxRunning) {
      this.isFxRunning = true;
      this.animateFx();
    }
  }

  animateFx() {
    if (!this.fxCtx) return;
    this.fxCtx.clearRect(0, 0, this.width, this.height);

    for (let i = this.fxParticles.length - 1; i >= 0; i--) {
      const p = this.fxParticles[i];

      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.fxParticles.splice(i, 1);
        continue;
      }

      this.fxCtx.save();
      this.fxCtx.translate(p.x, p.y);
      this.fxCtx.rotate(p.rotation);
      this.fxCtx.globalAlpha = p.alpha;
      this.fxCtx.fillStyle = p.color;
      this.fxCtx.shadowColor = p.color;
      this.fxCtx.shadowBlur = 12;

      if (p.isStreak) {
        // High-tech elongated shard/streak
        this.fxCtx.fillRect(-p.size * 1.5, -p.size / 3, p.size * 3, p.size / 1.5);
      } else {
        // Cyber diamond
        this.fxCtx.beginPath();
        this.fxCtx.moveTo(0, -p.size);
        this.fxCtx.lineTo(p.size, 0);
        this.fxCtx.lineTo(0, p.size);
        this.fxCtx.lineTo(-p.size, 0);
        this.fxCtx.closePath();
        this.fxCtx.fill();
      }

      this.fxCtx.restore();
    }

    if (this.fxParticles.length > 0) {
      requestAnimationFrame(() => this.animateFx());
    } else {
      this.isFxRunning = false;
      this.fxCtx.clearRect(0, 0, this.width, this.height);
    }
  }
}

export const particles = new ParticleSystem();
