/* /api/lead — validated lead delivery to Telegram. */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ ok: false, error: 'JSON_REQUIRED' });
  }
  // Browser cross-site submissions are rejected; this is not bot protection.
  if (req.headers['sec-fetch-site'] === 'cross-site') {
    return res.status(403).json({ ok: false, error: 'CROSS_SITE_REQUEST' });
  }
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: 'INVALID_BODY' });
  }
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 4096) {
    return res.status(413).json({ ok: false, error: 'BODY_TOO_LARGE' });
  }
  const { name, phone, discount, code, score } = body;
  if (typeof name !== 'string' || typeof phone !== 'string' ||
      name.trim().length < 2 || name.trim().length > 40 ||
      /[\u0000-\u001f\u007f\u2028\u2029]/.test(name) ||
      phone.length > 30 || !/^[+()\d\s-]+$/.test(phone) ||
      /[\u0000-\u001f\u007f\u2028\u2029]/.test(phone)) {
    return res.status(400).json({ ok: false, error: 'INVALID_CONTACT' });
  }
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (!/^7\d{10}$/.test(digits)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PHONE' });
  }
  // Validate field shapes only. Game score and entitlement remain client-reported
  // until the separately approved server-side promo issuance step.
  if (![5, 10, 15].includes(discount) ||
      typeof code !== 'string' || !/^[A-Z0-9]{6}$/.test(code) ||
      !Number.isSafeInteger(score) || score < 0) {
    return res.status(400).json({ ok: false, error: 'INVALID_GAME_RESULT' });
  }
  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    return res.status(503).json({ ok: false, error: 'SERVER_NOT_CONFIGURED' });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const text =
      `🆕 Новый лид Hair Witches!\n` +
      `Имя: ${name.trim()}\n` +
      `Телефон: +${digits}\n` +
      `Скидка: ${discount}% (код ${code})\n` +
      `Очки: ${score}`;
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true ||
        !Number.isInteger(result.result?.message_id)) {
      console.error('Lead delivery rejected', { status: response.status });
      return res.status(502).json({ ok: false, error: 'DELIVERY_FAILED' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    const timedOut = controller.signal.aborted;
    // Do not log raw exceptions: request URLs may contain the bot token.
    console.error('Lead delivery failed', { timedOut });
    return res.status(timedOut ? 504 : 502).json({
      ok: false, error: timedOut ? 'DELIVERY_TIMEOUT' : 'DELIVERY_FAILED',
    });
  } finally {
    clearTimeout(timeout);
  }
}
