/* ============================================================
   OBJECTS — Spawning and managing collectibles & enemies
   ============================================================ */

const Objects = (() => {
  let objects = [];
  let spawnTimer = 0;
  
  // Pre-create sprite references
  let potionImg, crystalImg, shieldImg, heartImg, boxDyeImg, scissorsImg, bombImg;
  
  function init() {
    potionImg = Sprites.createPotion();
    crystalImg = Sprites.createCrystal();
    shieldImg = Sprites.createShield();
    heartImg = Sprites.createHeart();
    boxDyeImg = Sprites.createBoxDye();
    scissorsImg = Sprites.createScissors();
    bombImg = Sprites.createBomb();
  }
  
  function reset() {
    objects = [];
    spawnTimer = 0;
  }
  
  function spawn(level, speedMultiplier) {
    const speed = level.baseSpeed * speedMultiplier;
    const r = Math.random();
    
    let cumulative = 0;
    
    // Enemies
    cumulative += level.enemyChance;
    if (r < cumulative) {
      // Decide enemy type
      const enemyRoll = Math.random();
      
      if (level.id >= 2 && enemyRoll < 0.25) {
        // Bomb (from level 2) — slow tracks toward player Y
        objects.push({
          type: 'bomb',
          x: W + 20,
          y: rand(60, H - 80),
          w: OBJ_SIZE.bomb.w,
          h: OBJ_SIZE.bomb.h,
          img: bombImg,
          vx: -(speed * 45 + rand(10, 25)),
          vy: 0,
          trackSpeed: 40 + level.id * 15,
          enemy: true,
        });
      } else if (enemyRoll < 0.55) {
        // Box Dye — straight
        objects.push({
          type: 'boxdye',
          x: W + 20,
          y: rand(30, H - 70),
          w: OBJ_SIZE.boxdye.w,
          h: OBJ_SIZE.boxdye.h,
          img: boxDyeImg,
          vx: -(speed * 65 + rand(10, 40)),
          vy: 0,
          enemy: true,
        });
      } else {
        // Scissors — sine wave
        objects.push({
          type: 'scissors',
          x: W + 20,
          y: H * 0.5,
          w: OBJ_SIZE.scissors.w,
          h: OBJ_SIZE.scissors.h,
          img: scissorsImg,
          vx: -(speed * 60 + rand(10, 35)),
          vy: 0,
          sinAmp: 60 + rand(0, 80),
          sinFreq: 2 + rand(0, 2),
          sinPhase: rand(0, Math.PI * 2),
          baseY: rand(80, H - 100),
          enemy: true,
          time: 0,
        });
      }
      return;
    }
    
    // Crystal
    cumulative += level.crystalChance;
    if (r < cumulative) {
      objects.push({
        type: 'crystal',
        x: W + 20,
        y: rand(30, H - 70),
        w: OBJ_SIZE.crystal.w,
        h: OBJ_SIZE.crystal.h,
        img: crystalImg,
        vx: -(speed * 55 + rand(5, 20)),
        vy: 0,
        enemy: false,
        points: 50,
      });
      return;
    }
    
    // Shield
    cumulative += level.shieldChance;
    if (r < cumulative) {
      objects.push({
        type: 'shield',
        x: W + 20,
        y: rand(30, H - 60),
        w: OBJ_SIZE.shield.w,
        h: OBJ_SIZE.shield.h,
        img: shieldImg,
        vx: -(speed * 50 + rand(5, 15)),
        vy: 0,
        enemy: false,
        points: 5,
      });
      return;
    }
    
    // Heart
    cumulative += level.heartChance;
    if (r < cumulative) {
      objects.push({
        type: 'heart',
        x: W + 20,
        y: rand(30, H - 60),
        w: OBJ_SIZE.heart.w,
        h: OBJ_SIZE.heart.h,
        img: heartImg,
        vx: -(speed * 50 + rand(5, 15)),
        vy: 0,
        enemy: false,
        points: 5,
      });
      return;
    }
    
    // Default: Potion
    objects.push({
      type: 'potion',
      x: W + 20,
      y: rand(30, H - 70),
      w: OBJ_SIZE.potion.w,
      h: OBJ_SIZE.potion.h,
      img: potionImg,
      vx: -(speed * 55 + rand(5, 30)),
      vy: 0,
      enemy: false,
      points: 10,
    });
  }
  
  function update(dt, level, speedMultiplier, playerCenter) {
    // Spawn
    spawnTimer += dt;
    const interval = level.spawnInterval / speedMultiplier;
    if (spawnTimer >= interval) {
      spawnTimer -= interval;
      spawn(level, speedMultiplier);
    }
    
    // Move objects
    objects.forEach(o => {
      o.x += o.vx * dt;
      
      if (o.type === 'scissors') {
        o.time = (o.time || 0) + dt;
        o.y = o.baseY + Math.sin(o.time * o.sinFreq + o.sinPhase) * o.sinAmp;
      }
      
      if (o.type === 'bomb' && playerCenter) {
        // Slowly track player Y
        const diff = playerCenter.y - (o.y + o.h / 2);
        o.y += Math.sign(diff) * Math.min(Math.abs(diff), o.trackSpeed * dt);
      }
    });
    
    // Remove off-screen
    objects = objects.filter(o => o.x + o.w > -60);
  }
  
  function checkCollisions(playerHitbox) {
    const results = [];
    
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      const oh = { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 };
      
      if (aabbCollide(playerHitbox, oh)) {
        results.push({ ...o, index: i });
        objects.splice(i, 1);
      }
    }
    
    return results;
  }
  
  function draw(time) {
    objects.forEach(o => {
      ctx.save();
      
      if (o.type === 'crystal') {
        ctx.shadowColor = COL.cyan;
        ctx.shadowBlur = 12 + 5 * Math.sin(time * 4);
      } else if (o.type === 'shield') {
        ctx.shadowColor = COL.cyan;
        ctx.shadowBlur = 8 + 3 * Math.sin(time * 3);
      } else if (o.type === 'heart') {
        ctx.shadowColor = '#FF4466';
        ctx.shadowBlur = 8 + 3 * Math.sin(time * 3);
        // Slight pulse
        const pulse = 1 + 0.05 * Math.sin(time * 5);
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-(o.x + o.w / 2), -(o.y + o.h / 2));
      } else if (o.enemy) {
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 8;
        
        // Rotation for scissors
        if (o.type === 'scissors') {
          ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
          ctx.rotate(Math.sin((o.time || 0) * 3) * 0.15);
          ctx.translate(-(o.x + o.w / 2), -(o.y + o.h / 2));
        }
      }
      
      ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
      ctx.restore();
    });
  }
  
  return { init, reset, update, checkCollisions, draw };
})();
