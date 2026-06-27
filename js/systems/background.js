/* ============================================================
   BACKGROUND — Parallax city (dense, layered, per-layer speed)
   ============================================================ */

const Background = (() => {
  let offset = 0;

  // Pre-generate stars
  const stars = Array.from({ length: 110 }, () => ({
    x: Math.random() * 2400,
    y: Math.random() * 0.55,
    size: Math.random() * 2 + 0.5,
    blink: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 2,
  }));

  // ── Level 1 PNG Layer Config ────────────────────────────
  // НАСТРОЙКА СЛОЁВ — крути эти числа, чтобы менять плотность и глубину.
  //
  // paths    : картинки-сегменты, выкладываются встык (можно добавить ещё для разнообразия)
  // parallax : множитель скорости (0 = стоит, 1 = полная скорость игры)
  // drawH    : высота отрисовки слоя в долях от высоты экрана H
  //            (1.0 = на весь экран; больше = крупнее и вылезает за верх)
  // baseY    : положение НИЗА слоя в долях H (1.0 = низ слоя на нижней кромке экрана,
  //            >1.0 = низ уходит ЗА экран вниз — так под слоем не видно пустоты)
  //
  // Принцип плотной стены: far рисуется выше (виден на горизонте),
  // mid перекрывает низ far, near перекрывает низ mid. Все три читаются как глубина,
  // но low-края всегда ниже экрана → нет дыр.
  const LAYER_CONFIG = {
    sky:  { paths: ['sprites/backgrounds/level1-sky.png'],  parallax: 0.12, drawH: 1.80, baseY: 1.00 },
    far:  { paths: ['sprites/backgrounds/level1-far.png'],  parallax: 0.30, drawH: 0.65, baseY: 0.59 },
    mid:  { paths: ['sprites/backgrounds/level1-mid.png'],  parallax: 0.55, drawH: 1.85, baseY: 0.85 },
    near: { paths: ['sprites/backgrounds/level1-near.png'], parallax: 1.00, drawH: 1.45, baseY: 1.08 },
  };

  // Pre-load all images indexed by layer name
  const bgLayers = {};
  Object.entries(LAYER_CONFIG).forEach(([name, cfg]) => {
    bgLayers[name] = cfg.paths.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  });

  // Castle end-of-level sprite (loaded separately, not in LAYER_CONFIG)
  const castleImg = new Image();
  castleImg.src = 'sprites/backgrounds/level1-castle.png';

  function getCastleWidth() {
    if (!castleImg.complete || !castleImg.naturalWidth) return 0;
    const dh = H * 0.90;
    return castleImg.naturalWidth * (dh / castleImg.naturalHeight);
  }

  function drawCastle(castleX) {
    if (!castleImg.complete || !castleImg.naturalWidth) return;
    const dh = H * 0.90;
    const cw = castleImg.naturalWidth * (dh / castleImg.naturalHeight);
    const drawY = 1.08 * H - dh;
    ctx.drawImage(castleImg, Math.round(castleX), Math.round(drawY), Math.ceil(cw), Math.ceil(dh));
  }

  function layerReady(name) {
    return bgLayers[name].every(img => img.complete && img.naturalWidth);
  }

  // ── Draw a parallax layer (segments tiled horizontally) ──
  // extraY: extra downward shift in px (night-sky drift)
  function drawLayer(name, extraY) {
    const cfg = LAYER_CONFIG[name];
    const imgs = bgLayers[name];
    if (!layerReady(name)) return;

    const dh = H * cfg.drawH;

    // scaled widths of each segment (preserve aspect at height dh)
    const segWidths = [];
    let totalW = 0;
    for (const img of imgs) {
      const sw = img.naturalWidth * (dh / img.naturalHeight);
      segWidths.push(sw);
      totalW += sw;
    }
    if (!totalW) return;

    // Vertical: bottom of layer sits at baseY * H, then we lift by dh.
    // baseY >= 1.0 pushes the layer's bottom at/below the screen edge → no gap underneath.
    const drawY = cfg.baseY * H - dh + (extraY || 0);

    // Horizontal infinite scroll
    const scrolled = ((-offset * cfg.parallax) % totalW + totalW) % totalW;
    let startX = -scrolled;

    for (let tileX = startX; tileX < W; tileX += totalW) {
      let segX = tileX;
      for (let i = 0; i < imgs.length; i++) {
        ctx.drawImage(imgs[i], Math.round(segX), Math.round(drawY), Math.ceil(segWidths[i]) + 1, Math.ceil(dh));
        segX += segWidths[i];
      }
    }
  }

  // ── Procedural fallbacks (levels 2–3 and loading state) ──

  function drawSkyGradient(level) {
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
      // stars drift slightly slower than far layer for depth
      const x = ((s.x + offset * 0.18) % (W + 100) + W + 100) % (W + 100) - 50;
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
      if (i % 3 === 0) {
        ctx.fillStyle = `hsl(${hue + 60}, 100%, 50%)`;
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3 + i);
        ctx.fillRect(x + 10, y + 10, bw - 20, 4);
        ctx.globalAlpha = 1;
      }
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
    const grd = ctx.createLinearGradient(0, H - 3, 0, H);
    grd.addColorStop(0, `hsl(${hue}, 80%, 45%)`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, H - 3, W, 3);
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
    if (level.id === 1) {
      // Night progression 0 → 1 across 90 seconds
      const nightT = Math.min(time / 90, 1);
      const skyShift = nightT * H * 0.18;

      // Deep base behind everything
      ctx.fillStyle = '#070512';
      ctx.fillRect(0, 0, W, H);

      // Sky PNG drifts down over time; gradient fallback while loading
      if (layerReady('sky')) {
        drawLayer('sky', skyShift);
      } else {
        drawSkyGradient(level);
      }

      drawStars(time);

      // City layers — back to front, dense overlapping
      drawLayer('far');
      drawLayer('mid');
      drawLayer('near');

      // Night darkening — begins at 30s, reaches full by 90s
      const overlayT = Math.min(Math.max(time - 30, 0) / 60, 1);
      if (overlayT > 0) {
        ctx.globalAlpha = overlayT * 0.35;
        ctx.fillStyle = '#000010';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    } else {
      drawSkyGradient(level);
      drawStars(time);
      drawFarBuildings(level, time);
      drawNearBuildings(level, time);
    }
    drawGround(level, time, speed);
  }

  function reset() {
    offset = 0;
  }

  return { update, draw, reset, drawCastle, getCastleWidth };
})();
