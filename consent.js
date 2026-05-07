/* ============================================
   5149 Consent Manager
   - DSGVO-konformer Cookie-Banner
   - YouTube-Embeds nur nach Einwilligung
   - Google Fonts nur nach Einwilligung
   - Speichert Consent in localStorage
   ============================================ */
(function(){
  'use strict';
  var CONSENT_KEY = 'fiftyone49_consent_v1';
  var CONSENT_VALID_DAYS = 180;
  
  function getConsent(){
    try{
      var raw = localStorage.getItem(CONSENT_KEY);
      if(!raw) return null;
      var data = JSON.parse(raw);
      if(!data || !data.timestamp) return null;
      var age = (Date.now() - data.timestamp) / (1000*60*60*24);
      if(age > CONSENT_VALID_DAYS) return null;
      return data;
    }catch(e){return null;}
  }
  
  function setConsent(accepted){
    try{
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        timestamp: Date.now(),
        youtube: !!accepted,
        fonts: !!accepted
      }));
    }catch(e){}
  }
  
  function loadGoogleFonts(){
    if(document.getElementById('gf-loaded')) return;
    var l1 = document.createElement('link');
    l1.rel = 'preconnect';
    l1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(l1);
    var l2 = document.createElement('link');
    l2.rel = 'preconnect';
    l2.href = 'https://fonts.gstatic.com';
    l2.crossOrigin = 'anonymous';
    document.head.appendChild(l2);
    var link = document.createElement('link');
    link.id = 'gf-loaded';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap';
    document.head.appendChild(link);
  }
  
  function activateYouTube(){
    document.querySelectorAll('[data-yt-id]').forEach(function(el){
      if(el.dataset.activated) return;
      var id = el.dataset.ytId;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&modestbranding=1&autoplay=0';
      iframe.title = el.dataset.ytTitle || 'YouTube Video';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen','');
      iframe.setAttribute('frameborder','0');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block';
      el.innerHTML = '';
      el.appendChild(iframe);
      el.dataset.activated = '1';
    });
  }
  
  function showPlaceholders(){
    document.querySelectorAll('[data-yt-id]').forEach(function(el){
      if(el.dataset.activated) return;
      if(el.querySelector('.yt-placeholder')) return;
      var ph = document.createElement('div');
      ph.className = 'yt-placeholder';
      ph.innerHTML = '<div class="yt-ph-inner">'+
        '<div class="yt-ph-icon"><svg viewBox="0 0 40 40" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/><polygon points="16,13 16,27 28,20" fill="currentColor"/></svg></div>'+
        '<div class="yt-ph-text">YouTube-Video aktivieren</div>'+
        '<div class="yt-ph-sub">Beim Laden werden Daten an YouTube (Google) übertragen.</div>'+
        '<button class="yt-ph-btn" type="button">Video laden</button>'+
        '<a class="yt-ph-link" href="datenschutz.html">Mehr Infos</a>'+
      '</div>';
      el.appendChild(ph);
      ph.querySelector('.yt-ph-btn').addEventListener('click', function(){
        var id = el.dataset.ytId;
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&modestbranding=1&autoplay=1';
        iframe.title = el.dataset.ytTitle || 'YouTube Video';
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen','');
        iframe.setAttribute('frameborder','0');
        iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block';
        el.innerHTML = '';
        el.appendChild(iframe);
        el.dataset.activated = '1';
      });
    });
  }
  
  function injectStyles(){
    if(document.getElementById('consent-styles')) return;
    var s = document.createElement('style');
    s.id = 'consent-styles';
    s.textContent = ''+
    '.yt-placeholder{position:absolute;inset:0;background:#0e0e0e;display:flex;align-items:center;justify-content:center;text-align:center;padding:1rem;z-index:2}'+
    '.yt-ph-inner{max-width:90%;color:rgba(238,235,228,0.85)}'+
    '.yt-ph-icon{margin-bottom:0.8rem;color:rgba(238,235,228,0.45)}'+
    '.yt-ph-text{font-family:"Bebas Neue",Impact,sans-serif;font-size:1.1rem;letter-spacing:0.1em;margin-bottom:0.4rem;color:#eeebe4}'+
    '.yt-ph-sub{font-size:0.7rem;color:rgba(238,235,228,0.4);line-height:1.5;margin-bottom:1rem;font-weight:300}'+
    '.yt-ph-btn{background:#eeebe4;color:#060606;border:0;padding:0.6rem 1.4rem;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;cursor:pointer;transition:opacity 0.25s}'+
    '.yt-ph-btn:hover{opacity:0.85}'+
    '.yt-ph-link{display:block;margin-top:0.8rem;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(238,235,228,0.4);text-decoration:underline}'+
    '.yt-ph-link:hover{color:rgba(238,235,228,0.8)}'+
    '.video-hoch .yt-ph-text{font-size:0.95rem}'+
    '.video-hoch .yt-ph-sub{font-size:0.62rem;margin-bottom:0.7rem}'+
    '.video-hoch .yt-ph-btn{padding:0.5rem 1rem;font-size:0.62rem}'+
    '.video-hoch .yt-ph-icon svg{width:32px;height:32px}'+
    '.cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(6,6,6,0.97);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.1);padding:1.5rem 2rem;transform:translateY(100%);transition:transform 0.5s cubic-bezier(0.2,0.8,0.2,1)}'+
    '.cookie-banner.show{transform:translateY(0)}'+
    '.cookie-inner{max-width:1300px;margin:0 auto;display:grid;grid-template-columns:2fr auto;gap:2rem;align-items:center}'+
    '.cookie-text{color:rgba(238,235,228,0.75);font-size:0.85rem;line-height:1.6;font-weight:300}'+
    '.cookie-text strong{color:#eeebe4;font-weight:500;display:block;margin-bottom:0.3rem;font-family:"Bebas Neue",Impact,sans-serif;font-size:1rem;letter-spacing:0.08em}'+
    '.cookie-text a{color:#eeebe4;text-decoration:underline;text-underline-offset:2px}'+
    '.cookie-buttons{display:flex;gap:0.7rem;flex-shrink:0}'+
    '.cookie-btn{padding:0.85rem 1.5rem;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;font-weight:500;cursor:pointer;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#eeebe4;transition:all 0.25s;white-space:nowrap}'+
    '.cookie-btn:hover{background:rgba(255,255,255,0.05)}'+
    '.cookie-btn.primary{background:#eeebe4;color:#060606;border-color:#eeebe4;font-weight:600}'+
    '.cookie-btn.primary:hover{opacity:0.85;background:#eeebe4}'+
    '@media(max-width:768px){.cookie-banner{padding:1.2rem 1.2rem}.cookie-inner{grid-template-columns:1fr;gap:1rem}.cookie-buttons{flex-direction:column;width:100%}.cookie-btn{width:100%;text-align:center}}';
    document.head.appendChild(s);
  }
  
  function showBanner(){
    if(document.getElementById('cookie-banner')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.className = 'cookie-banner';
    b.innerHTML = ''+
      '<div class="cookie-inner">'+
        '<div class="cookie-text">'+
          '<strong>Cookies &amp; externe Inhalte</strong>'+
          'Diese Seite nutzt Google Fonts für die Schriftdarstellung und YouTube-Embeds zur Anzeige meiner Videos. Beim Akzeptieren werden Daten an Google übertragen. Ohne Einwilligung läuft die Seite mit Standard-Schriften und Video-Platzhaltern. Mehr dazu in der <a href="datenschutz.html">Datenschutzerklärung</a>.'+
        '</div>'+
        '<div class="cookie-buttons">'+
          '<button class="cookie-btn" id="cookie-decline" type="button">Ablehnen</button>'+
          '<button class="cookie-btn primary" id="cookie-accept" type="button">Akzeptieren</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(b);
    setTimeout(function(){b.classList.add('show')},200);
    document.getElementById('cookie-accept').addEventListener('click', function(){
      setConsent(true);
      loadGoogleFonts();
      activateYouTube();
      hideBanner();
    });
    document.getElementById('cookie-decline').addEventListener('click', function(){
      setConsent(false);
      showPlaceholders();
      hideBanner();
    });
  }
  
  function hideBanner(){
    var b = document.getElementById('cookie-banner');
    if(b){b.classList.remove('show'); setTimeout(function(){b.remove()},500);}
  }
  
  function init(){
    injectStyles();
    var consent = getConsent();
    if(consent === null){
      showPlaceholders();
      showBanner();
    }else if(consent.youtube || consent.fonts){
      if(consent.fonts) loadGoogleFonts();
      if(consent.youtube) activateYouTube(); else showPlaceholders();
    }else{
      showPlaceholders();
    }
    window.resetConsent = function(){
      try{localStorage.removeItem(CONSENT_KEY);}catch(e){}
      location.reload();
    };
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
