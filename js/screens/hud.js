/* ============================================================
   HUD — Score, lives, level indicator, shield timer
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
    
    // Score
    ctx.font = `bold ${16 * SCALE}px 'Orbitron', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = COL.fuchsia;
    ctx.shadowBlur = 8;
    ctx.fillStyle = COL.fuchsia;
    ctx.fillText(`${s}`, 15, 15);
    ctx.shadowBlur = 0;
    
    // Level indicator
    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.purple;
    ctx.fillText(`LVL ${level.id}: ${level.name}`, 15, 15 + 22 * SCALE);
    
    // Speed multiplier
    if (speedMultiplier > 1) {
      ctx.textAlign = 'right';
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.lime;
      ctx.globalAlpha = 0.6;
      ctx.fillText(`×${speedMultiplier.toFixed(1)}`, W - 15, 18);
      ctx.globalAlpha = 1;
    }
    
    // Lives (hearts)
    ctx.textAlign = 'right';
    const heartSize = 18 * SCALE;
    for (let i = 0; i < PLAYER_CONFIG.maxLives; i++) {
      const hx = W - 15 - i * (heartSize + 4 * SCALE);
      const hy = 38;
      
      if (i < lives) {
        // Filled heart
        ctx.fillStyle = '#FF4466';
        ctx.shadowColor = '#FF4466';
        ctx.shadowBlur = 6;
      } else {
        // Empty heart
        ctx.fillStyle = '#333';
        ctx.shadowBlur = 0;
      }
      
      ctx.font = `${heartSize}px sans-serif`;
      ctx.fillText('♥', hx, hy);
    }
    ctx.shadowBlur = 0;
    
    // Shield indicator
    if (shieldTimer > 0) {
      ctx.textAlign = 'center';
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.cyan;
      ctx.shadowColor = COL.cyan;
      ctx.shadowBlur = 5;
      const shieldText = `🛡 ${shieldTimer.toFixed(1)}s`;
      ctx.fillText(shieldText, W / 2, 18);
      ctx.shadowBlur = 0;
    }
    
    // Bottom progress bar: countdown timer for level 1, score bar for others
    const barW = 120 * SCALE;
    const barH = 6 * SCALE;
    const barX = W / 2 - barW / 2;
    const barY = H - 20;

    if (level.id === 1) {
      const DURATION = 90;
      const elapsed = Math.min(levelTime || 0, DURATION);
      const remaining = Math.max(0, DURATION - elapsed);
      const progress = clamp(elapsed / DURATION, 0, 1);
      const urgent = remaining < 15;
      const barColor = urgent ? COL.red : COL.lime;

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#222';
      roundRect(barX, barY, barW, barH, 3);
      ctx.fill();

      ctx.globalAlpha = urgent ? 0.9 : 0.7;
      ctx.fillStyle = barColor;
      if (progress > 0) {
        roundRect(barX, barY, barW * progress, barH, 3);
        ctx.fill();
      }

      ctx.globalAlpha = 0.6;
      ctx.font = `${6 * SCALE}px 'Orbitron', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = urgent ? barColor : COL.white;
      ctx.fillText(`${Math.ceil(remaining)}s`, W / 2, barY - 4);
      ctx.globalAlpha = 1;
    } else if (level.targetScore !== Infinity) {
      const progress = clamp(score / level.targetScore, 0, 1);

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#222';
      roundRect(barX, barY, barW, barH, 3);
      ctx.fill();

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = COL.lime;
      if (progress > 0) {
        roundRect(barX, barY, barW * progress, barH, 3);
        ctx.fill();
      }

      ctx.globalAlpha = 0.5;
      ctx.font = `${6 * SCALE}px 'Orbitron', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = COL.white;
      ctx.fillText(`${score}/${level.targetScore}`, W / 2, barY - 4);
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }
  
  return { draw, reset };
})();
