(() => {
  const INSTAGRAM_URL = 'https://www.instagram.com/mzosanki/';
  const REDIRECT_SECONDS = 5;
  const confirmedLead = sessionStorage.getItem('mzoLeadPending') === '1';

  if (confirmedLead && typeof window.fbq === 'function') {
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