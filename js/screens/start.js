/* ============================================================
   SCREEN: START — Title screen
   ============================================================ */

const StartScreen = (() => {
  
  function draw(time) {
    // Background
    Background.draw(LEVELS[0], time, 1);
    
    const cx = W / 2, cy = H * 0.32;
    
    // Glow behind title
    ctx.save();
    ctx.shadowColor = COL.fuchsia;
    ctx.shadowBlur = 40;
    ctx.fillStyle = COL.fuchsia;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(cx, cy, 120 * SCALE, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.font = `900 ${30 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.fuchsia;
    ctx.shadowBlur = 20;
    ctx.fillStyle = COL.white;
    ctx.fillText('HAIR WITCHES', cx, cy - 18 * SCALE);
    
    ctx.font = `700 ${20 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.purple;
    ctx.fillStyle = COL.fuchsia;
    ctx.fillText('COLOR RUSH', cx, cy + 18 * SCALE);
    ctx.shadowBlur = 0;
    
    // Subtitle
    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.purple;
    ctx.globalAlpha = 0.7;
    ctx.fillText('Лети. Собирай. Побеждай.', cx, cy + 44 * SCALE);
    ctx.globalAlpha = 1;
    
    // Play button
    const btnW = 200 * SCALE, btnH = 50 * SCALE;
    const btnX = cx - btnW / 2, btnY = cy + 100 * SCALE;
    const pulse = 0.92 + 0.08 * Math.sin(time * 4);
    
    ctx.save();
    ctx.translate(cx, btnY + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -(btnY + btnH / 2));
    
    ctx.shadowColor = COL.lime;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COL.lime;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(btnX - 3, btnY - 3, btnW + 6, btnH + 6);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#111';
    ctx.strokeStyle = COL.lime;
    ctx.lineWidth = 2;
    roundRect(btnX, btnY, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.font = `bold ${15 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.lime;
    ctx.shadowColor = COL.lime;
    ctx.shadowBlur = 8;
    ctx.fillText('▶ ИГРАТЬ', cx, btnY + btnH / 2);
    ctx.restore();
    
    // Instructions
    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#777';
    ctx.fillText('Зажми экран — лети вверх', cx, btnY + btnH + 28 * SCALE);
    ctx.fillText('Собирай зелья ❤ и кристаллы ✦', cx, btnY + btnH + 44 * SCALE);
    ctx.fillText('Избегай ножниц и плохой краски!', cx, btnY + btnH + 60 * SCALE);
    
    // High score
    const hs = parseInt(localStorage.getItem('hw_high') || '0');
    if (hs > 0) {
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.gold;
      ctx.fillText(`🏆 Рекорд: ${hs}`, cx, btnY + btnH + 84 * SCALE);
    }
    
    ctx.restore();
  }
  
  return { draw };
})();
