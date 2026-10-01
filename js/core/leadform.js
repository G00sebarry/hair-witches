/* ============================================================
   LEADFORM — захват лида (имя+телефон → промокод)
   Отправка в Telegram-бот, флаг "контакт взят" в localStorage.
   ============================================================ */

const LeadForm = (() => {
  // ── НАСТРОЙКИ ──────────────────────────────────────────

  // Три НЕугадываемых кода по тирам скидки
  const CODES = {
    5:  'HW7F2K',
    10: 'MX9QP4',
    15: 'ZK3R8N',
  };

  const LS_KEY = 'hw_lead_done';   // флаг что контакт уже оставлен
  const LS_NAME = 'hw_lead_name';  // запомненное имя (для повторных)

  let overlay, card, nameInput, phoneInput, errorBox, submitBtn;
  let onComplete = null;     // колбэк после успеха: (code) => {}
  let currentDiscount = 5;
  let currentScore = 0;
  let initialized = false;
  let submitting = false;
  let capturedThisSession = false;
  let failedAttempts = 0;
  let fallbackBox;

  function init() {
    if (initialized) return;
    overlay    = document.getElementById('lead-overlay');
    card       = document.getElementById('lead-card');
    nameInput  = document.getElementById('lead-name');
    phoneInput = document.getElementById('lead-phone');
    errorBox   = document.getElementById('lead-error');
    submitBtn  = document.getElementById('lead-submit');
    fallbackBox = document.getElementById('lead-fallback');

    if (!overlay) return;
    initialized = true;

    // автоформат телефона
    phoneInput.addEventListener('input', onPhoneInput);
    submitBtn.addEventListener('click', onSubmit);

    // не давать тапу по форме уходить в игру
    overlay.addEventListener('mousedown', e => e.stopPropagation());
    overlay.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  }

  // ── Уже оставлял контакт? ──
  function alreadyCaptured() {
    if (capturedThisSession) return true;
    try { return localStorage.getItem(LS_KEY) === '1'; }
    catch (e) { return false; }
  }

  function getCodeForDiscount(discount) {
    return CODES[discount] || CODES[5];
  }

  // ── Показать форму ──
  // discount: 5|10|15, score: число, cb: колбэк(code) после успеха
  function show(discount, score, cb) {
    if (submitting) return;
    init();
    currentDiscount = discount;
    currentScore = score;
    onComplete = cb;

    // если контакт уже был — сразу выдаём код, форму не показываем
    if (alreadyCaptured()) {
      if (onComplete) onComplete(getCodeForDiscount(discount));
      return;
    }

    if (!overlay) {
      console.error('Lead form is unavailable');
      return;
    }

    errorBox.textContent = '';
    failedAttempts = 0;
    if (fallbackBox) {
      fallbackBox.hidden = true;
      fallbackBox.textContent = '';
    }
    nameInput.value = '';
    phoneInput.value = '+7 ';
    submitBtn.disabled = false;
    submitBtn.textContent = 'ПОЛУЧИТЬ ПРОМОКОД';
    overlay.classList.remove('lead-hidden');
    setTimeout(() => nameInput.focus(), 100);
  }

  function hide() {
    if (overlay) overlay.classList.add('lead-hidden');
  }

  function showFallback() {
    if (!fallbackBox) return;
    fallbackBox.textContent = 'Не получилось отправить заявку. Позвони или напиши в салон и назови свой результат';
    const result = document.createElement('div');
    result.textContent = `Твой результат: ${currentScore} очков`;
    fallbackBox.appendChild(result);

    const phone = SALON_CONTACT.phone.trim();
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (/^\+\d{10,15}$/.test(normalizedPhone)) {
      const link = document.createElement('a');
      link.href = `tel:${normalizedPhone}`;
      link.textContent = phone;
      fallbackBox.appendChild(link);
    }
    try {
      const url = new URL(SALON_CONTACT.messageUrl);
      if (url.protocol === 'https:') {
        const link = document.createElement('a');
        link.href = url.href;
        link.textContent = 'Написать в салон';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        fallbackBox.appendChild(link);
      }
    } catch (e) {}
    fallbackBox.hidden = false;
  }

  // ── Автоформат телефона +7 (___) ___-__-__ ──
  function onPhoneInput() {
    let digits = phoneInput.value.replace(/\D/g, '');
    // если начинается с 8 — меняем на 7
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11); // 7 + 10 цифр

    let f = '+7';
    if (digits.length > 1) f += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) f += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) f += '-' + digits.slice(7, 9);
    if (digits.length >= 9) f += '-' + digits.slice(9, 11);
    phoneInput.value = f;
  }

  // ── Валидация ──
  function validate() {
    const name = nameInput.value.trim();
    const digits = phoneInput.value.replace(/\D/g, '');

    if (name.length < 2) {
      return 'Введи имя';
    }
    // +7 и ещё 10 цифр = 11 всего
    if (digits.length !== 11 || !digits.startsWith('7')) {
      return 'Проверь номер телефона';
    }
    return null;
  }

  // ── Отправка лида на сервер ──
  async function sendLead(name, phone, discount, code, score) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const resp = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ name, phone, discount, code, score }),
      });
      const result = await resp.json();
      if (!resp.ok || result.ok !== true) throw new Error('LEAD_NOT_CONFIRMED');
    } finally {
      clearTimeout(timeout);
    }
  }

  // ── Сабмит ──
  async function onSubmit() {
    if (submitting) return;
    const err = validate();
    if (err) {
      errorBox.textContent = err;
      return;
    }
    errorBox.textContent = '';

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const code = getCodeForDiscount(currentDiscount);

    submitting = true;
    submitBtn.disabled = true;
    nameInput.disabled = true;
    phoneInput.disabled = true;
    submitBtn.textContent = 'ОТПРАВЛЯЕМ...';

    let delivered = false;
    try {
      await sendLead(name, phone, currentDiscount, code, currentScore);
      delivered = true;
      capturedThisSession = true;
      try {
        localStorage.setItem(LS_KEY, '1');
        localStorage.setItem(LS_NAME, name);
      } catch (e) {}
    } catch (e) {
      failedAttempts++;
      errorBox.textContent = 'Не удалось подтвердить отправку. Данные сохранены в форме — попробуй ещё раз.';
      if (failedAttempts >= 2) showFallback();
    } finally {
      submitting = false;
      submitBtn.disabled = false;
      nameInput.disabled = false;
      phoneInput.disabled = false;
      submitBtn.textContent = delivered ? 'ПОЛУЧИТЬ ПРОМОКОД' : 'ПОВТОРИТЬ ОТПРАВКУ';
    }
    if (delivered) {
      hide();
      if (onComplete) onComplete(code);
    }
  }

  return {
    init, show, hide,
    alreadyCaptured,
    getCodeForDiscount,
  };
})();
