/* ============================================================
   CAMERA — Screen shake & flash effects
   ============================================================ */

const Camera = (() => {
  let shakeTimer = 0;
  let shakeIntensity = 8;
  let flashTimer = 0;
  let flashColor = '#FF0000';
  
  function shake(duration = 0.5, intensity = 8) {
    shakeTimer = duration;
    shakeIntensity = intensity;
  }
  
  function flash(duration = 0.4, color = '#FF0000') {
    flashTimer = duration;
    flashColor = color;
  }
  
  function update(dt) {
    if (shakeTimer > 0) shakeTimer -= dt;
    if (flashTimer > 0) flashTimer -= dt;
  }
  
  function applyShake() {
    if (shakeTimer > 0) {
      const i = shakeTimer * shakeIntensity;
      ctx.translate(
        (Math.random() - 0.5) * i,
        (Math.random() - 0.5) * i
      );
    }
  }
  
  function drawFlash() {
    if (flashTimer > 0) {
      ctx.globalAlpha = flashTimer * 0.5;
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  
  function reset() {
    shakeTimer = 0;
    flashTimer = 0;
  }
  
  return { shake, flash, update, applyShake, drawFlash, reset };
})();
