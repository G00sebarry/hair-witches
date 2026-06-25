/* ============================================================
   GAME — Main loop & state management
   ============================================================ */

const Game = (() => {
  let state = GAME_STATE.START;
  let score = 0;
  let totalScore = 0;    // Across all levels
  let levelScore = 0;    // Current level score
  let currentLevelIndex = 0;
  let gameTime = 0;
  let levelTime = 0;
  let speedMultiplier = 1;
  let lastTime = 0;
  let gameOverDelay = 0;
  
  // Click handling for select screen
  let clickX = -1, clickY = -1;
  let hasClick = false;
  
  canvas.addEventListener('mousedown', (e) => {
    clickX = e.clientX;
    clickY = e.clientY;
    hasClick = true;
  });
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      clickX = e.touches[0].clientX;
      clickY = e.touches[0].clientY;
      hasClick = true;
    }
  }, { passive: true });
  
  function getCurrentLevel() {
    return LEVELS[currentLevelIndex];
  }
  
  function startFromSelect() {
    const theme = SelectScreen.getSelected();
    Player.setTheme(theme);
    
    currentLevelIndex = 0;
    totalScore = 0;
    levelScore = 0;
    score = 0;
    gameTime = 0;
    levelTime = 0;
    speedMultiplier = 1;
    gameOverDelay = 0;
    
    Player.reset();
    Objects.init();
    Objects.reset();
    Particles.clear();
    Background.reset();
    Camera.reset();
    HUD.reset();
    GameOverScreen.reset();
    
    // Start level transition
    LevelUpScreen.show(LEVELS[0]);
    Audio8Bit.sfxLevelUp();
    state = GAME_STATE.LEVELUP;
  }
  
  function advanceLevel() {
    currentLevelIndex++;
    if (currentLevelIndex >= LEVELS.length) {
      // All levels completed! (shouldn't happen with infinite level 3)
      currentLevelIndex = LEVELS.length - 1;
    }
    
    // Keep total score, reset level score
    totalScore += levelScore;
    levelScore = 0;
    score = 0;
    levelTime = 0;
    speedMultiplier = 1;
    
    // Reset objects but keep player state
    Objects.reset();
    Particles.clear();
    
    LevelUpScreen.show(LEVELS[currentLevelIndex]);
    Audio8Bit.sfxLevelUp();
    state = GAME_STATE.LEVELUP;
  }
  
  function triggerVictory() {
    state = GAME_STATE.VICTORY;
    totalScore += levelScore;

    const highScore = parseInt(localStorage.getItem('hw_high') || '0');
    if (totalScore > highScore) {
      localStorage.setItem('hw_high', String(totalScore));
    }

    Audio8Bit.stopMusic();
    VictoryScreen.reset();
  }

  function triggerGameOver() {
    state = GAME_STATE.GAMEOVER;
    totalScore += levelScore;
    
    const highScore = parseInt(localStorage.getItem('hw_high') || '0');
    if (totalScore > highScore) {
      localStorage.setItem('hw_high', String(totalScore));
    }
    
    Audio8Bit.stopMusic();
    GameOverScreen.reset();
    gameOverDelay = 0;
  }
  
  // ── Main Loop ──────────────────────────────────────────
  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    gameTime += dt;
    
    Camera.update(dt);
    
    ctx.save();
    
    // ── START SCREEN ─────────────────────────────────────
    if (state === GAME_STATE.START) {
      Background.update(1);
      StartScreen.draw(gameTime);
      drawScanLines();
      
      if (Input.consumeJustPressed()) {
        Audio8Bit.init();
        Audio8Bit.sfxClick();
        state = GAME_STATE.SELECT;
      }
    }
    
    // ── SELECT SCREEN ────────────────────────────────────
    else if (state === GAME_STATE.SELECT) {
      Background.update(0.5);
      SelectScreen.draw(gameTime);
      drawScanLines();
      
      if (hasClick) {
        hasClick = false;
        const result = SelectScreen.handleClick(clickX, clickY);
        if (result === 'go') {
          startFromSelect();
        }
      }
    }
    
    // ── LEVEL UP TRANSITION ──────────────────────────────
    else if (state === GAME_STATE.LEVELUP) {
      const level = getCurrentLevel();
      Background.update(level.baseSpeed * 0.3);
      Background.draw(level, gameTime, level.baseSpeed * 0.3);
      drawScanLines();
      
      LevelUpScreen.draw(gameTime);
      
      if (LevelUpScreen.update(dt)) {
        state = GAME_STATE.PLAYING;
        Audio8Bit.playMusic(level.music);
      }
    }
    
    // ── PLAYING ──────────────────────────────────────────
    else if (state === GAME_STATE.PLAYING) {
      const level = getCurrentLevel();
      levelTime += dt;
      
      // Speed growth
      speedMultiplier = 1 + Math.floor(levelTime / level.speedGrowthInterval) * level.speedGrowth;
      const speed = level.baseSpeed * speedMultiplier;
      
      // Background
      Background.update(speed);
      Background.draw(level, gameTime, speed);
      
      Camera.applyShake();
      
      // Update player
      const playerResult = Player.update(dt);
      if (playerResult === 'ground_death') {
        if (Player.takeDamage()) {
          triggerGameOver();
        }
      }
      
      // Update objects
      const playerCenter = Player.getCenter();
      Objects.update(dt, level, speedMultiplier, playerCenter);
      
      // Collision detection
      if (!Player.dead) {
        const hits = Objects.checkCollisions(Player.getHitbox());
        
        for (const hit of hits) {
          if (hit.enemy) {
            // Enemy collision
            if (Player.takeDamage()) {
              triggerGameOver();
              break;
            }
            Particles.spawnBurst(hit.x + hit.w / 2, hit.y + hit.h / 2, COL.red, 10);
          } else {
            // Collectible
            const cx = hit.x + hit.w / 2;
            const cy = hit.y + hit.h / 2;
            
            if (hit.type === 'potion') {
              score += hit.points;
              levelScore += hit.points;
              Particles.spawnBurst(cx, cy, COL.pink, 12);
              Audio8Bit.sfxCollect();
            } else if (hit.type === 'crystal') {
              score += hit.points;
              levelScore += hit.points;
              Particles.spawnBurst(cx, cy, COL.cyan, 20);
              Particles.spawnSparkle(cx, cy, COL.gold, 8);
              Audio8Bit.sfxCrystal();
            } else if (hit.type === 'shield') {
              score += hit.points;
              levelScore += hit.points;
              Player.addShield();
            } else if (hit.type === 'heart') {
              if (!Player.addLife()) {
                // Max lives — give points instead
                score += 25;
                levelScore += 25;
                Audio8Bit.sfxCollect();
              }
              Particles.spawnBurst(cx, cy, '#FF4466', 10);
            }
          }
        }
      }
      
      // Check level completion (score-based, levels 2–3)
      if (score >= level.targetScore && level.targetScore !== Infinity) {
        advanceLevel();
        ctx.restore();
        requestAnimationFrame(loop);
        return;
      }

      // Victory check: level 1 completed by surviving 90 seconds
      if (level.id === 1 && levelTime >= 90 && state === GAME_STATE.PLAYING) {
        triggerVictory();
        ctx.restore();
        requestAnimationFrame(loop);
        return;
      }
      
      // Update & draw particles
      Particles.update(dt);
      
      // Draw order: objects, particles, player, hud
      Objects.draw(gameTime);
      Particles.draw();
      Player.draw(gameTime);
      
      Camera.drawFlash();
      HUD.draw(totalScore + levelScore, Player.lives, level, speedMultiplier, Player.shieldTimer, gameTime, levelTime);
      
      drawScanLines();
      drawVignette();
    }
    
    // ── VICTORY ──────────────────────────────────────────
    else if (state === GAME_STATE.VICTORY) {
      const level = getCurrentLevel();
      Background.draw(level, gameTime, 0);
      Objects.draw(gameTime);
      Particles.update(dt);
      Particles.draw();
      Player.draw(gameTime);

      VictoryScreen.draw(totalScore, gameTime);
      drawScanLines();

      if (hasClick) {
        hasClick = false;
        const btnW = 220 * SCALE, btnH = 44 * SCALE;
        const btnX = W / 2 - btnW / 2;
        const btnY = VictoryScreen.getRestartBtnY();
        if (btnY > 0 && clickX >= btnX && clickX <= btnX + btnW &&
            clickY >= btnY && clickY <= btnY + btnH) {
          Audio8Bit.sfxClick();
          state = GAME_STATE.SELECT;
        }
      }
      Input.consumeJustPressed();
    }

    // ── GAME OVER ────────────────────────────────────────
    else if (state === GAME_STATE.GAMEOVER) {
      gameOverDelay += dt;
      
      const level = getCurrentLevel();
      Background.draw(level, gameTime, 0);
      Objects.draw(gameTime);
      Particles.update(dt);
      Particles.draw();
      Player.draw(gameTime);
      
      GameOverScreen.draw(totalScore, level, gameTime);
      drawScanLines();
      
      // Only restart via button click (not any tap)
      // Require at least 2 seconds before allowing restart
      if (gameOverDelay > 2.0 && hasClick) {
        hasClick = false;
        // Check if click is on the restart button area
        const btnW = 170 * SCALE, btnH = 44 * SCALE;
        const btnX = W / 2 - btnW / 2;
        // Approximate button Y position (matches gameover.js layout)
        const btnY = GameOverScreen.getRestartBtnY();
        if (btnY > 0 && clickX >= btnX && clickX <= btnX + btnW &&
            clickY >= btnY && clickY <= btnY + btnH) {
          Audio8Bit.sfxClick();
          state = GAME_STATE.SELECT;
        }
      }
      // Also consume any justPressed to prevent accidental carry-over
      Input.consumeJustPressed();
    }
    
    ctx.restore();
    requestAnimationFrame(loop);
  }
  
  // Boot
  requestAnimationFrame(loop);
  
  return {
    getState: () => state,
    getScore: () => totalScore + levelScore,
  };
})();
