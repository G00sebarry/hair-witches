/* ============================================================
   SCREEN: LEVEL UP — Transition between levels
   ============================================================ */

const LevelUpScreen = (() => {
  let timer = 0;
  const DURATION = 3; // seconds to show
  let nextLevel = null;
  
  function show(level) {
    timer = DURATION;
    nextLevel = level;
  }
  
  function update(dt) {
    if (timer > 0) timer -= dt;
    return timer <= 0;
  }
  
  function draw(time) {
    if (!nextLevel) return;
    
    // Fade overlay
    const progress = 1 - (timer / DURATION);
    const fadeAlpha = progress < 0.2 ? progress * 5 : (progress > 0.8 ? (1 - progress) * 5 : 1);
    
    ctx.fillStyle = `rgba(5, 5, 15, ${0.9 * fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
    
    if (fadeAlpha < 0.3) return;
    
    const cx = W / 2, cy = H / 2;
    
    ctx.save();
    ctx.globalAlpha = fadeAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Level number
    ctx.font = `900 ${40 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.lime;
    ctx.shadowBlur = 25;
    ctx.fillStyle = COL.lime;
    ctx.fillText(`УРОВЕНЬ ${nextLevel.id}`, cx, cy - 30 * SCALE);
    ctx.shadowBlur = 0;
    
    // Level name
    ctx.font = `bold ${18 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.white;
    ctx.fillText(nextLevel.name, cx, cy + 15 * SCALE);
    
    // Subtitle
    ctx.font = `${10 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#AAA';
    ctx.fillText(nextLevel.subtitle, cx, cy + 40 * SCALE);
    
    // Warning
    if (nextLevel.id >= 2) {
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.orange;
      ctx.globalAlpha = fadeAlpha * (0.5 + 0.5 * Math.sin(time * 5));
      ctx.fillText('⚠ Сложность повышена!', cx, cy + 65 * SCALE);
    }
    
    ctx.restore();
  }
  
  return { show, update, draw };
})();
