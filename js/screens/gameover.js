/* ============================================================
   SCREEN: GAME OVER — Score, tier, promo code
   ============================================================ */

const GameOverScreen = (() => {
  let showTimer = 0;
  let restartBtnY = -1; // Track button position for click detection
  
  function reset() {
    showTimer = 0;
    restartBtnY = -1;
  }
  
  function getRestartBtnY() {
    return restartBtnY;
  }
  
  function draw(totalScore, currentLevel, time) {
    showTimer += 0.016;
    
    // Dark overlay with fade
    const overlayAlpha = Math.min(showTimer * 2, 0.85);
    ctx.fillStyle = `rgba(5, 5, 15, ${overlayAlpha})`;
    ctx.fillRect(0, 0, W, H);
    
    if (showTimer < 0.3) return; // Brief delay before showing content
    
    const cx = W / 2;
    let cy = H * 0.1;
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Determine promo tier
    let tier = PROMO_TIERS[0];
    for (const t of PROMO_TIERS) {
      if (totalScore >= t.minScore) tier = t;
    }
    
    // GAME OVER
    ctx.font = `900 ${26 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF4444';
    ctx.fillText('GAME OVER', cx, cy);
    ctx.shadowBlur = 0;
    cy += 45 * SCALE;
    
    // Level reached
    ctx.font = `${10 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#AAA';
    ctx.fillText(`Уровень ${currentLevel.id}: ${currentLevel.name}`, cx, cy);
    cy += 28 * SCALE;
    
    // Total Score
    ctx.font = `bold ${22 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.white;
    ctx.fillText(`${totalScore}`, cx, cy);
    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#888';
    ctx.fillText('очков', cx, cy + 22 * SCALE);
    cy += 40 * SCALE;
    
    // New high score
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
    cy += 5 * SCALE;
    
    // Tier title
    ctx.font = `bold ${16 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = tier.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = tier.color;
    ctx.fillText(tier.title, cx, cy);
    ctx.shadowBlur = 0;
    cy += 22 * SCALE;
    
    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#AAA';
    ctx.fillText(tier.sub, cx, cy);
    cy += 35 * SCALE;
    
    // Promo box
    const boxW = Math.min(280 * SCALE, W - 40);
    const boxH = 105 * SCALE;
    const boxX = cx - boxW / 2;
    const boxY = cy - 5;
    
    ctx.fillStyle = 'rgba(20, 0, 40, 0.92)';
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
    
    // Promo code
    ctx.font = `bold ${20 * SCALE}px 'Press Start 2P', monospace`;
    ctx.shadowColor = tier.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = tier.color;
    ctx.fillText(tier.code, cx, promoY + 5 * SCALE);
    ctx.shadowBlur = 0;
    
    ctx.font = `bold ${12 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.white;
    ctx.fillText(`Скидка ${tier.discount} на любую услугу!`, cx, promoY + 32 * SCALE);
    
    cy = boxY + boxH + 25 * SCALE;
    
    // Restart button
    const btnW = 170 * SCALE, btnH = 44 * SCALE;
    const btnX = cx - btnW / 2;
    const btnY2 = cy;
    restartBtnY = btnY2; // Save for click detection
    const pulse = 0.95 + 0.05 * Math.sin(time * 5);
    
    ctx.save();
    ctx.translate(cx, btnY2 + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -(btnY2 + btnH / 2));
    
    ctx.fillStyle = '#111';
    ctx.strokeStyle = COL.fuchsia;
    ctx.lineWidth = 2;
    roundRect(btnX, btnY2, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.font = `bold ${13 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.fuchsia;
    ctx.fillText('↻ ЗАНОВО', cx, btnY2 + btnH / 2);
    ctx.restore();
    
    ctx.restore();
  }
  
  return { draw, reset, getRestartBtnY };
})();
