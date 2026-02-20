/* ============================================================
   SCREEN: SELECT — Choose your witch
   ============================================================ */

const SelectScreen = (() => {
  const themes = Object.keys(WITCH_THEMES);
  let selectedIndex = 0;
  let previewSprites = {};
  let initialized = false;
  let animTime = 0;
  
  function init() {
    if (initialized) return;
    themes.forEach(key => {
      previewSprites[key] = Sprites.createWitch(WITCH_THEMES[key]);
    });
    initialized = true;
  }
  
  function getSelected() {
    return WITCH_THEMES[themes[selectedIndex]];
  }
  
  function draw(time) {
    init();
    animTime = time;
    
    // Background
    Background.draw(LEVELS[0], time, 0.5);
    
    const cx = W / 2;
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Title
    ctx.font = `bold ${20 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.fuchsia;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COL.white;
    ctx.fillText('ВЫБЕРИ ВЕДЬМУ', cx, H * 0.1);
    ctx.shadowBlur = 0;
    
    // Cards
    const cardW = 100 * SCALE;
    const cardH = 150 * SCALE;
    const gap = 15 * SCALE;
    const totalW = themes.length * cardW + (themes.length - 1) * gap;
    let startX = cx - totalW / 2;
    
    themes.forEach((key, i) => {
      const theme = WITCH_THEMES[key];
      const cardX = startX + i * (cardW + gap);
      const cardY = H * 0.22;
      const isSelected = i === selectedIndex;
      
      // Card background
      ctx.save();
      if (isSelected) {
        const pulse = 1 + 0.03 * Math.sin(time * 4);
        ctx.translate(cardX + cardW / 2, cardY + cardH / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-(cardX + cardW / 2), -(cardY + cardH / 2));
      }
      
      // Card
      ctx.fillStyle = isSelected ? 'rgba(30, 10, 50, 0.95)' : 'rgba(15, 5, 25, 0.8)';
      ctx.strokeStyle = isSelected ? theme.glowColor : 'rgba(100, 50, 150, 0.3)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      roundRect(cardX, cardY, cardW, cardH, 10);
      ctx.fill();
      ctx.stroke();
      
      if (isSelected) {
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 15;
        roundRect(cardX, cardY, cardW, cardH, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      // Witch sprite
      const spriteW = 70 * SCALE;
      const spriteH = 52 * SCALE;
      ctx.drawImage(
        previewSprites[key],
        cardX + (cardW - spriteW) / 2,
        cardY + 15 * SCALE,
        spriteW,
        spriteH
      );
      
      // Name
      ctx.font = `bold ${10 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = theme.glowColor;
      ctx.fillText(theme.icon + ' ' + theme.name, cardX + cardW / 2, cardY + cardH - 40 * SCALE);
      
      // Description
      ctx.font = `${7 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#999';
      ctx.fillText(theme.desc, cardX + cardW / 2, cardY + cardH - 20 * SCALE);
      
      ctx.restore();
    });
    
    // Navigation hint
    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText('← Тапни по карточке для выбора →', cx, H * 0.22 + cardH + 25 * SCALE);
    
    // GO button
    const btnW = 180 * SCALE, btnH = 48 * SCALE;
    const btnX = cx - btnW / 2;
    const btnY = H * 0.22 + cardH + 50 * SCALE;
    const selectedTheme = getSelected();
    const pulse = 0.93 + 0.07 * Math.sin(time * 4);
    
    ctx.save();
    ctx.translate(cx, btnY + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -(btnY + btnH / 2));
    
    ctx.fillStyle = '#111';
    ctx.strokeStyle = selectedTheme.glowColor;
    ctx.lineWidth = 2;
    roundRect(btnX, btnY, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.font = `bold ${14 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = selectedTheme.glowColor;
    ctx.shadowColor = selectedTheme.glowColor;
    ctx.shadowBlur = 8;
    ctx.fillText('⚡ В БОЙ!', cx, btnY + btnH / 2);
    ctx.restore();
    
    ctx.restore();
  }
  
  // Handle clicks on select screen
  function handleClick(mouseX, mouseY) {
    const cx = W / 2;
    const cardW = 100 * SCALE;
    const cardH = 150 * SCALE;
    const gap = 15 * SCALE;
    const totalW = themes.length * cardW + (themes.length - 1) * gap;
    const startX = cx - totalW / 2;
    const cardY = H * 0.22;
    
    // Check card clicks
    for (let i = 0; i < themes.length; i++) {
      const cardX = startX + i * (cardW + gap);
      if (mouseX >= cardX && mouseX <= cardX + cardW &&
          mouseY >= cardY && mouseY <= cardY + cardH) {
        selectedIndex = i;
        Audio8Bit.sfxClick();
        return 'select';
      }
    }
    
    // Check GO button
    const btnW = 180 * SCALE, btnH = 48 * SCALE;
    const btnX = cx - btnW / 2;
    const btnY = H * 0.22 + cardH + 50 * SCALE;
    if (mouseX >= btnX && mouseX <= btnX + btnW &&
        mouseY >= btnY && mouseY <= btnY + btnH) {
      Audio8Bit.sfxClick();
      return 'go';
    }
    
    return null;
  }
  
  return { draw, handleClick, getSelected };
})();
