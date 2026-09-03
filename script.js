(() => {
  const PIXEL_ID = '1008630185549974';

  // Meta Pixel base code: tracks PageView on the landing page only.
  // Lead is intentionally fired only on /thank-you.html after a successful form submit.
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

  const modal = document.getElementById('lead-modal');
  const form = document.getElementById('lead-form');
  const phone = document.getElementById('lead-phone');
  const error = document.getElementById('form-error');
  const openers = document.querySelectorAll('.cta-primary, .sticky-cta');

  function openModal(e){
    if(e && e.target.closest('#lead-modal')) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('lead-name')?.focus(),50);
  }

  function closeModal(){
    modal.classList.remove('is-open','is-loading');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }

  openers.forEach(btn => {
    if(!btn.closest('#lead-modal')) btn.addEventListener('click', openModal);
  });
  document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal();});

  function digits10(value){
    let d=(value||'').replace(/\D/g,'');
    if(d.startsWith('8') && d.length>=11) d='7'+d.slice(1);
    if(d.startsWith('7')) d=d.slice(1);
    return d.slice(0,10);
  }

  function formatPhone(value){
    const d=digits10(value);
    if(!d) return '';
    let s='+7';
    if(d.length) s+=' ('+d.slice(0,3);
    if(d.length>=3) s+=')';
    if(d.length>3) s+=' '+d.slice(3,6);
    if(d.length>6) s+='-'+d.slice(6,8);
    if(d.length>8) s+='-'+d.slice(8,10);
    return s;
  }

  phone.addEventListener('focus',()=>{ if(!phone.value) phone.value='+7 ('; });
  phone.addEventListener('blur',()=>{ if(digits10(phone.value).length===0) phone.value=''; });
  phone.addEventListener('input',()=>{ phone.value=formatPhone(phone.value); });
  phone.addEventListener('paste',()=>setTimeout(()=>{phone.value=formatPhone(phone.value)},0));

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    error.hidden=true;
    error.textContent='';

    const name=document.getElementById('lead-name').value.trim();
    const d=digits10(phone.value);
    const concern=document.getElementById('lead-concern').value.trim();
    const website=form.elements.website.value;

    if(!name){
      error.textContent='Укажите ваше имя.';
      error.hidden=false;
      return;
    }
    if(d.length!==10){
      error.textContent='Введите номер полностью: +7 (___) ___-__-__';
      error.hidden=false;
      return;
    }

    modal.classList.add('is-loading');

    try{
      const res=await fetch('/api/lead',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          website,
          name,
          phone:'+7'+d,
          concern,
          source:'Сайт МЗО — онлайн-диагностика'
        })
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok || !data.ok) throw new Error(data.error||'request_failed');

      sessionStorage.setItem('mzoLeadPending', '1');
      window.location.assign('/thank-you.html');
    }catch(err){
      console.error(err);
      error.textContent='Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.';
      error.hidden=false;
      modal.classList.remove('is-loading');
    }
  });
})();