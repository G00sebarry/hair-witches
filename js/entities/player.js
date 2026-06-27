/* ============================================================
   PLAYER — Witch entity with lives, shield, invincibility
   Фикс: касание дна отнимает жизнь И выталкивает вверх (нет залипания)
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
    if (dead) return null;

    // Physics
    if (Input.pressed) {
      vy += cfg.lift * dt;
    } else {
      vy += cfg.gravity * dt;
    }
    vy = clamp(vy, cfg.maxRise, cfg.maxFall);
    y += vy * dt;

    // Top boundary — мягкий упор
    if (y < 5) { y = 5; vy = 0; }

    // Bottom boundary — касание дна = урон + отскок вверх (вариант Б)
    if (y + cfg.height > H - 5) {
      y = H - cfg.height - 5;
      // Возвращаем сигнал столкновения с землёй; импульс вверх даём только
      // если урон реально прошёл (не во время неуязвимости) — это решает game.js,
      // но vy гасим всегда, чтобы не "вжимался" в пол.
      if (vy > 0) vy = 0;
      return 'ground_hit';
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

  // Импульс вверх — вызывается из game.js после успешного урона об землю,
  // чтобы ведьму подбросило и она не залипала на дне.
  function bounceUp() {
    vy = cfg.maxRise * 0.7; // резкий толчок вверх
    y -= 8;                 // чуть приподнять, чтобы выйти из зоны касания
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

    // ── Контурное свечение (rim glow), чтобы ведьма не сливалась с фоном ──
    // Свечение контрастного цвета к теме, рисуем как подложку под спрайт.
    const glowColor = theme.outlineColor || '#FFFFFF';

    // Shield visual — big obvious bubble
    if (shieldTimer > 0) {
      const blinkWarning = shieldTimer < 1.5;
      const shieldAlpha = blinkWarning ? (0.15 + 0.25 * Math.abs(Math.sin(time * 8))) : 0.25;

      ctx.globalAlpha = shieldAlpha;
      ctx.fillStyle = COL.cyan;
      ctx.beginPath();
      ctx.ellipse(0, 0, cfg.width / 2 + 10, cfg.height / 2 + 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = blinkWarning ? (0.4 + 0.5 * Math.abs(Math.sin(time * 8))) : 0.7;
      ctx.strokeStyle = COL.cyan;
      ctx.lineWidth = 3;
      ctx.shadowColor = COL.cyan;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(0, 0, cfg.width / 2 + 10, cfg.height / 2 + 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.globalAlpha = invincibleTimer > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(time * 15)) : 1;
    }

    // Выбор спрайта по состоянию
    let spriteState = 'idle';
    if (invincibleTimer > 0) spriteState = 'hurt';
    else if (Input.pressed || vy < 0) spriteState = 'fly';
    const sprite = Sprites.getWitchSprite(theme, spriteState) || witchSprite;

    // Контурное свечение: рисуем спрайт несколько раз со смещением как "ауру"
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.drawImage(sprite, -cfg.width / 2, -cfg.height / 2, cfg.width, cfg.height);
    // второй проход усиливает свечение
    ctx.shadowBlur = 6;
    ctx.drawImage(sprite, -cfg.width / 2, -cfg.height / 2, cfg.width, cfg.height);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  function takeDamage() {
    if (invincibleTimer > 0 || dead) return false;

    if (shieldTimer > 0) {
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
      return false; // уже максимум
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
    takeDamage, addShield, addLife, bounceUp,
    getHitbox, getCenter,
  };
})();
