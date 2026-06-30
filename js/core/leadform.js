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

  function init() {
    overlay    = document.getElementById('lead-overlay');
    card       = document.getElementById('lead-card');
    nameInput  = document.getElementById('lead-name');
    phoneInput = document.getElementById('lead-phone');
    errorBox   = document.getElementById('lead-error');
    submitBtn  = document.getElementById('lead-submit');

    if (!overlay) return;

    // автоформат телефона
    phoneInput.addEventListener('input', onPhoneInput);
    submitBtn.addEventListener('click', onSubmit);

    // не давать тапу по форме уходить в игру
    overlay.addEventListener('mousedown', e => e.stopPropagation());
    overlay.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  }

  // ── Уже оставлял контакт? ──
  function alreadyCaptured() {
    try { return localStorage.getItem(LS_KEY) === '1'; }
    catch (e) { return false; }
  }

  function getCodeForDiscount(discount) {
    return CODES[discount] || CODES[5];
  }

  // ── Показать форму ──
  // discount: 5|10|15, score: число, cb: колбэк(code) после успеха
  function show(discount, score, cb) {
    currentDiscount = discount;
    currentScore = score;
    onComplete = cb;

    // если контакт уже был — сразу выдаём код, форму не показываем
    if (alreadyCaptured()) {
      if (onComplete) onComplete(getCodeForDiscount(discount));
      return;
    }

    if (!overlay) { if (onComplete) onComplete(getCodeForDiscount(discount)); return; }

    errorBox.textContent = '';
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
    const resp = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, discount, code, score }),
    });
    if (!resp.ok) throw new Error('lead send failed: ' + resp.status);
    return true;
  }

  // ── Сабмит ──
  async function onSubmit() {
    const err = validate();
    if (err) {
      errorBox.textContent = err;
      return;
    }
    errorBox.textContent = '';

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const code = getCodeForDiscount(currentDiscount);

    submitBtn.disabled = true;
    submitBtn.textContent = 'ОТПРАВЛЯЕМ...';

    try {
      await sendLead(name, phone, currentDiscount, code, currentScore);
    } catch (e) {
      // даже если ТГ не дошёл — не блокируем человека, код всё равно дадим,
      // но залогируем в консоль. (для MVP: лучше выдать код, чем потерять лояльность)
      console.warn('Lead send error:', e);
    }

    // помечаем что контакт оставлен (один раз)
    try {
      localStorage.setItem(LS_KEY, '1');
      localStorage.setItem(LS_NAME, name);
    } catch (e) {}

    hide();
    if (onComplete) onComplete(code);
  }

  return {
    init, show, hide,
    alreadyCaptured,
    getCodeForDiscount,
  };
})();
