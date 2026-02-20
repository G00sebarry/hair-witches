/* ============================================================
   INPUT — Touch & Mouse handling
   ============================================================ */

const Input = (() => {
  let pressed = false;
  let justPressed = false; // True only on the frame of press
  
  function onPress(e) {
    if (e) e.preventDefault();
    Audio8Bit.init();
    Audio8Bit.resume();
    if (!pressed) justPressed = true;
    pressed = true;
  }
  
  function onRelease(e) {
    if (e) e.preventDefault();
    pressed = false;
  }
  
  // Mouse
  canvas.addEventListener('mousedown', onPress);
  canvas.addEventListener('mouseup', onRelease);
  canvas.addEventListener('mouseleave', onRelease);
  
  // Touch
  canvas.addEventListener('touchstart', onPress, { passive: false });
  canvas.addEventListener('touchend', onRelease, { passive: false });
  canvas.addEventListener('touchcancel', onRelease);
  
  // Prevent context menu on long press
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  function consumeJustPressed() {
    const val = justPressed;
    justPressed = false;
    return val;
  }
  
  return {
    get pressed() { return pressed; },
    consumeJustPressed,
  };
})();
