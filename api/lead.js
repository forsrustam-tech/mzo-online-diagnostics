function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'method_not_allowed' });
  try {
    const { website='', name='', phone='', concern='', source='Сайт МЗО — онлайн-диагностика' } = req.body || {};
    if (website) return res.status(200).json({ ok:true });
    if (!name || !phone) return res.status(400).json({ ok:false, error:'validation_error' });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-1004328209807';
    if (!token) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
      return res.status(500).json({ ok:false, error:'telegram_not_configured' });
    }

    const text = [
      '<b>🆕 Новая заявка с сайта МЗО</b>',
      '',
      `<b>Имя:</b> ${escapeHtml(name)}`,
      `<b>Телефон:</b> ${escapeHtml(phone)}`,
      concern ? `<b>Беспокоит:</b> ${escapeHtml(concern)}` : null,
      `<b>Источник:</b> ${escapeHtml(source)}`,
    ].filter(Boolean).join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ chat_id: chatId, text, parse_mode:'HTML', disable_web_page_preview:true })
    });
    const tgData = await tg.json().catch(()=>null);
    if (!tg.ok || !tgData?.ok) {
      console.error('Telegram error', tg.status, tgData);
      return res.status(502).json({ ok:false, error:'telegram_request_failed' });
    }
    return res.status(200).json({ ok:true });
  } catch (e) {
    console.error('Lead handler error', e);
    return res.status(500).json({ ok:false, error:'server_error' });
  }
}