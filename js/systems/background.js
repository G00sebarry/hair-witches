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
  // paths/parallax/drawH/baseY — как раньше (НЕ менялись).
  const LAYER_CONFIG = {
    sky:  { paths: ['sprites/backgrounds/level1-sky.png'],  parallax: 0.12, drawH: 1.80, baseY: 1.00 },
    far:  { paths: ['sprites/backgrounds/level1-far.png'],  parallax: 0.30, drawH: 0.65, baseY: 0.59 },
    mid:  { paths: ['sprites/backgrounds/level1-mid.png'],  parallax: 0.55, drawH: 1.85, baseY: 0.85 },
    near: { paths: ['sprites/backgrounds/level1-near.png'], parallax: 1.00, drawH: 1.45, baseY: 1.08 },
  };

  const bgLayers = {};
  Object.entries(LAYER_CONFIG).forEach(([name, cfg]) => {
    bgLayers[name] = cfg.paths.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  });

  // ── Castle end-of-level sprite ──────────────────────────
  // НАСТРОЙКА ЗАМКА:
  const CASTLE = {
    drawH: 0.90,        // высота замка в долях H
    baseY: 1.08,        // низ замка (как у near) — за нижней кромкой
    gateXFrac: 0.50,    // где ворота по ширине картинки (0.5 = центр)
    gateYFrac: 0.72,    // где ворота по высоте картинки
    focusXFrac: 0.42,   // куда поставить ВОРОТА на экране (доля ширины экрана)
  };

  const castleImg = new Image();
  castleImg.onerror = () => console.warn('[Castle] Failed to load level1-castle.png');
  castleImg.src = 'sprites/backgrounds/level1-castle.png';

  function isCastleLoaded() {
    return castleImg.complete && castleImg.naturalWidth > 0;
  }

  function getCastleHeight() { return H * CASTLE.drawH; }

  function getCastleWidth() {
    const dh = getCastleHeight();
    if (isCastleLoaded()) return castleImg.naturalWidth * (dh / castleImg.naturalHeight);
    return dh * (4096 / 1280);
  }

  function getCastleDrawY() {
    return CASTLE.baseY * H - getCastleHeight();
  }

  // Целевая X-позиция ЛЕВОГО края замка такая, чтобы ВОРОТА оказались
  // на focusXFrac ширины экрана. Замок шире экрана — это нормально (масштаб).
  function getCastleTargetX() {
    const cw = getCastleWidth();
    const gateOffsetInImg = cw * CASTLE.gateXFrac; // расстояние от левого края картинки до ворот
    return W * CASTLE.focusXFrac - gateOffsetInImg;
  }

  // Абсолютные координаты ворот на экране при заданном левом крае замка castleX
  function getGatePos(castleX) {
    const cw = getCastleWidth();
    const dh = getCastleHeight();
    const drawY = getCastleDrawY();
    return {
      x: castleX + cw * CASTLE.gateXFrac,
      y: drawY + dh * CASTLE.gateYFrac,
    };
  }

  function drawCastle(castleX) {
    const dh = getCastleHeight();
    const cw = Math.ceil(getCastleWidth());
    const drawY = Math.round(getCastleDrawY());

    if (!isCastleLoaded()) {
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = '#0d0620';
      ctx.fillRect(Math.round(castleX), drawY, cw, Math.ceil(dh));
      ctx.restore();
      return;
    }
    ctx.drawImage(castleImg, Math.round(castleX), drawY, cw, Math.ceil(dh));
  }

  function layerReady(name) {
    return bgLayers[name].every(img => img.complete && img.naturalWidth);
  }

  function drawLayer(name, extraY) {
    const cfg = LAYER_CONFIG[name];
    const imgs = bgLayers[name];
    if (!layerReady(name)) return;

    const dh = H * cfg.drawH;
    const segWidths = [];
    let totalW = 0;
    for (const img of imgs) {
      const sw = img.naturalWidth * (dh / img.naturalHeight);
      segWidths.push(sw);
      totalW += sw;
    }
    if (!totalW) return;

    const drawY = cfg.baseY * H - dh + (extraY || 0);
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
      const nightT = Math.min(time / 90, 1);
      const skyShift = nightT * H * 0.18;

      ctx.fillStyle = '#070512';
      ctx.fillRect(0, 0, W, H);

      if (layerReady('sky')) {
        drawLayer('sky', skyShift);
      } else {
        drawSkyGradient(level);
      }

      drawStars(time);
      drawLayer('far');
      drawLayer('mid');
      drawLayer('near');

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

  return {
    update, draw, reset,
    drawCastle, getCastleWidth, isCastleLoaded,
    getCastleTargetX, getGatePos,
  };
})();
