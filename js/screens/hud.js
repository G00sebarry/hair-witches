/* ============================================================
   HUD — Score, lives, countdown timer, shield
   Раскладка: очки+жизни слева сверху, таймер крупным числом по центру
   ============================================================ */

const HUD = (() => {
  let displayScore = 0;

  function reset() {
    displayScore = 0;
  }

  function draw(score, lives, level, speedMultiplier, shieldTimer, time, levelTime) {
    // Smooth score counter
    displayScore += (score - displayScore) * 0.15;
    if (Math.abs(displayScore - score) < 1) displayScore = score;
    const s = Math.round(displayScore);

    ctx.save();

    // ── СЛЕВА ВВЕРХУ: очки ──────────────────────────────
    ctx.font = `bold ${16 * SCALE}px 'Orbitron', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = COL.fuchsia;
    ctx.shadowBlur = 8;
    ctx.fillStyle = COL.fuchsia;
    ctx.fillText(`${s}`, 15, 12);
    ctx.shadowBlur = 0;

    // подпись "очки"
    ctx.font = `${7 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.purple;
    ctx.globalAlpha = 0.7;
    ctx.fillText('очки', 16, 12 + 20 * SCALE);
    ctx.globalAlpha = 1;

    // ── СЛЕВА, ПОД ОЧКАМИ: жизни (сердца) ───────────────
    const heartSize = 20 * SCALE;
    const heartY = 12 + 32 * SCALE;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let i = 0; i < PLAYER_CONFIG.maxLives; i++) {
      const hx = 15 + i * (heartSize * 0.95);

      if (i < lives) {
        ctx.fillStyle = '#FF4466';
        ctx.shadowColor = '#FF4466';
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = '#3a2030';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.8;
      }
      ctx.font = `${heartSize}px sans-serif`;
      ctx.fillText('♥', hx, heartY);
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // ── ПО ЦЕНТРУ ВВЕРХУ: обратный таймер крупным числом ─
    if (level.id === 1) {
      const DURATION = 90;
      const elapsed = Math.min(levelTime || 0, DURATION);
      const remaining = Math.max(0, Math.ceil(DURATION - elapsed));
      const urgent = remaining <= 15;
      const timerColor = urgent ? COL.red : COL.white;

      // пульсация в последние 15 секунд
      const pulse = urgent ? (1 + 0.12 * Math.sin(time * 8)) : 1;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const tx = W / 2;
      const ty = 12;

      // большое число
      ctx.font = `bold ${Math.round(28 * SCALE * pulse)}px 'Orbitron', sans-serif`;
      ctx.shadowColor = urgent ? COL.red : COL.cyan;
      ctx.shadowBlur = urgent ? 14 : 8;
      ctx.fillStyle = timerColor;
      ctx.fillText(`${remaining}`, tx, ty);
      ctx.shadowBlur = 0;

      // подпись "сек"
      ctx.font = `${7 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = urgent ? COL.red : COL.purple;
      ctx.globalAlpha = 0.8;
      ctx.fillText('сек до Hair Witches', tx, ty + 30 * SCALE);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ── Множитель скорости (мелко, под таймером слева от центра) ─
    if (speedMultiplier > 1) {
      ctx.textAlign = 'center';
      ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.lime;
      ctx.globalAlpha = 0.5;
      ctx.fillText(`скорость ×${speedMultiplier.toFixed(1)}`, W / 2, 12 + 44 * SCALE);
      ctx.globalAlpha = 1;
    }

    // ── Индикатор щита (под жизнями слева) ──────────────
    if (shieldTimer > 0) {
      ctx.textAlign = 'left';
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.cyan;
      ctx.shadowColor = COL.cyan;
      ctx.shadowBlur = 5;
      ctx.fillText(`🛡 ${shieldTimer.toFixed(1)}s`, 15, heartY + 26 * SCALE);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  return { draw, reset };
})();
