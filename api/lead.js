/* ============================================================
   /api/lead — serverless-функция Vercel
   Принимает лид из формы и шлёт в Telegram.
   Токен и chat_id — в Environment Variables Vercel (не в коде!).
   ============================================================ */

export default async function handler(req, res) {
  // только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const TG_TOKEN   = process.env.TG_TOKEN;     // из Vercel env
  const TG_CHAT_ID = process.env.TG_CHAT_ID;   // из Vercel env

  if (!TG_TOKEN || !TG_CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  try {
    const { name, phone, discount, code, score } = req.body || {};

    // лёгкая валидация на сервере
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }

    const text =
      `🆕 Новый лид Hair Witches!\n` +
      `Имя: ${String(name).slice(0, 60)}\n` +
      `Телефон: ${String(phone).slice(0, 30)}\n` +
      `Скидка: ${discount}% (код ${code})\n` +
      `Очки: ${score}`;

    const tgResp = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text }),
    });

    if (!tgResp.ok) {
      const errText = await tgResp.text();
      console.error('Telegram error:', errText);
      return res.status(502).json({ ok: false, error: 'Telegram send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Lead handler error:', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
