/* ============================================
   5149 · main.js
   - Aktiver Nav-Punkt, Header-Zustand
   - Mobile-Menü (Escape, Fokusfalle, aria)
   - Reveal beim Scrollen
   - Footer-Jahr
   - Kontaktformular (deutsche Fehlermeldungen, Netlify Forms)
   ============================================ */
(function(){
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');

  /* Aktiver Nav-Punkt – die Navigation ist auf allen Seiten byte-identisch,
     deshalb setzt JS aria-current anhand der URL. */
  function normalize(pathname){
    return pathname.replace(/(index)?(\.html)?$/, '');
  }
  var current = normalize(location.pathname);
  document.querySelectorAll('.nav__list a, .menu__list a').forEach(function(link){
    var url = new URL(link.href);
    if (url.hash) return;
    if (normalize(url.pathname) === current) link.setAttribute('aria-current', 'page');
  });

  /* Header bekommt nach dem ersten Scrollen einen Hintergrund */
  if (header) {
    var onScroll = function(){
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile-Menü */
  if (burger && menu) {
    var isOpen = false;

    var focusables = function(){
      return [burger].concat([].slice.call(menu.querySelectorAll('a[href], button:not([disabled])')));
    };

    var setOpen = function(open, returnFocus){
      isOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      menu.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      document.querySelectorAll('main, .site-footer').forEach(function(el){ el.inert = open; });
      if (open) {
        var first = menu.querySelector('a[href]');
        if (first) first.focus();
      } else if (returnFocus) {
        burger.focus();
      }
    };

    burger.addEventListener('click', function(){ setOpen(!isOpen, true); });

    menu.querySelectorAll('a[href]').forEach(function(link){
      link.addEventListener('click', function(){ setOpen(false, false); });
    });

    document.addEventListener('keydown', function(event){
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false, true);
        return;
      }
      if (event.key !== 'Tab') return;
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      var inside = items.indexOf(document.activeElement) !== -1;
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    });

    var desktop = window.matchMedia('(width >= 64rem)');
    var onBreakpoint = function(){ if (desktop.matches && isOpen) setOpen(false, false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  }

  /* Reveal – nur Elemente unterhalb des ersten Bildschirms werden ausgeblendet */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    reveals.forEach(function(el){
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('is-pending');
        observer.observe(el);
      }
    });
  }

  /* Footer-Jahr */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = year; });

  /* Kontaktformular */
  var form = document.querySelector('form[name="anfrage"]');
  if (form) {
    var success = document.getElementById('anfrage-gesendet');
    var messages = {
      name: 'Bitte trag deinen Namen ein.',
      email: 'Das sieht nicht nach einer E-Mail-Adresse aus.',
      nachricht: 'Schreib mir kurz, worum es geht.'
    };

    Object.keys(messages).forEach(function(name){
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener('invalid', function(){
        field.setCustomValidity('');
        if (!field.validity.valid) field.setCustomValidity(messages[name]);
      });
      field.addEventListener('input', function(){ field.setCustomValidity(''); });
    });

    var showSuccess = function(){
      form.hidden = true;
      success.hidden = false;
      success.focus();
    };

    /* Rückkehr nach dem Absenden ohne JS (action="/?anfrage=gesendet#kontakt") */
    if (new URLSearchParams(location.search).get('anfrage') === 'gesendet') showSuccess();

    form.addEventListener('submit', function(event){
      if (!window.fetch || !window.URLSearchParams) return;
      event.preventDefault();
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function(response){
        if (!response.ok) throw new Error(String(response.status));
        showSuccess();
      }).catch(function(){
        /* Fallback: klassisch absenden, Netlify leitet auf die action-URL */
        form.submit();
      });
    });
  }
})();
