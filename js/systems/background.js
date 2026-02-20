/* ============================================================
   BACKGROUND — Parallax city with level theming
   ============================================================ */

const Background = (() => {
  let offset = 0;
  
  // Pre-generate stars
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * 2000,
    y: Math.random() * 0.5,
    size: Math.random() * 2 + 0.5,
    blink: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 2,
  }));
  
  function drawSky(level, time) {
    const colors = level.bgColors;
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, colors[0]);
    grd.addColorStop(0.4, colors[1]);
    grd.addColorStop(1, colors[2]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }
  
  function drawStars(time) {
    stars.forEach(s => {
      const x = ((s.x + offset * 0.2) % (W + 100) + W + 100) % (W + 100) - 50;
      const y = s.y * H * 0.6;
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(time * s.speed + s.blink));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  
  function drawFarBuildings(level, time) {
    const bw = 60, gap = 10, total = bw + gap;
    const count = Math.ceil(W / total) + 2;
    const startX = (offset * 0.3) % total;
    const hue = level.bgHue;
    
    for (let i = 0; i < count; i++) {
      const x = startX + i * total;
      const h = 80 + Math.sin(i * 1.7) * 40 + Math.cos(i * 0.8) * 20;
      const y = H - h - 40;
      
      ctx.fillStyle = `hsl(${hue}, 20%, 6%)`;
      ctx.fillRect(x, y, bw, h + 40);
      
      // Lit windows with level-based colors
      for (let wy = y + 8; wy < y + h + 30; wy += 12) {
        for (let wx = x + 6; wx < x + bw - 6; wx += 10) {
          const lit = Math.sin(wx * 0.3 + wy * 0.2 + i) > 0.2;
          if (lit) {
            const windowHue = hue + (Math.random() > 0.5 ? 30 : -30);
            ctx.fillStyle = `hsl(${windowHue}, 80%, 60%)`;
            ctx.globalAlpha = 0.4 + Math.random() * 0.3;
          } else {
            ctx.fillStyle = `hsl(${hue}, 15%, 10%)`;
            ctx.globalAlpha = 0.3;
          }
          ctx.fillRect(wx, wy, 5, 6);
        }
      }
      ctx.globalAlpha = 1;
    }
  }
  
  function drawNearBuildings(level, time) {
    const bw = 80, gap = 15, total = bw + gap;
    const count = Math.ceil(W / total) + 2;
    const startX = (offset * 0.6) % total;
    const hue = level.bgHue;
    
    for (let i = 0; i < count; i++) {
      const x = startX + i * total;
      const h = 120 + Math.sin(i * 2.3) * 50 + Math.cos(i * 1.1) * 30;
      const y = H - h;
      
      ctx.fillStyle = `hsl(${hue}, 15%, 3%)`;
      ctx.fillRect(x, y, bw, h);
      
      // Neon signs
      if (i % 3 === 0) {
        ctx.fillStyle = `hsl(${hue + 60}, 100%, 50%)`;
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3 + i);
        ctx.fillRect(x + 10, y + 10, bw - 20, 4);
        ctx.globalAlpha = 1;
      }
      
      // Windows
      for (let wy = y + 20; wy < y + h - 5; wy += 14) {
        for (let wx = x + 8; wx < x + bw - 8; wx += 12) {
          const lit = Math.sin(wx * 0.5 + wy * 0.3 + i * 2) > 0;
          ctx.fillStyle = lit ? '#FFFF44' : `hsl(${hue}, 10%, 5%)`;
          ctx.globalAlpha = lit ? 0.25 + 0.1 * Math.sin(time + wx) : 0.4;
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
      ctx.globalAlpha = 1;
    }
  }
  
  function drawGround(level, time, speed) {
    const hue = level.bgHue;
    
    // Ground glow line
    const grd = ctx.createLinearGradient(0, H - 3, 0, H);
    grd.addColorStop(0, `hsl(${hue}, 80%, 45%)`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, H - 3, W, 3);
    
    // Grid lines
    ctx.strokeStyle = `hsl(${hue}, 80%, 45%)`;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 1;
    const gridOffset = (time * speed * 60) % 40;
    for (let x = -gridOffset; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, H - 2);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  
  function update(speed) {
    offset -= speed;
  }
  
  function draw(level, time, speed) {
    drawSky(level, time);
    drawStars(time);
    drawFarBuildings(level, time);
    drawNearBuildings(level, time);
    drawGround(level, time, speed);
  }
  
  function reset() {
    offset = 0;
  }
  
  return { update, draw, reset };
})();
