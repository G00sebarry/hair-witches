/* ============================================================
   HELPERS — Utility functions
   ============================================================ */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let W, H, SCALE;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  SCALE = Math.min(W / 400, H / 700, 1.8);
}
resize();
window.addEventListener('resize', resize);

// Rounded rectangle path
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// AABB collision
function aabbCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// Random between min and max
function rand(min, max) {
  return min + Math.random() * (max - min);
}

// Random from array
function randFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Lerp
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Clamp
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Draw text with glow
function glowText(text, x, y, font, color, blur = 10) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Scan lines overlay
function drawScanLines() {
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
}

// Vignette overlay
function drawVignette() {
  const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
  grd.addColorStop(0, 'transparent');
  grd.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}
