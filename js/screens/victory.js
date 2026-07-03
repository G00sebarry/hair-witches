/* ============================================================
   SCREEN: VICTORY — долетела до Hair Witches
   Промокод скрыт до захвата лида. Рестарт в один тап + рекорд.
   ============================================================ */

const VictoryScreen = (() => {
  let showTimer = 0;
  let codeUnlocked = false;
  let unlockedCode = '';
  let bestScore = 0;
  let isNewRecord = false;

  // хит-зоны (заполняются в draw, читаются в handleClick)
  let promoBtnRect = null;
  let restartBtnRect = null;
  let selectLinkRect = null;

  function reset(finalScore) {
    showTimer = 0;
    codeUnlocked = false;
    unlockedCode = '';
    promoBtnRect = null;
    restartBtnRect = null;
    selectLinkRect = null;

    // рекорд (Фича 2.3)
    const stored = parseInt(localStorage.getItem('hw_best_score') || '0');
    if (typeof finalScore === 'number' && finalScore > stored) {
      isNewRecord = true;
      bestScore = finalScore;
      try { localStorage.setItem('hw_best_score', String(finalScore)); } catch (e) {}
    } else {
      isNewRecord = false;
      bestScore = stored;
    }

    // если контакт уже оставляли раньше — код сразу доступен
    if (typeof LeadForm !== 'undefined' && LeadForm.alreadyCaptured()) {
      codeUnlocked = true;
    }
  }

  function isCodeUnlocked() { return codeUnlocked; }
  function unlockCode(code) { codeUnlocked = true; unlockedCode = code; }

  function inRect(mx, my, r) {
    return r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
  }

  // возвращает 'restart' | 'lead' | 'select' | null
  function handleClick(mx, my) {
    if (inRect(mx, my, restartBtnRect)) return 'restart';
    if (inRect(mx, my, promoBtnRect)) return 'lead';
    if (inRect(mx, my, selectLinkRect)) return 'select';
    return null;
  }

  // тир по очкам
  function getTier(totalScore) {
    let tier = PROMO_TIERS[0];
    for (const t of PROMO_TIERS) {
      if (totalScore >= t.minScore) tier = t;
    }
    return tier;
  }

  // числовая скидка из тира (5/10/15)
  function tierDiscountNum(tier) {
    return parseInt(String(tier.discount).replace('%', '')) || 5;
  }

  function draw(totalScore, time) {
    showTimer += 0.016;

    const overlayAlpha = Math.min(showTimer * 2, 0.82);
    ctx.fillStyle = `rgba(0, 8, 4, ${overlayAlpha})`;
    ctx.fillRect(0, 0, W, H);
    if (showTimer < 0.3) return;

    const cx = W / 2;
    let cy = H * 0.07;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tier = getTier(totalScore);
    const discountNum = tierDiscountNum(tier);
    const prog = promoProgress(totalScore);
    const nearMiss = !prog.isMax && prog.fraction >= 0.7 && prog.fraction < 1;

    // ── Заголовок ──
    ctx.font = `900 ${24 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.lime; ctx.shadowBlur = 28;
    ctx.fillStyle = COL.lime;
    ctx.fillText('ТЫ ДОЛЕТЕЛА!', cx, cy);
    ctx.shadowBlur = 0;
    cy += 34 * SCALE;

    ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#CCC';
    ctx.fillText('до Hair Witches ✦', cx, cy);
    cy += 30 * SCALE;

    // ── Очки ──
    ctx.font = `bold ${26 * SCALE}px 'Orbitron', sans-serif`;
    ctx.shadowColor = COL.gold; ctx.shadowBlur = 14;
    ctx.fillStyle = COL.gold;
    ctx.fillText(`${totalScore}`, cx, cy);
    ctx.shadowBlur = 0;
    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#888';
    ctx.fillText('очков', cx, cy + 20 * SCALE);
    cy += 36 * SCALE;

    // Рекорд (Фича 2.3)
    ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
    if (isNewRecord) {
      ctx.fillStyle = tier.color;
      ctx.shadowColor = tier.color; ctx.shadowBlur = 8;
      ctx.fillText('НОВЫЙ РЕКОРД!', cx, cy);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#8878a0';
      ctx.fillText(`рекорд: ${bestScore}`, cx, cy);
    }
    cy += 18 * SCALE;

    // ── Азарт-лестница тиров ──
    cy = drawTierLadder(cx, cy, discountNum);
    cy += 10 * SCALE;

    // ── Промо-бокс ──
    const boxW = Math.min(290 * SCALE, W - 36);
    const boxH = 92 * SCALE;
    const boxX = cx - boxW / 2;
    const boxY = cy;

    ctx.fillStyle = 'rgba(0, 18, 8, 0.92)';
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 2;
    roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill(); ctx.stroke();
    ctx.shadowColor = tier.color; ctx.shadowBlur = 8;
    roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke(); ctx.shadowBlur = 0;

    const midY = boxY + boxH / 2;

    if (codeUnlocked) {
      // код раскрыт
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
      // код скрыт — заберёшь после формы
      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#CCC';
      ctx.fillText('Твоя скидка готова!', cx, midY - 18 * SCALE);

      ctx.font = `bold ${22 * SCALE}px 'Press Start 2P', monospace`;
      ctx.fillStyle = '#444';
      ctx.fillText('🔒 ? ? ? ?', cx, midY + 6 * SCALE);

      ctx.font = `${9 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#9a8';
      ctx.fillText(`Забери промокод на скидку ${tier.discount}`, cx, midY + 30 * SCALE);
    }

    cy = boxY + boxH + 14 * SCALE;

    // Near-miss: чуть-чуть не хватило до следующего тира (Фича 1.3)
    if (nearMiss) {
      ctx.font = `bold ${9.5 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = prog.next.color;
      ctx.shadowColor = prog.next.color; ctx.shadowBlur = 8;
      ctx.fillText(`Не хватило ${prog.remaining} очков до скидки ${prog.next.discount}!`, cx, cy);
      ctx.shadowBlur = 0;
      cy += 20 * SCALE;
    }

    // ── Кнопки ──
    const btnW = 230 * SCALE, btnH = 44 * SCALE;
    const btnX = cx - btnW / 2;

    // 1) Забрать промокод (только пока код не забран)
    promoBtnRect = null;
    if (!codeUnlocked) {
      promoBtnRect = { x: btnX, y: cy, w: btnW, h: btnH };
      ctx.fillStyle = '#001a08';
      ctx.strokeStyle = COL.lime;
      ctx.lineWidth = 2;
      ctx.shadowColor = COL.lime; ctx.shadowBlur = 10;
      roundRect(btnX, cy, btnW, btnH, 10);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = `bold ${12 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = COL.lime;
      ctx.fillText('ЗАБРАТЬ ПРОМОКОД', cx, cy + btnH / 2);
      cy += btnH + 12 * SCALE;
    }

    // 2) ЕЩЁ РАЗ — мгновенный рестарт (всегда). Пульс сильнее при near-miss
    restartBtnRect = { x: btnX, y: cy, w: btnW, h: btnH };
    const amp = nearMiss ? 0.06 : 0.04;
    const pulse = 0.96 + amp * Math.sin(time * 5);
    ctx.save();
    ctx.translate(cx, cy + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -(cy + btnH / 2));
    ctx.fillStyle = '#001a1f';
    ctx.strokeStyle = COL.cyan;
    ctx.lineWidth = 2;
    ctx.shadowColor = COL.cyan; ctx.shadowBlur = 12;
    roundRect(btnX, cy, btnW, btnH, 10);
    ctx.fill(); ctx.stroke();
    ctx.font = `bold ${13 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = COL.cyan;
    ctx.fillText('↻ ЕЩЁ РАЗ', cx, cy + btnH / 2);
    ctx.shadowBlur = 0;
    ctx.restore();
    cy += btnH + 16 * SCALE;

    // 3) Сменить ведьму — текст-ссылка → SELECT
    const linkH = 22 * SCALE;
    selectLinkRect = { x: cx - 80 * SCALE, y: cy - linkH / 2, w: 160 * SCALE, h: linkH };
    ctx.font = `${9.5 * SCALE}px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#9a8fb5';
    ctx.fillText('сменить ведьму', cx, cy);

    ctx.restore();
  }

  // Лестница тиров: 5% / 10% / 15% с отметками
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

    // мотивация если не максимум
    if (currentDiscount < 15) {
      y += 4 * SCALE;
      ctx.font = `${8 * SCALE}px 'Orbitron', sans-serif`;
      ctx.fillStyle = '#FFD86B';
      ctx.fillText('Сыграй ещё и получи максимальную скидку!', cx, y);
      y += 14 * SCALE;
    }

    return y;
  }

  return { draw, reset, isCodeUnlocked, unlockCode, handleClick };
})();
