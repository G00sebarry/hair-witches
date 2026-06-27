/* ============================================================
   OBJECTS — Spawning & managing collectibles & enemies
   Враги дополированы: бомба с телеграфом + сочный взрыв (вариант А),
   живые черепа, баланс под казуальных (мешать очкам, не убивать).
   Лут: 3 тира (+10 / +25 / +75). Сердце только при ≤2 жизнях.
   ============================================================ */

const Objects = (() => {
  let objects = [];
  let popFx = [];        // эффекты подбора лута
  let floatTexts = [];   // всплывающие "+25"
  let blastFx = [];      // визуал взрывов бомб (вспышка + волна)
  let spawnTimer = 0;
  let spawnFrozen = false;

  let potionImg, potionMidImg, crystalImg, shieldImg, heartImg, boxDyeImg, scissorsImg, bombImg;

  function init() {
    potionImg    = Sprites.createPotion();
    potionMidImg = Sprites.createPotionMid();
    crystalImg   = Sprites.createCrystal();
    shieldImg    = Sprites.createShield();
    heartImg     = Sprites.createHeart();
    boxDyeImg    = Sprites.createBoxDye();
    scissorsImg  = Sprites.createScissors();
    bombImg      = Sprites.createBomb();
  }

  function reset() {
    objects = [];
    popFx = [];
    floatTexts = [];
    blastFx = [];
    spawnTimer = 0;
    spawnFrozen = false;
  }

  function setSpawnFrozen(frozen) {
    spawnFrozen = frozen;
  }

  function spawn(level, speedMultiplier, playerLives) {
    const speed = level.baseSpeed * speedMultiplier;
    const r = Math.random();
    let cumulative = 0;

    // ── ВРАГИ ──
    cumulative += level.enemyChance;
    if (r < cumulative) {
      const enemyRoll = Math.random();

      // Бомба (вариант А): медленнее, длинный фитиль, телеграф, зона взрыва
      if (enemyRoll < 0.25) {
        objects.push({
          type: 'bomb', x: W + 20, y: rand(70, H - 90),
          w: OBJ_SIZE.bomb.w, h: OBJ_SIZE.bomb.h, img: bombImg,
          vx: -(speed * 38 + rand(8, 18)),   // медленнее обычных врагов
          vy: 0,
          trackSpeed: 26 + level.id * 8,      // мягче следит за игроком
          fuse: 3.2,                          // длинный фитиль — успеешь и на десктопе
          armed: false,
          blinkLead: 1.2,                     // за сколько до взрыва начинает мигать
          blastR: 95,                         // радиус опасной зоны взрыва
          enemy: true, time: 0,
        });
      } else if (enemyRoll < 0.62) {
        // Череп/коробка — живее: быстрее + шире болтанка влево-вправо
        objects.push({
          type: 'boxdye', x: W + 20, y: rand(60, H - 90),
          w: OBJ_SIZE.boxdye.w, h: OBJ_SIZE.boxdye.h, img: boxDyeImg,
          baseVx: -(speed * 70 + rand(15, 40)),  // быстрее (было ~55)
          driftAmp: 90 + rand(0, 70),            // шире амплитуда (было 40)
          driftFreq: 2.2 + rand(0, 1.8),         // живее (было 1.5)
          driftPhase: rand(0, Math.PI * 2),
          enemy: true, time: 0,
        });
      } else {
        // Ножницы — вертикальный синус
        objects.push({
          type: 'scissors', x: W + 20, y: H * 0.5,
          w: OBJ_SIZE.scissors.w, h: OBJ_SIZE.scissors.h, img: scissorsImg,
          vx: -(speed * 62 + rand(10, 35)), vy: 0,
          sinAmp: 85 + rand(0, 90), sinFreq: 2 + rand(0, 2),
          sinPhase: rand(0, Math.PI * 2), baseY: rand(90, H - 110),
          enemy: true, time: 0,
        });
      }
      return;
    }

    // ── ЛУТ ТИР 3: кристалл +75 (редкий джекпот) ──
    cumulative += level.crystalChance;
    if (r < cumulative) {
      objects.push({
        type: 'crystal', x: W + 20, y: rand(40, H - 80),
        w: OBJ_SIZE.crystal.w, h: OBJ_SIZE.crystal.h, img: crystalImg,
        vx: -(speed * 58 + rand(5, 20)), vy: 0,
        enemy: false, points: 75, tier: 3,
      });
      return;
    }

    // ── Щит ──
    cumulative += level.shieldChance;
    if (r < cumulative) {
      objects.push({
        type: 'shield', x: W + 20, y: rand(40, H - 70),
        w: OBJ_SIZE.shield.w, h: OBJ_SIZE.shield.h, img: shieldImg,
        vx: -(speed * 50 + rand(5, 15)), vy: 0,
        enemy: false, points: 5,
      });
      return;
    }

    // ── Сердце — ТОЛЬКО при ≤2 жизнях, хаотичная траектория ──
    cumulative += level.heartChance;
    if (r < cumulative && playerLives <= 2) {
      objects.push({
        type: 'heart', x: W + 20, y: rand(80, H - 120),
        w: OBJ_SIZE.heart.w, h: OBJ_SIZE.heart.h, img: heartImg,
        baseVx: -(speed * 46 + rand(5, 15)),
        wanderAmpY: 70 + rand(0, 60), wanderFreqY: 1.8 + rand(0, 1.6),
        wanderPhaseY: rand(0, Math.PI * 2),
        wanderAmpX: 30 + rand(0, 25), wanderFreqX: 1.2 + rand(0, 1.2),
        wanderPhaseX: rand(0, Math.PI * 2),
        baseY: rand(80, H - 120),
        enemy: false, points: 0, time: 0,
      });
      return;
    }

    // ── ЛУТ ТИР 1: розовый флакон +10 (частый) ──
    objects.push({
      type: 'potion', x: W + 20, y: rand(40, H - 80),
      w: OBJ_SIZE.potion.w, h: OBJ_SIZE.potion.h, img: potionImg,
      vx: -(speed * 55 + rand(5, 30)), vy: 0,
      enemy: false, points: 10, tier: 1,
    });

    // ── ЛУТ ТИР 2: фиолетовый флакон +25 (подмешиваем) ──
    if (Math.random() < 0.35) {
      objects.push({
        type: 'potionMid', x: W + 20 + rand(60, 140), y: rand(40, H - 80),
        w: OBJ_SIZE.potionMid.w, h: OBJ_SIZE.potionMid.h, img: potionMidImg,
        vx: -(speed * 56 + rand(5, 25)), vy: 0,
        enemy: false, points: 25, tier: 2,
      });
    }
  }

  // спавн сочного взрыва (вспышка + волна + искры)
  function detonate(o) {
    const bx = o.x + o.w / 2, by = o.y + o.h / 2;
    o.exploded = true;
    o.dealtDamage = false;
    blastFx.push({ x: bx, y: by, r: 0, maxR: o.blastR, t: 0, dur: 0.45 });
    // частицы-искры
    Particles.spawnBurst(bx, by, '#FF6600', 24);
    Particles.spawnBurst(bx, by, '#FFD700', 18);
    Particles.spawnSparkle(bx, by, '#FFFFFF', 12);
    Camera.shake(0.5, 14);
    Camera.flash(0.35, '#FF7700');
    Audio8Bit.sfxHit && Audio8Bit.sfxHit();
  }

  function update(dt, level, speedMultiplier, playerCenter, playerLives) {
    if (!spawnFrozen) {
      spawnTimer += dt;
      const interval = level.spawnInterval / speedMultiplier;
      if (spawnTimer >= interval) {
        spawnTimer -= interval;
        spawn(level, speedMultiplier, playerLives != null ? playerLives : 3);
      }
    }

    objects.forEach(o => {
      o.time = (o.time || 0) + dt;

      if (o.type === 'scissors') {
        o.x += o.vx * dt;
        o.y = o.baseY + Math.sin(o.time * o.sinFreq + o.sinPhase) * o.sinAmp;

      } else if (o.type === 'boxdye') {
        const drift = Math.sin(o.time * o.driftFreq + o.driftPhase) * o.driftAmp;
        o.x += (o.baseVx + drift) * dt;

      } else if (o.type === 'heart') {
        o.x += (o.baseVx + Math.sin(o.time * o.wanderFreqX + o.wanderPhaseX) * o.wanderAmpX) * dt;
        o.y = o.baseY + Math.sin(o.time * o.wanderFreqY + o.wanderPhaseY) * o.wanderAmpY;
        o.y = clamp(o.y, 30, H - o.h - 30);

      } else if (o.type === 'bomb') {
        if (!o.exploded) {
          o.x += o.vx * dt;
          // мягко следит за Y игрока
          if (playerCenter) {
            const diff = playerCenter.y - (o.y + o.h / 2);
            o.y += Math.sign(diff) * Math.min(Math.abs(diff), o.trackSpeed * dt);
          }
          // взвод когда входит в левые ~70% экрана
          if (!o.armed && o.x < W * 0.7) o.armed = true;
          if (o.armed) {
            o.fuse -= dt;
            if (o.fuse <= 0) detonate(o);
          }
        }

      } else {
        o.x += o.vx * dt;
      }
    });

    // обновляем pop / floatText / blast
    popFx.forEach(p => { p.t += dt; });
    popFx = popFx.filter(p => p.t < p.dur);

    floatTexts.forEach(f => { f.t += dt; f.y -= 30 * dt; });
    floatTexts = floatTexts.filter(f => f.t < f.dur);

    blastFx.forEach(b => {
      b.t += dt;
      b.r = b.maxR * Math.min(b.t / 0.25, 1); // быстрое расширение волны
    });
    blastFx = blastFx.filter(b => b.t < b.dur);

    // удаляем улетевшее / отгремевшее
    objects = objects.filter(o => {
      if (o.exploded) return false; // взорванная бомба исчезает (визуал в blastFx)
      return o.x + o.w > -60;
    });
  }

  // урон по радиусу взрыва. true если игрок задет.
  function checkExplosions(playerHitbox) {
    const pcx = playerHitbox.x + playerHitbox.w / 2;
    const pcy = playerHitbox.y + playerHitbox.h / 2;
    for (const b of blastFx) {
      if (b.dealtDamage) continue;
      // урон в момент пика волны (первые ~0.25с)
      if (b.t <= 0.28) {
        const dist = Math.hypot(pcx - b.x, pcy - b.y);
        if (dist < b.maxR * 0.85) {
          b.dealtDamage = true;
          return true;
        }
      }
    }
    return false;
  }

  function checkCollisions(playerHitbox) {
    const results = [];
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      if (o.exploded) continue;
      const oh = { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 };
      if (aabbCollide(playerHitbox, oh)) {
        // прямое касание бомбы — мгновенный взрыв
        if (o.type === 'bomb') {
          detonate(o);
          results.push({ type: 'bomb', enemy: true, x: o.x, y: o.y, w: o.w, h: o.h });
          continue;
        }
        results.push({ ...o, index: i });
        if (!o.enemy) spawnPickupFx(o);
        objects.splice(i, 1);
      }
    }
    return results;
  }

  function spawnPickupFx(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    popFx.push({ x: cx, y: cy, w: o.w, h: o.h, img: o.img, t: 0, dur: 0.32 });
    if (o.points && o.points > 0) {
      const col = o.tier === 3 ? '#7DF9FF' : o.tier === 2 ? '#C98BFF' : '#FF8FD0';
      floatTexts.push({ x: cx, y: cy - 6, text: `+${o.points}`, color: col, t: 0, dur: 0.7 });
    }
  }

  function draw(time) {
    objects.forEach(o => {
      ctx.save();

      // бомба: телеграф — мигает красным перед взрывом
      if (o.type === 'bomb' && o.armed && !o.exploded) {
        const danger = o.fuse <= o.blinkLead;
        if (danger) {
          const blink = 0.5 + 0.5 * Math.sin(time * 22);
          // пульсирующая красная аура-предупреждение
          ctx.globalAlpha = 0.20 * blink;
          ctx.fillStyle = '#FF3030';
          ctx.beginPath();
          ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.blastR * 0.85, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 10 + 10 * blink;
        } else {
          ctx.shadowColor = '#FF4444';
          ctx.shadowBlur = 8;
        }
      } else if (o.type === 'crystal') {
        ctx.shadowColor = COL.cyan; ctx.shadowBlur = 14 + 5 * Math.sin(time * 4);
      } else if (o.type === 'potionMid') {
        ctx.shadowColor = '#B266FF'; ctx.shadowBlur = 10 + 4 * Math.sin(time * 3);
      } else if (o.type === 'potion') {
        ctx.shadowColor = '#FF8FD0'; ctx.shadowBlur = 8 + 3 * Math.sin(time * 3);
      } else if (o.type === 'shield') {
        ctx.shadowColor = COL.cyan; ctx.shadowBlur = 8 + 3 * Math.sin(time * 3);
      } else if (o.type === 'heart') {
        ctx.shadowColor = '#FF4466'; ctx.shadowBlur = 10 + 4 * Math.sin(time * 4);
        const pulse = 1 + 0.08 * Math.sin(time * 6);
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-(o.x + o.w / 2), -(o.y + o.h / 2));
      } else if (o.enemy) {
        ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 8;
        if (o.type === 'scissors') {
          ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
          ctx.rotate(Math.sin((o.time || 0) * 3) * 0.15);
          ctx.translate(-(o.x + o.w / 2), -(o.y + o.h / 2));
        }
      }

      ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
      ctx.restore();
    });

    // ── ВЗРЫВЫ (вау-фактор): вспышка ядра + двойная ударная волна ──
    blastFx.forEach(b => {
      const k = b.t / b.dur; // 0→1
      ctx.save();

      // ядро-вспышка (быстро гаснет)
      if (k < 0.4) {
        const coreA = 1 - k / 0.4;
        ctx.globalAlpha = coreA;
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.maxR * 0.6);
        grd.addColorStop(0, '#FFFFFF');
        grd.addColorStop(0.4, '#FFD700');
        grd.addColorStop(1, 'rgba(255,102,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.maxR * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // внешняя ударная волна (кольцо расширяется и тает)
      const ringA = Math.max(1 - k, 0);
      ctx.globalAlpha = ringA * 0.9;
      ctx.strokeStyle = '#FF7700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();

      // внутреннее кольцо
      ctx.globalAlpha = ringA * 0.6;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });

    // pop-эффекты подбора
    popFx.forEach(p => {
      const k = p.t / p.dur;
      const scale = 1 + k * 0.8;
      const alpha = 1 - k;
      const yLift = k * 14;
      ctx.save();
      ctx.globalAlpha = Math.max(alpha, 0);
      const dw = p.w * scale, dh = p.h * scale;
      ctx.drawImage(p.img, p.x - dw / 2, p.y - yLift - dh / 2, dw, dh);
      ctx.restore();
    });

    // всплывающие очки
    floatTexts.forEach(f => {
      const k = f.t / f.dur;
      ctx.save();
      ctx.globalAlpha = Math.max(1 - k, 0);
      ctx.font = `bold ${13 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    });
  }

  return {
    init, reset, update,
    checkCollisions, checkExplosions,
    draw, setSpawnFrozen,
  };
})();
