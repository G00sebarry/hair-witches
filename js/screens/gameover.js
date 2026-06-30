/* ============================================================
   SCREEN: GAME OVER — промокод скрыт до захвата лида
   ============================================================ */

const GameOverScreen = (() => {
  let showTimer = 0;
  let actionBtnY = -1;
  let codeUnlocked = false;
  let unlockedCode = '';

  function reset() {
    showTimer = 0;
    actionBtnY = -1;
    codeUnlocked = false;
    unlockedCode = '';
    if (typeof LeadForm !== 'undefined' && LeadForm.alreadyCaptured()) {
      codeUnlocked = true;
    }
  }

  function getActionBtnY() { return actionBtnY; }
  function isCodeUnlocked() { return codeUnlocked; }
  function unlockCode(code) { codeUnlocked = true; unlockedCode = code; }

  function getTier(totalScore) {
    let tier = PROMO_TIERS[0];
    for (const t of PROMO_TIERS) {
      if (totalScore >= t.minScore) tier = t;
    }
    return tier;
  }
  function tierDiscountNum(tier) {
    return parseInt(String(tier.discount).replace('%', '')) || 5;
  }

  function draw(totalScore, currentLevel, time) {
    showTimer += 0.016;

    const overlayAlpha = Math.min(showTimer * 2, 0.85);
    ctx.fillStyle = `rgba(5, 5, 15, ${overlayAlpha})`;
    ctx.fillRect(0, 0, W, H);
    if (showTimer < 0.3) return;

    const cx = W / 2;
    let cy = H * 0.08;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tier = getTier(totalScore);
    const discountNum = tierDiscountNum(tier);

    // GAME OVER
    ctx.font = `900 ${26 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF4444';
    ctx.fillText('GAME OVER', cx, cy);
    ctx.shadowBlur = 0;
    cy += 38 * SCALE;

    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#AAA';
    ctx.fillText(`Уровень ${currentLevel.id}: ${currentLevel.name}`, cx, cy);
    cy += 26 * SCALE;

    // Очки
    ctx.font = `bold ${22 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.white;
    ctx.fillText(`${totalScore}`, cx, cy);
    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#888';
    ctx.fillText('очков', cx, cy + 20 * SCALE);
    cy += 38 * SCALE;

    // Лестница тиров
    cy = drawTierLadder(cx, cy, discountNum);
    cy += 10 * SCALE;

    // Промо-бокс
    const boxW = Math.min(290 * SCALE, W - 36);
    const boxH = 92 * SCALE;
    const boxX = cx - boxW / 2;
    const boxY = cy;

    ctx.fillStyle = 'rgba(20, 0, 40, 0.92)';
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 2;
    roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill(); ctx.stroke();
    ctx.shadowColor = tier.color; ctx.shadowBlur = 8;
    roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke(); ctx.shadowBlur = 0;

    const midY = boxY + boxH / 2;

    if (codeUnlocked) {
      ctx.font = `${8.5 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#CCC';
      ctx.fillText('Твой промокод:', cx, midY - 22 * SCALE);

      const shownCode = unlockedCode || (typeof LeadForm !== 'undefined' ? LeadForm.getCodeForDiscount(discountNum) : tier.code);
      ctx.font = `bold ${20 * SCALE}px 'Press Start 2P', monospace`;
      ctx.shadowColor = tier.color; ctx.shadowBlur = 12;
      ctx.fillStyle = tier.color;
      ctx.fillText(shownCode, cx, midY + 4 * SCALE);
      ctx.shadowBlur = 0;

      ctx.font = `bold ${11 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.white;
      ctx.fillText(`Скидка ${tier.discount} на услугу Hair Witches!`, cx, midY + 28 * SCALE);
    } else {
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#CCC';
      ctx.fillText('Ты заработала скидку!', cx, midY - 18 * SCALE);

      ctx.font = `bold ${22 * SCALE}px 'Press Start 2P', monospace`;
      ctx.fillStyle = '#444';
      ctx.fillText('🔒 ? ? ? ?', cx, midY + 6 * SCALE);

      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#b89';
      ctx.fillText(`Забери промокод на скидку ${tier.discount}`, cx, midY + 30 * SCALE);
    }

    cy = boxY + boxH + 20 * SCALE;

    // Кнопка
    const btnW = 230 * SCALE, btnH = 46 * SCALE;
    const btnX = cx - btnW / 2;
    actionBtnY = cy;
    const pulse = 0.96 + 0.04 * Math.sin(time * 5);

    ctx.save();
    ctx.translate(cx, cy + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -(cy + btnH / 2));

    const btnColor = codeUnlocked ? COL.fuchsia : COL.lime;
    ctx.fillStyle = codeUnlocked ? '#1a0014' : '#001a08';
    ctx.strokeStyle = btnColor;
    ctx.lineWidth = 2;
    roundRect(btnX, cy, btnW, btnH, 10);
    ctx.fill(); ctx.stroke();

    ctx.shadowColor = btnColor; ctx.shadowBlur = 12;
    ctx.font = `bold ${12 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = btnColor;
    ctx.fillText(codeUnlocked ? '↻ ИГРАТЬ ЕЩЁ' : 'ЗАБРАТЬ ПРОМОКОД', cx, cy + btnH / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }

  function drawTierLadder(cx, startY, currentDiscount) {
    const tiers = PROMO_TIERS.map(t => ({
      d: parseInt(String(t.discount).replace('%','')) || 0,
      min: t.minScore,
    }));
    let y = startY;

    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#9988bb';
    ctx.fillText('ТВОЯ ЛЕСТНИЦА СКИДОК', cx, y);
    y += 18 * SCALE;

    const rowH = 18 * SCALE;
    tiers.forEach(t => {
      const achieved = currentDiscount >= t.d;
      const isCurrent = currentDiscount === t.d;
      let label, color, mark;

      if (isCurrent) {
        mark = '✦'; color = COL.lime; label = `${t.d}%  — ТВОЙ УРОВЕНЬ`;
      } else if (achieved) {
        mark = '✓'; color = '#5fa'; label = `${t.d}%  получено`;
      } else {
        mark = '🔒'; color = '#776699'; label = `${t.d}%  нужно ${t.min} очков`;
      }

      ctx.font = `${isCurrent ? 'bold ' : ''}${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = color;
      if (isCurrent) { ctx.shadowColor = COL.lime; ctx.shadowBlur = 8; }
      ctx.fillText(`${mark}  ${label}`, cx, y);
      ctx.shadowBlur = 0;
      y += rowH;
    });

    if (currentDiscount < 15) {
      y += 4 * SCALE;
      ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#FFD86B';
      ctx.fillText('Сыграй ещё и получи максимальную скидку!', cx, y);
      y += 14 * SCALE;
    }

    return y;
  }

  return { draw, reset, getActionBtnY, isCodeUnlocked, unlockCode };
})();
