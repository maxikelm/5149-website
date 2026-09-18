/* ============================================
   5149 Consent Manager
   - DSGVO-konformer Hinweis für externe Videos
   - YouTube-Embeds nur nach Einwilligung oder Klick
   - Banner nur auf Seiten mit YouTube-Embeds
   - Speichert Consent in localStorage
   - Styles liegen in assets/css/style.css
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
        youtube: !!accepted
      }));
    }catch(e){}
  }

  function embed(el, autoplay){
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(el.dataset.ytId)+'?rel=0&modestbranding=1&autoplay='+(autoplay ? '1' : '0');
    iframe.title = el.dataset.ytTitle || 'YouTube Video';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen','');
    if(!autoplay) iframe.setAttribute('loading','lazy');
    el.textContent = '';
    el.appendChild(iframe);
    el.dataset.activated = '1';
  }

  function activateYouTube(){
    document.querySelectorAll('[data-yt-id]').forEach(function(el){
      if(el.dataset.activated) return;
      embed(el, false);
    });
  }

  function showPlaceholders(){
    document.querySelectorAll('[data-yt-id]').forEach(function(el){
      if(el.dataset.activated) return;
      if(el.querySelector('.yt-placeholder')) return;
      var ph = document.createElement('div');
      ph.className = 'yt-placeholder';
      ph.innerHTML = '<div class="yt-ph-inner">'+
        '<div class="yt-ph-icon" aria-hidden="true"><svg viewBox="0 0 40 40" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/><polygon points="16,13 16,27 28,20" fill="currentColor"/></svg></div>'+
        '<p class="yt-ph-text">YouTube-Video aktivieren</p>'+
        '<p class="yt-ph-sub">Beim Laden werden Daten an YouTube (Google) übertragen.</p>'+
        '<button class="btn btn--primary btn--small yt-ph-btn" type="button">Video laden</button>'+
        '<a class="ui-link yt-ph-link" href="/datenschutz.html">Datenschutzerklärung</a>'+
      '</div>';
      el.appendChild(ph);
      ph.querySelector('.yt-ph-btn').addEventListener('click', function(){
        embed(el, true);
      });
    });
  }

  function showBanner(){
    if(document.getElementById('cookie-banner')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.className = 'cookie-banner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-labelledby', 'cookie-banner-title');
    b.innerHTML = ''+
      '<div class="cookie-banner__inner wrap">'+
        '<div class="cookie-banner__text">'+
          '<p class="t-h3" id="cookie-banner-title">Externe Videos</p>'+
          '<p>Auf dieser Seite sind Videos von YouTube eingebettet. Wenn du sie lädst, werden Daten an YouTube (Google) übertragen. <a class="link" href="/datenschutz.html">Datenschutzerklärung</a></p>'+
        '</div>'+
        '<div class="cookie-banner__buttons">'+
          '<button class="btn btn--ghost" id="cookie-decline" type="button">Ablehnen</button>'+
          '<button class="btn btn--primary" id="cookie-accept" type="button">Videos erlauben</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(b);
    document.getElementById('cookie-accept').addEventListener('click', function(){
      setConsent(true);
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
    if(b) b.remove();
  }

  function init(){
    var hasVideos = document.querySelector('[data-yt-id]') !== null;
    var consent = getConsent();
    if(hasVideos){
      if(consent && consent.youtube){
        activateYouTube();
      }else{
        showPlaceholders();
        if(consent === null) showBanner();
      }
    }
    window.resetConsent = function(){
      try{localStorage.removeItem(CONSENT_KEY);}catch(e){}
      location.reload();
    };
    document.querySelectorAll('[data-consent-reset]').forEach(function(btn){
      btn.addEventListener('click', window.resetConsent);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
