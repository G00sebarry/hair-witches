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

  // Castle intro state
  let castleX = 0, castleTargetX = 0, castleDrawW = 0;
  let castleIntroTime = 0, castlePhase = 'entering';
  let castleSavedSpeed = 0;
  let castleGateX = 0, castleGateY = 0;
  let savedWitchCX = 0, savedWitchCY = 0;
  let castleBurstDone = false;

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

  // ── Пауза ──
  const pauseBtn = document.getElementById('pause-toggle');

  function togglePause() {
    if (state === GAME_STATE.PLAYING) {
      state = GAME_STATE.PAUSED;
      if (pauseBtn) pauseBtn.textContent = '►';
    } else if (state === GAME_STATE.PAUSED) {
      state = GAME_STATE.PLAYING;
      if (pauseBtn) pauseBtn.textContent = 'II';
    }
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePause();
    });
  }

  function setPauseBtnVisible(v) {
    if (!pauseBtn) return;
    if (v) pauseBtn.classList.add('visible');
    else pauseBtn.classList.remove('visible');
  }

  function getCurrentLevel() {
    return LEVELS[currentLevelIndex];
  }

  function startFromSelect() {
    if (typeof LeadForm !== 'undefined') LeadForm.init();
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

    LevelUpScreen.show(LEVELS[0]);
    Audio8Bit.sfxLevelUp();
    state = GAME_STATE.LEVELUP;
  }

  function advanceLevel() {
    currentLevelIndex++;
    if (currentLevelIndex >= LEVELS.length) {
      currentLevelIndex = LEVELS.length - 1;
    }
    totalScore += levelScore;
    levelScore = 0;
    score = 0;
    levelTime = 0;
    speedMultiplier = 1;
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
      setPauseBtnVisible(false);
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
      setPauseBtnVisible(false);
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
      setPauseBtnVisible(false);
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
      setPauseBtnVisible(true);
      const level = getCurrentLevel();
      levelTime += dt;

      speedMultiplier = 1 + Math.floor(levelTime / level.speedGrowthInterval) * level.speedGrowth;
      const speed = level.baseSpeed * speedMultiplier;

      Background.update(speed);
      Background.draw(level, gameTime, speed);

      Camera.applyShake();

      const playerResult = Player.update(dt);
      if (playerResult === 'ground_hit') {
        const wasInvincible = Player.invincibleTimer > 0;
        if (Player.takeDamage()) {
          triggerGameOver();
        } else if (!wasInvincible) {
          Player.bounceUp();
        }
      }

      const playerCenter = Player.getCenter();
      Objects.update(dt, level, speedMultiplier, playerCenter, Player.lives);

      if (!Player.dead) {
        // урон от взрыва бомбы по радиусу
        if (Objects.checkExplosions(Player.getHitbox())) {
          if (Player.takeDamage()) { triggerGameOver(); }
        }
        const hits = Objects.checkCollisions(Player.getHitbox());

        for (const hit of hits) {
          if (hit.enemy) {
            if (Player.takeDamage()) {
              triggerGameOver();
              break;
            }
            Particles.spawnBurst(hit.x + hit.w / 2, hit.y + hit.h / 2, COL.red, 10);
          } else {
            const cx = hit.x + hit.w / 2;
            const cy = hit.y + hit.h / 2;

            if (hit.type === 'potion' || hit.type === 'potionMid') {
              score += hit.points;
              levelScore += hit.points;
              Particles.spawnBurst(cx, cy, hit.type === 'potionMid' ? COL.purple : COL.pink, 12);
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

      // Level 1 final sequence
      if (level.id === 1) {
        if (levelTime >= 80) Objects.setSpawnFrozen(true);

        const castleReady = Background.isCastleLoaded();

        if (levelTime >= 90 && !castleReady && state === GAME_STATE.PLAYING) {
          triggerVictory();
          ctx.restore();
          requestAnimationFrame(loop);
          return;
        }

        if (state === GAME_STATE.PLAYING && ((levelTime >= 83 && castleReady) || levelTime >= 88)) {
          castleSavedSpeed = speed;
          castleDrawW = Background.getCastleWidth();
          castleTargetX = Background.getCastleTargetX();
          castleX = W;
          castleIntroTime = 0;
          castlePhase = 'entering';
          castleBurstDone = false;
          const gate = Background.getGatePos(castleTargetX);
          castleGateX = gate.x;
          castleGateY = gate.y;
          savedWitchCX = Player.x + PLAYER_CONFIG.width / 2;
          savedWitchCY = Player.y + PLAYER_CONFIG.height / 2;
          Objects.reset();
          state = GAME_STATE.CASTLE_INTRO;
          ctx.restore();
          requestAnimationFrame(loop);
          return;
        }
      }

      // Update & draw particles
      Particles.update(dt);

      Objects.draw(gameTime);
      Particles.draw();
      Player.draw(gameTime);

      Camera.drawFlash();
      HUD.draw(totalScore + levelScore, Player.lives, level, speedMultiplier, Player.shieldTimer, gameTime, levelTime);

      drawScanLines();
      drawVignette();
    }

    // ── PAUSED ───────────────────────────────────────────
    else if (state === GAME_STATE.PAUSED) {
      const level = getCurrentLevel();
      // замороженный кадр — рисуем без обновления времени/движения
      Background.draw(level, gameTime, 0);
      Objects.draw(gameTime);
      Particles.draw();
      Player.draw(gameTime);
      HUD.draw(totalScore + levelScore, Player.lives, level, speedMultiplier, Player.shieldTimer, gameTime, levelTime);

      // затемнение
      ctx.fillStyle = 'rgba(5, 5, 15, 0.7)';
      ctx.fillRect(0, 0, W, H);

      // надпись ПАУЗА
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = COL.fuchsia;
      ctx.shadowColor = COL.fuchsia;
      ctx.shadowBlur = 20;
      ctx.font = `bold ${36 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillText('ПАУЗА', W / 2, H / 2 - 10 * SCALE);
      ctx.shadowBlur = 0;

      // кнопка ПРОДОЛЖИТЬ
      const btnW = 200 * SCALE, btnH = 46 * SCALE;
      const btnX = W / 2 - btnW / 2;
      const btnY = H / 2 + 20 * SCALE;
      ctx.fillStyle = 'rgba(10,10,20,0.9)';
      ctx.strokeStyle = COL.lime;
      ctx.lineWidth = 2;
      ctx.shadowColor = COL.lime;
      ctx.shadowBlur = 12;
      roundRect(btnX, btnY, btnW, btnH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = COL.lime;
      ctx.font = `bold ${14 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillText('ПРОДОЛЖИТЬ', W / 2, btnY + btnH / 2 + 5 * SCALE);
      ctx.restore();

      if (hasClick) {
        hasClick = false;
        if (clickX >= btnX && clickX <= btnX + btnW &&
            clickY >= btnY && clickY <= btnY + btnH) {
          togglePause();
        }
      }
      Input.consumeJustPressed();
    }

    // ── CASTLE INTRO ─────────────────────────────────────
    else if (state === GAME_STATE.CASTLE_INTRO) {
      setPauseBtnVisible(false);
      const level = getCurrentLevel();
      castleIntroTime += dt;

      const ENTRY_DUR = 5.0;
      const FLY_DUR   = 1.8;
      const DONE_AT   = ENTRY_DUR + FLY_DUR + 0.7;

      const bgSpeed = (castlePhase === 'entering') ? castleSavedSpeed : 0;
      Background.update(bgSpeed);
      Background.draw(level, gameTime, bgSpeed);

      if (castleIntroTime < ENTRY_DUR) {
        const t = Math.min(castleIntroTime / ENTRY_DUR, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        castleX = W + (castleTargetX - W) * eased;
      } else {
        castleX = castleTargetX;
        if (castlePhase === 'entering') {
          castlePhase = 'flying';
          savedWitchCX = Player.x + PLAYER_CONFIG.width / 2;
          savedWitchCY = Player.y + PLAYER_CONFIG.height / 2;
        }
      }

      Background.drawCastle(castleX);

      Particles.update(dt);
      Particles.draw();

      if (castlePhase === 'entering') {
        Player.update(dt);
        Player.draw(gameTime);
      } else {
        const flyT  = Math.min((castleIntroTime - ENTRY_DUR) / FLY_DUR, 1.0);
        const eased = flyT * flyT;
        const gate = Background.getGatePos(castleTargetX);
        const wx = lerp(savedWitchCX, gate.x, eased);
        const wy = lerp(savedWitchCY, gate.y, eased);
        const sc = 1.0 - flyT;

        if (sc > 0.02) {
          const sprite = Sprites.getWitchSprite(Player.theme, 'fly');
          const pw = PLAYER_CONFIG.width  * sc;
          const ph = PLAYER_CONFIG.height * sc;
          ctx.save();
          ctx.globalAlpha = sc;
          if (sprite) ctx.drawImage(sprite, wx - pw / 2, wy - ph / 2, pw, ph);
          ctx.restore();
        }

        if (flyT >= 1.0 && !castleBurstDone) {
          castleBurstDone = true;
          Particles.spawnBurst(gate.x, gate.y, COL.gold, 30);
          Particles.spawnBurst(gate.x, gate.y, COL.fuchsia, 20);
          Particles.spawnSparkle(gate.x, gate.y, COL.white, 15);
          Camera.flash(0.5, '#FFD700');
        }
      }

      Camera.drawFlash();
      drawScanLines();
      drawVignette();

      if (castleIntroTime >= DONE_AT) {
        triggerVictory();
      }
    }

    // ── VICTORY ──────────────────────────────────────────
    else if (state === GAME_STATE.VICTORY) {
      setPauseBtnVisible(false);
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
        const btnW = 230 * SCALE, btnH = 46 * SCALE;
        const btnX = W / 2 - btnW / 2;
        const btnY = VictoryScreen.getActionBtnY();
        if (btnY > 0 && clickX >= btnX && clickX <= btnX + btnW &&
            clickY >= btnY && clickY <= btnY + btnH) {
          Audio8Bit.sfxClick();
          if (VictoryScreen.isCodeUnlocked()) {
            state = GAME_STATE.SELECT;
          } else {
            let tier = PROMO_TIERS[0];
            for (const t of PROMO_TIERS) { if (totalScore >= t.minScore) tier = t; }
            const disc = parseInt(String(tier.discount).replace('%', '')) || 5;
            LeadForm.show(disc, totalScore, (code) => { VictoryScreen.unlockCode(code); });
          }
        }
      }
      Input.consumeJustPressed();
    }

    // ── GAME OVER ────────────────────────────────────────
    else if (state === GAME_STATE.GAMEOVER) {
      setPauseBtnVisible(false);
      gameOverDelay += dt;

      const level = getCurrentLevel();
      Background.draw(level, gameTime, 0);
      Objects.draw(gameTime);
      Particles.update(dt);
      Particles.draw();
      Player.draw(gameTime);

      GameOverScreen.draw(totalScore, level, gameTime);
      drawScanLines();

      if (gameOverDelay > 2.0 && hasClick) {
        hasClick = false;
        const btnW = 230 * SCALE, btnH = 46 * SCALE;
        const btnX = W / 2 - btnW / 2;
        const btnY = GameOverScreen.getActionBtnY();
        if (btnY > 0 && clickX >= btnX && clickX <= btnX + btnW &&
            clickY >= btnY && clickY <= btnY + btnH) {
          Audio8Bit.sfxClick();
          if (GameOverScreen.isCodeUnlocked()) {
            state = GAME_STATE.SELECT;
          } else {
            let tier = PROMO_TIERS[0];
            for (const t of PROMO_TIERS) { if (totalScore >= t.minScore) tier = t; }
            const disc = parseInt(String(tier.discount).replace('%', '')) || 5;
            LeadForm.show(disc, totalScore, (code) => { GameOverScreen.unlockCode(code); });
          }
        }
      }
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
