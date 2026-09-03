(() => {
  const PIXEL_ID = '1759543388108569';
  const INSTAGRAM_URL = 'https://www.instagram.com/mzosanki/';
  const REDIRECT_SECONDS = 3;

  if (!window.fbq) {
    const n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(t, s);
  }

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');

  const confirmedLead = sessionStorage.getItem('mzoLeadPending') === '1';
  if (confirmedLead) {
    window.fbq('track', 'Lead');
    sessionStorage.removeItem('mzoLeadPending');
  }

  const countdown = document.getElementById('redirect-countdown');
  let seconds = REDIRECT_SECONDS;
  const timer = window.setInterval(() => {
    seconds -= 1;
    if (countdown) countdown.textContent = String(Math.max(seconds, 0));
    if (seconds <= 0) {
      window.clearInterval(timer);
      window.location.replace(INSTAGRAM_URL);
    }
  }, 1000);
})();