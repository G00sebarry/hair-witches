/* ============================================================
   SCREEN: VICTORY — Level 1 cleared, promo code reward
   ============================================================ */

const VictoryScreen = (() => {
  let showTimer = 0;
  let restartBtnY = -1;

  function reset() {
    showTimer = 0;
    restartBtnY = -1;
  }

  function getRestartBtnY() {
    return restartBtnY;
  }

  function draw(totalScore, time) {
    showTimer += 0.016;

    // Victory overlay — dark green tint
    const overlayAlpha = Math.min(showTimer * 2, 0.82);
    ctx.fillStyle = `rgba(0, 8, 4, ${overlayAlpha})`;
    ctx.fillRect(0, 0, W, H);

    if (showTimer < 0.3) return;

    const cx = W / 2;
    let cy = H * 0.08;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Determine promo tier
    let tier = PROMO_TIERS[0];
    for (const t of PROMO_TIERS) {
      if (totalScore >= t.minScore) tier = t;
    }

    // ── Victory title ─────────────────────────────────────
    ctx.font = `900 ${24 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.lime;
    ctx.shadowBlur = 28;
    ctx.fillStyle = COL.lime;
    ctx.fillText('ТЫ ДОЛЕТЕЛА!', cx, cy);
    ctx.shadowBlur = 0;
    cy += 38 * SCALE;

    ctx.font = `${10 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#CCC';
    ctx.fillText('до Hair Witches ✦', cx, cy);
    cy += 36 * SCALE;

    // ── Score ─────────────────────────────────────────────
    ctx.font = `bold ${28 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.gold;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COL.gold;
    ctx.fillText(`${totalScore}`, cx, cy);
    ctx.shadowBlur = 0;
    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#888';
    ctx.fillText('очков', cx, cy + 24 * SCALE);
    cy += 48 * SCALE;

    // ── High score badge ──────────────────────────────────
    const highScore = parseInt(localStorage.getItem('hw_high') || '0');
    if (totalScore >= highScore && totalScore > 0) {
      ctx.font = `bold ${11 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.gold;
      ctx.shadowColor = COL.gold;
      ctx.shadowBlur = 8;
      ctx.fillText('🏆 НОВЫЙ РЕКОРД!', cx, cy);
      ctx.shadowBlur = 0;
      cy += 28 * SCALE;
    }
    cy += 4 * SCALE;

    // ── Tier title ────────────────────────────────────────
    ctx.font = `bold ${15 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = tier.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = tier.color;
    ctx.fillText(tier.title, cx, cy);
    ctx.shadowBlur = 0;
    cy += 22 * SCALE;

    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#AAA';
    ctx.fillText(tier.sub, cx, cy);
    cy += 34 * SCALE;

    // ── Promo box ─────────────────────────────────────────
    const boxW = Math.min(280 * SCALE, W - 40);
    const boxH = 108 * SCALE;
    const boxX = cx - boxW / 2;
    const boxY = cy - 5;

    ctx.fillStyle = 'rgba(0, 18, 8, 0.92)';
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 2;
    roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = tier.color;
    ctx.shadowBlur = 8;
    roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const promoY = boxY + boxH / 2;

    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#CCC';
    ctx.fillText('Промокод для Hair Witches:', cx, promoY - 22 * SCALE);

    ctx.font = `bold ${20 * SCALE}px 'Press Start 2P', monospace`;
    ctx.shadowColor = tier.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = tier.color;
    ctx.fillText(tier.code, cx, promoY + 5 * SCALE);
    ctx.shadowBlur = 0;

    ctx.font = `bold ${12 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.white;
    ctx.fillText(`Скидка ${tier.discount} на любую услугу Hair Witches!`, cx, promoY + 32 * SCALE);

    cy = boxY + boxH + 22 * SCALE;

    // ── Button ────────────────────────────────────────────
    const btnW = 220 * SCALE, btnH = 44 * SCALE;
    const btnX = cx - btnW / 2;
    const btnY2 = cy;
    restartBtnY = btnY2;
    const pulse = 0.95 + 0.05 * Math.sin(time * 5);

    ctx.save();
    ctx.translate(cx, btnY2 + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -(btnY2 + btnH / 2));

    ctx.fillStyle = '#001a08';
    ctx.strokeStyle = COL.lime;
    ctx.lineWidth = 2;
    roundRect(btnX, btnY2, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = COL.lime;
    ctx.shadowBlur = 10;
    ctx.font = `bold ${12 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.lime;
    ctx.fillText('ЗАБРАТЬ ПРОМОКОД', cx, btnY2 + btnH / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }

  return { draw, reset, getRestartBtnY };
})();
