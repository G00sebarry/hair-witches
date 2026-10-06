/* Local UX prototype. No network requests or persistent personal data. */
(() => {
  const panel = document.createElement('section');
  panel.className = 'claimOverlay'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'claimTitle');
  panel.innerHTML = `<div class="claimCard"><button class="claimClose" type="button" aria-label="Вернуться к результату">×</button>
    <span class="claimBrand">HAIR WITCHES</span><h2 id="claimTitle">Твоя магия — твоя скидка</h2>
    <p class="claimOffer"></p><p class="claimDemo">Примерка формы · не настоящая заявка. Вводи тестовый номер.</p>
    <form novalidate><label class="phoneLabel" for="rewardPhone">Номер телефона</label>
    <input id="rewardPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 999 123-45-67" maxlength="24" aria-describedby="claimError">
    <p class="claimHint">После запуска менеджер свяжется с тобой для записи.</p>
    <label class="consentRow"><input name="personal" type="checkbox"><span>Согласен на обработку данных для получения скидки и обратного звонка. <button type="button" class="consentDetails">Текст согласия</button> · <a href="https://hairwitches.ru/privacy" target="_blank" rel="noopener noreferrer">Политика</a></span></label>
    <label class="consentRow"><input name="marketing" type="checkbox"><span>Хочу получать новости и предложения Hair Witches. Необязательно.</span></label>
    <p class="consentDraft" hidden>Проект для согласования: ИП Фреунд Станислав Борисович, ИНН 263602788099, обрабатывает номер телефона и результат игры для выдачи скидки и обратного звонка, с передачей в amoCRM. До запуска салон должен утвердить полный текст, сроки обработки и порядок отзыва, а также отдельный текст согласия на рекламу. В этой примерке данные никуда не отправляются.</p>
    <p id="claimError" role="alert"></p><button class="claimSubmit" type="submit">ПОЛУЧИТЬ ТЕСТОВЫЙ КОД</button></form>
    <div class="claimSuccess" hidden role="status"><p>Тестовый код готов</p><strong class="issuedCode"></strong><p class="issuedExpiry"></p><p class="issuedRepeat"></p><p>Любая услуга · без суммирования с другими акциями.</p><p class="claimHint">Это демонстрация. Код не действует в салоне, заявка в amoCRM не создана.</p><button class="claimDone" type="button">К РЕЗУЛЬТАТУ</button></div>
  </div>`;
  document.querySelector('#frame').append(panel);
  const form = panel.querySelector('form'), phone = form.elements.phone;
  const error = panel.querySelector('#claimError');
  const records = new Map(); // Discarded on reload; never store phones in browser storage.
  let discount = 5, origin;
  function close() { panel.hidden = true; form.reset(); document.querySelector('#frame').classList.remove('claimOpen'); [...panel.parentElement.children].forEach(n => { if(n !== panel) n.inert = false; }); origin?.focus(); }
  function open(value) {
    if (![5, 10, 15].includes(value)) return;
    discount = value; origin = document.activeElement;
    form.reset(); error.textContent = ''; phone.removeAttribute('aria-invalid');
    form.hidden = false; panel.querySelector('.claimSuccess').hidden = true;
    panel.querySelector('.consentDraft').hidden = true;
    panel.querySelector('.claimOffer').textContent = `${discount}% на любую услугу`;
    panel.hidden = false; document.querySelector('#frame').classList.add('claimOpen'); [...panel.parentElement.children].forEach(n => { if(n !== panel) n.inert = true; }); panel.scrollTop = 0; panel.querySelector('.claimClose').focus();
  }
  panel.querySelector('.claimClose').onclick = close;
  panel.querySelector('.claimDone').onclick = close;
  panel.querySelector('.consentDetails').onclick = () => {
    const text = panel.querySelector('.consentDraft'); text.hidden = !text.hidden;
  };
  panel.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const nodes = [...panel.querySelectorAll('button,input,a')].filter(n => n.getClientRects().length && !n.disabled);
      const first = nodes[0], last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener('submit', e => {
    e.preventDefault(); error.textContent = '';
    let number = phone.value.replace(/\D/g, '');
    if (number.length === 10) number = '7' + number;
    if (number.length === 11 && number[0] === '8') number = '7' + number.slice(1);
    if (!/^7\d{10}$/.test(number)) {
      error.textContent = 'Введи номер: +7 и ещё 10 цифр.';
      phone.setAttribute('aria-invalid', 'true'); phone.focus(); return;
    }
    phone.removeAttribute('aria-invalid');
    if (!form.elements.personal.checked) {
      error.textContent = 'Подтверди согласие на обработку данных.';
      form.elements.personal.focus(); return;
    }
    // Provisional campaign rule; production identity/uniqueness enforced by backend.
    const key = `${number}:${discount}`, existing = records.get(key);
    const record = existing || {code: 'DEMO-' + discount + '-' + Array.from(crypto.getRandomValues(new Uint8Array(5)), b => b.toString(16).padStart(2, '0')).join('').toUpperCase(), expires: Date.now() + 30 * 86400000};
    records.set(key, record);
    panel.querySelector('.issuedCode').textContent = record.code;
    panel.querySelector('.issuedExpiry').textContent = 'Записаться до ' + new Intl.DateTimeFormat('ru-RU', {timeZone:'Europe/Moscow'}).format(record.expires);
    panel.querySelector('.issuedRepeat').textContent = existing ? 'Этот тестовый номинал уже получен. Код и срок сохранены.' : 'Скидки разных номиналов учитываются отдельно.';
    form.hidden = true; form.reset();
    panel.querySelector('.claimSuccess').hidden = false;
    panel.querySelector('.claimDone').focus();
  });
  window.RewardClaim = {open, close};
  const preview = document.createElement('button'); preview.type = 'button';
  preview.textContent = 'Примерить получение скидки';
  preview.onclick = () => { if (typeof started !== 'undefined' && started && !paused && run.mode === 'playing') setPaused(true); open(10); };
  document.querySelector('.lab').append(preview);
})();
