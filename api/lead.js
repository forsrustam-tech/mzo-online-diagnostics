function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function line(label, value) {
  if (!value) return null;
  return `<b>${label}:</b> ${escapeHtml(value)}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'method_not_allowed' });
  try {
    const {
      website='', name='', phone='', concern='', source='Сайт МЗО — онлайн-диагностика', attribution={}
    } = req.body || {};

    if (website) return res.status(200).json({ ok:true });
    if (!name || !phone) return res.status(400).json({ ok:false, error:'validation_error' });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-1004328209807';
    if (!token) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
      return res.status(500).json({ ok:false, error:'telegram_not_configured' });
    }

    const a = attribution && typeof attribution === 'object' ? attribution : {};
    const text = [
      '<b>🆕 Новая заявка с сайта МЗО</b>',
      '',
      line('Имя', name),
      line('Телефон', phone),
      concern ? line('Беспокоит', concern) : null,
      line('Источник', source),
      '',
      '<b>📊 Реклама / атрибуция</b>',
      line('UTM Source', a.utm_source),
      line('UTM Medium', a.utm_medium),
      line('Кампания', a.utm_campaign || a.campaign_name),
      line('Группа объявлений', a.utm_term || a.adset_name),
      line('Креатив / объявление', a.utm_content || a.ad_name),
      line('Campaign ID', a.campaign_id),
      line('Ad Set ID', a.adset_id),
      line('Ad ID', a.ad_id),
      line('FBCLID', a.fbclid)
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