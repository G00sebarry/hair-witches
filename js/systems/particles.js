/* ============================================================
   PARTICLES — Trail, burst, and special effects
   ============================================================ */

const Particles = (() => {
  let particles = [];
  
  class Particle {
    constructor(x, y, color, type = 'trail') {
      this.x = x;
      this.y = y;
      this.color = color;
      this.type = type;
      
      if (type === 'trail') {
        this.vx = -Math.random() * 2 - 1;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 0.4 + Math.random() * 0.4;
        this.size = 2 + Math.random() * 3;
      } else if (type === 'burst') {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0.3 + Math.random() * 0.5;
        this.size = 3 + Math.random() * 5;
      } else if (type === 'sparkle') {
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -1 - Math.random() * 3;
        this.life = 0.5 + Math.random() * 0.5;
        this.size = 1 + Math.random() * 2;
      } else if (type === 'shieldBurst') {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0.6 + Math.random() * 0.4;
        this.size = 2 + Math.random() * 4;
      }
      
      this.maxLife = this.life;
    }
    
    update(dt) {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= dt;
      
      if (this.type === 'trail') this.vx -= 0.5 * dt;
      if (this.type === 'sparkle') this.vy += 2 * dt;
    }
    
    draw() {
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      
      if (this.type === 'sparkle') {
        // Star shape
        const s = this.size * alpha;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.life * 5);
        ctx.fillRect(-s / 2, -0.5, s, 1);
        ctx.fillRect(-0.5, -s / 2, 1, s);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
    }
    
    get dead() { return this.life <= 0; }
  }
  
  function spawnTrail(x, y, colors) {
    particles.push(new Particle(x, y, randFrom(colors), 'trail'));
  }
  
  function spawnBurst(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color, 'burst'));
    }
  }
  
  function spawnSparkle(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color, 'sparkle'));
    }
  }
  
  function spawnShieldBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, COL.cyan, 'shieldBurst'));
    }
  }
  
  function update(dt) {
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
  }
  
  function draw() {
    particles.forEach(p => p.draw());
  }
  
  function clear() {
    particles = [];
  }
  
  return { spawnTrail, spawnBurst, spawnSparkle, spawnShieldBurst, update, draw, clear };
})();
