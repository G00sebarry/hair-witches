/* ============================================================
   PLAYER — Witch entity with lives, shield, invincibility
   ============================================================ */

const Player = (() => {
  const cfg = PLAYER_CONFIG;
  
  let x = 0, y = 0;
  let vy = 0;
  let lives = 3;
  let shieldTimer = 0;
  let invincibleTimer = 0;
  let trailTimer = 0;
  let theme = WITCH_THEMES.neon;
  let witchSprite = null;
  let dead = false;
  
  function setTheme(t) {
    theme = t;
    witchSprite = Sprites.createWitch(theme);
  }
  
  function reset() {
    x = W * cfg.startX;
    y = H * cfg.startY;
    vy = 0;
    lives = cfg.maxLives;
    shieldTimer = 0;
    invincibleTimer = 0;
    trailTimer = 0;
    dead = false;
  }
  
  function update(dt) {
    if (dead) return;
    
    // Physics
    if (Input.pressed) {
      vy += cfg.lift * dt;
    } else {
      vy += cfg.gravity * dt;
    }
    vy = clamp(vy, cfg.maxRise, cfg.maxFall);
    y += vy * dt;
    
    // Boundaries - hitting bottom = death
    if (y < 5) { y = 5; vy = 0; }
    if (y + cfg.height > H - 5) {
      y = H - cfg.height - 5;
      vy = 0;
      // Ground hit = game over
      return 'ground_death';
    }
    
    // Timers
    if (shieldTimer > 0) shieldTimer -= dt;
    if (invincibleTimer > 0) invincibleTimer -= dt;
    
    // Trail particles
    trailTimer += dt;
    if (trailTimer > 0.03) {
      trailTimer = 0;
      Particles.spawnTrail(
        x + 8,
        y + cfg.height / 2 + (Math.random() - 0.5) * 10,
        theme.trailColors
      );
    }
    
    return null;
  }
  
  function draw(time) {
    if (dead) return;
    if (!witchSprite) return;
    
    ctx.save();
    
    // Invincibility blink
    if (invincibleTimer > 0) {
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 15));
    }
    
    // Tilt based on velocity
    const tilt = vy * 0.0003;
    ctx.translate(x + cfg.width / 2, y + cfg.height / 2);
    ctx.rotate(tilt);
    
    // Shield visual — big obvious bubble
    if (shieldTimer > 0) {
      const blinkWarning = shieldTimer < 1.5;
      const shieldAlpha = blinkWarning ? (0.15 + 0.25 * Math.abs(Math.sin(time * 8))) : 0.25;
      
      // Filled shield bubble
      ctx.globalAlpha = shieldAlpha;
      ctx.fillStyle = COL.cyan;
      ctx.beginPath();
      ctx.ellipse(0, 0, cfg.width / 2 + 10, cfg.height / 2 + 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright border
      ctx.globalAlpha = blinkWarning ? (0.4 + 0.5 * Math.abs(Math.sin(time * 8))) : 0.7;
      ctx.strokeStyle = COL.cyan;
      ctx.lineWidth = 3;
      ctx.shadowColor = COL.cyan;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(0, 0, cfg.width / 2 + 10, cfg.height / 2 + 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Restore alpha for witch sprite
      ctx.globalAlpha = invincibleTimer > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(time * 15)) : 1;
    }
    
    ctx.drawImage(witchSprite, -cfg.width / 2, -cfg.height / 2, cfg.width, cfg.height);
    ctx.restore();
  }
  
  function takeDamage() {
    if (invincibleTimer > 0 || dead) return false;
    
    if (shieldTimer > 0) {
      // Shield absorbs hit
      shieldTimer = 0;
      invincibleTimer = cfg.invincibleDuration;
      Particles.spawnShieldBurst(x + cfg.width / 2, y + cfg.height / 2);
      Audio8Bit.sfxShield();
      Camera.shake(0.2, 4);
      return false;
    }
    
    lives--;
    invincibleTimer = cfg.invincibleDuration;
    Camera.shake(0.4, 10);
    Camera.flash(0.3, '#FF0000');
    Audio8Bit.sfxHit();
    
    if (lives <= 0) {
      dead = true;
      Audio8Bit.sfxDeath();
      return true; // Dead
    }
    
    return false; // Still alive
  }
  
  function addShield() {
    shieldTimer = cfg.shieldDuration;
    Audio8Bit.sfxShield();
    Particles.spawnSparkle(x + cfg.width / 2, y + cfg.height / 2, COL.cyan, 10);
  }
  
  function addLife() {
    if (lives < cfg.maxLives) {
      lives++;
      Audio8Bit.sfxHeart();
      Particles.spawnSparkle(x + cfg.width / 2, y + cfg.height / 2, COL.pink, 10);
    } else {
      // Already max lives, give points instead
      return false;
    }
    return true;
  }
  
  function getHitbox() {
    const s = cfg.hitboxShrink;
    return {
      x: x + s.x,
      y: y + s.y,
      w: cfg.width - s.w,
      h: cfg.height - s.h,
    };
  }
  
  function getCenter() {
    return { x: x + cfg.width / 2, y: y + cfg.height / 2 };
  }
  
  return {
    get x() { return x; },
    get y() { return y; },
    get lives() { return lives; },
    get shieldTimer() { return shieldTimer; },
    get invincibleTimer() { return invincibleTimer; },
    get dead() { return dead; },
    get theme() { return theme; },
    setTheme, reset, update, draw,
    takeDamage, addShield, addLife,
    getHitbox, getCenter,
  };
})();
