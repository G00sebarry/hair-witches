/* ============================================================
   OBJECTS — Spawning & managing collectibles & enemies
   Лут: 3 тира (+10 / +25 / +75). Сердце только при ≤2 жизнях,
   хаотичная траектория. Анимация подбора (pop + всплывающие очки).
   ============================================================ */

const Objects = (() => {
  let objects = [];
  let popFx = [];        // эффекты подбора (pop + растворение)
  let floatTexts = [];   // всплывающие "+25"
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
    spawnTimer = 0;
    spawnFrozen = false;
  }

  function setSpawnFrozen(frozen) {
    spawnFrozen = frozen;
  }

  // playerLives нужен чтобы спавнить сердце только когда жизней мало
  function spawn(level, speedMultiplier, playerLives) {
    const speed = level.baseSpeed * speedMultiplier;
    const r = Math.random();
    let cumulative = 0;

    // ── ВРАГИ ──
    cumulative += level.enemyChance;
    if (r < cumulative) {
      const enemyRoll = Math.random();

      // Бомба — теперь и на уровне 1, со взрывом (логика взрыва в update)
      if (enemyRoll < 0.22) {
        objects.push({
          type: 'bomb', x: W + 20, y: rand(60, H - 80),
          w: OBJ_SIZE.bomb.w, h: OBJ_SIZE.bomb.h, img: bombImg,
          vx: -(speed * 45 + rand(10, 25)), vy: 0,
          trackSpeed: 35 + level.id * 12,
          fuse: 2.2,          // таймер до взрыва (сек), считаем когда бомба близко
          armed: false,       // активируется когда подлетает к игроку
          enemy: true,
        });
      } else if (enemyRoll < 0.55) {
        // Череп/коробка — теперь движется по горизонтали туда-сюда
        objects.push({
          type: 'boxdye', x: W + 20, y: rand(60, H - 90),
          w: OBJ_SIZE.boxdye.w, h: OBJ_SIZE.boxdye.h, img: boxDyeImg,
          vx: -(speed * 60 + rand(10, 35)), vy: 0,
          driftAmp: 40 + rand(0, 40),    // амплитуда горизонтального дрейфа
          driftFreq: 1.5 + rand(0, 1.5),
          driftPhase: rand(0, Math.PI * 2),
          baseVx: -(speed * 55 + rand(10, 30)),
          enemy: true, time: 0,
        });
      } else {
        // Ножницы — вертикальный синус (летают вверх-вниз)
        objects.push({
          type: 'scissors', x: W + 20, y: H * 0.5,
          w: OBJ_SIZE.scissors.w, h: OBJ_SIZE.scissors.h, img: scissorsImg,
          vx: -(speed * 60 + rand(10, 35)), vy: 0,
          sinAmp: 80 + rand(0, 90), sinFreq: 2 + rand(0, 2),
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
        vx: -(speed * 48 + rand(5, 15)), vy: 0,
        // хаотика: блуждание по Y + переменная скорость
        wanderAmpY: 60 + rand(0, 60), wanderFreqY: 1.8 + rand(0, 1.6),
        wanderPhaseY: rand(0, Math.PI * 2),
        wanderAmpX: 25 + rand(0, 25), wanderFreqX: 1.2 + rand(0, 1.2),
        wanderPhaseX: rand(0, Math.PI * 2),
        baseY: rand(80, H - 120), baseVx: -(speed * 48 + rand(5, 15)),
        enemy: false, points: 0, time: 0,
      });
      return;
    }

    // ── ЛУТ ТИР 1: розовый флакон-сердечко +10 (частый, по умолчанию) ──
    objects.push({
      type: 'potion', x: W + 20, y: rand(40, H - 80),
      w: OBJ_SIZE.potion.w, h: OBJ_SIZE.potion.h, img: potionImg,
      vx: -(speed * 55 + rand(5, 30)), vy: 0,
      enemy: false, points: 10, tier: 1,
    });

    // ── ЛУТ ТИР 2: фиолетовый флакон +25 (средний) — иногда вместе ──
    // подмешиваем средний тир с шансом, чтобы был поток средних очков
    if (Math.random() < 0.35) {
      objects.push({
        type: 'potionMid', x: W + 20 + rand(60, 140), y: rand(40, H - 80),
        w: OBJ_SIZE.potionMid.w, h: OBJ_SIZE.potionMid.h, img: potionMidImg,
        vx: -(speed * 56 + rand(5, 25)), vy: 0,
        enemy: false, points: 25, tier: 2,
      });
    }
  }

  function update(dt, level, speedMultiplier, playerCenter, playerLives) {
    // Spawn
    if (!spawnFrozen) {
      spawnTimer += dt;
      const interval = level.spawnInterval / speedMultiplier;
      if (spawnTimer >= interval) {
        spawnTimer -= interval;
        spawn(level, speedMultiplier, playerLives != null ? playerLives : 3);
      }
    }

    // Move objects
    objects.forEach(o => {
      o.time = (o.time || 0) + dt;

      if (o.type === 'scissors') {
        o.x += o.vx * dt;
        o.y = o.baseY + Math.sin(o.time * o.sinFreq + o.sinPhase) * o.sinAmp;
      } else if (o.type === 'boxdye') {
        // горизонтальный дрейф: скорость по X колеблется (туда-сюда на фоне движения влево)
        const drift = Math.sin(o.time * o.driftFreq + o.driftPhase) * o.driftAmp;
        o.x += (o.baseVx + drift) * dt;
      } else if (o.type === 'heart') {
        // хаотичное блуждание
        o.x += (o.baseVx + Math.sin(o.time * o.wanderFreqX + o.wanderPhaseX) * o.wanderAmpX) * dt;
        o.y = o.baseY + Math.sin(o.time * o.wanderFreqY + o.wanderPhaseY) * o.wanderAmpY;
        o.y = clamp(o.y, 30, H - o.h - 30);
      } else if (o.type === 'bomb' && playerCenter) {
        o.x += o.vx * dt;
        // следит за Y игрока
        const diff = playerCenter.y - (o.y + o.h / 2);
        o.y += Math.sign(diff) * Math.min(Math.abs(diff), o.trackSpeed * dt);
        // взвод фитиля когда бомба входит в левую половину экрана
        if (!o.armed && o.x < W * 0.6) o.armed = true;
        if (o.armed) {
          o.fuse -= dt;
          if (o.fuse <= 0 && !o.exploded) {
            o.exploded = true;
            o.explodeR = 0;
            // взрыв: урон в радиусе проверяется в checkExplosions
          }
        }
      } else {
        o.x += o.vx * dt;
      }
    });

    // Update pickup pop fx
    popFx.forEach(p => { p.t += dt; });
    popFx = popFx.filter(p => p.t < p.dur);

    // Update floating score texts
    floatTexts.forEach(f => { f.t += dt; f.y -= 30 * dt; });
    floatTexts = floatTexts.filter(f => f.t < f.dur);

    // Remove off-screen (взорвавшиеся бомбы убираем после анимации взрыва)
    objects = objects.filter(o => {
      if (o.exploded) {
        o.explodeR += dt * 220;
        return o.explodeR < o.explodeMax;
      }
      return o.x + o.w > -60;
    });
  }

  // Проверка попадания во взрыв бомбы. Возвращает true если игрок задет.
  function checkExplosions(playerHitbox) {
    const pcx = playerHitbox.x + playerHitbox.w / 2;
    const pcy = playerHitbox.y + playerHitbox.h / 2;
    for (const o of objects) {
      if (o.exploded && !o.dealtDamage) {
        const bx = o.x + o.w / 2, by = o.y + o.h / 2;
        const R = o.explodeMax;
        const dist = Math.hypot(pcx - bx, pcy - by);
        if (dist < R) {
          o.dealtDamage = true;
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
      if (o.exploded) continue; // взорвавшаяся бомба не «подбирается»
      const oh = { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 };
      if (aabbCollide(playerHitbox, oh)) {
        // бомба при касании — сразу взрыв
        if (o.type === 'bomb') {
          o.exploded = true; o.explodeR = 0;
          results.push({ ...o, index: i });
          objects.splice(i, 1);
          continue;
        }
        results.push({ ...o, index: i });
        // спавним анимацию подбора для лута (не врагов)
        if (!o.enemy) {
          spawnPickupFx(o);
        }
        objects.splice(i, 1);
      }
    }
    return results;
  }

  // pop-анимация + всплывающие очки при подборе
  function spawnPickupFx(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    popFx.push({ x: cx, y: cy, w: o.w, h: o.h, img: o.img, t: 0, dur: 0.32 });
    if (o.points && o.points > 0) {
      const col = o.tier === 3 ? '#7DF9FF' : o.tier === 2 ? '#C98BFF' : '#FF8FD0';
      floatTexts.push({ x: cx, y: cy - 6, text: `+${o.points}`, color: col, t: 0, dur: 0.7 });
    }
  }

  function draw(time) {
    // объекты
    objects.forEach(o => {
      ctx.save();

      if (o.exploded) {
        // визуал взрыва — расширяющееся кольцо
        const a = 1 - (o.explodeR / o.explodeMax);
        ctx.globalAlpha = Math.max(a, 0);
        ctx.strokeStyle = '#FF6600';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.explodeR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#FFD700';
        ctx.globalAlpha = Math.max(a * 0.6, 0);
        ctx.beginPath();
        ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.explodeR * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }

      // свечение по типу
      if (o.type === 'crystal') {
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

    // pop-эффекты подбора (увеличение + растворение вверх)
    popFx.forEach(p => {
      const k = p.t / p.dur;           // 0→1
      const scale = 1 + k * 0.8;       // растёт
      const alpha = 1 - k;             // тает
      const yLift = k * 14;            // плывёт вверх
      ctx.save();
      ctx.globalAlpha = Math.max(alpha, 0);
      const dw = p.w * scale, dh = p.h * scale;
      ctx.drawImage(p.img, p.x - dw / 2, p.y - yLift - dh / 2, dw, dh);
      ctx.restore();
    });

    // всплывающие очки "+25"
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
