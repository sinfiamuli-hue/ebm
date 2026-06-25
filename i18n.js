/**
 * i18n.js  —  Ekuveri Boli Mulah  ·  Bilingual Language System
 *
 * Architecture:
 *  - <html data-lang="en|dv"> drives ALL show/hide via CSS (zero FOUC).
 *    The inline script in <head> sets this attribute before first paint.
 *  - This file handles the interactive layer: button clicks, ARIA states,
 *    hero background swap, nav toggle, page title, scroll-reveal sync.
 *
 * No framework, no build step — runs on Cloudflare Pages / GitHub Pages as-is.
 */

(function () {
  'use strict';

  /* ── Page titles ─────────────────────────────────────────────────────── */
  var TITLES = {
    en: 'Ekuveri Boli Mulah – Maldivian Cultural Performances',
    dv: 'އެކުވެެރި ބޮލި މուލައް – ދިވެހި ސަގާފީ ހަރަކާތް'
  };

  /* ── Core setLang ────────────────────────────────────────────────────── */
  function setLang(lang) {
    if (lang !== 'en' && lang !== 'dv') lang = 'en';

    var html = document.documentElement;

    /* 1. <html> attributes — CSS data-lang selectors do the show/hide */
    html.setAttribute('lang',      lang);
    html.setAttribute('dir',       lang === 'dv' ? 'rtl' : 'ltr');
    html.setAttribute('data-lang', lang);

    /* 2. Hero background swap */
    var heroBg = document.getElementById('heroBg');
    if (heroBg) {
      heroBg.classList.toggle('lang-dv', lang === 'dv');
    }

    /* 3. Page title */
    document.title = TITLES[lang] || TITLES.en;

    /* 4. Language button ARIA + active class */
    var btnEn = document.getElementById('btn-en');
    var btnDv = document.getElementById('btn-dv');
    if (btnEn) {
      btnEn.classList.toggle('active',       lang === 'en');
      btnEn.setAttribute('aria-pressed',    String(lang === 'en'));
    }
    if (btnDv) {
      btnDv.classList.toggle('active',       lang === 'dv');
      btnDv.setAttribute('aria-pressed',    String(lang === 'dv'));
    }

    /* 5. Save to localStorage */
    try { localStorage.setItem('ebm-lang', lang); } catch (_) {}

    /* 6. Trigger scroll-reveal on newly visible elements */
    syncReveal();
  }

  /* ── Scroll-reveal ───────────────────────────────────────────────────── */
  function syncReveal() {
    var reveals = document.querySelectorAll('.reveal');
    for (var i = 0; i < reveals.length; i++) {
      var rect = reveals[i].getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        reveals[i].classList.add('visible');
      }
    }
  }

  /* ── IntersectionObserver for scroll-reveal ──────────────────────────── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      /* Fallback: show everything */
      var all = document.querySelectorAll('.reveal');
      for (var i = 0; i < all.length; i++) {
        all[i].classList.add('visible');
      }
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('visible');
          obs.unobserve(entries[j].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    var targets = document.querySelectorAll('.reveal');
    for (var k = 0; k < targets.length; k++) {
      obs.observe(targets[k]);
    }
  }

  /* ── Navbar scroll shadow ────────────────────────────────────────────── */
  function initNavScroll() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav toggle ───────────────────────────────────────────────── */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close when a link is tapped */
    var anchors = links.querySelectorAll('a');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ── Language button event listeners ────────────────────────────────── */
  function initLangButtons() {
    var btnEn = document.getElementById('btn-en');
    var btnDv = document.getElementById('btn-dv');

    if (btnEn) btnEn.addEventListener('click', function () { setLang('en'); });
    if (btnDv) btnDv.addEventListener('click', function () { setLang('dv'); });
  }

  /* ── DOMContentLoaded bootstrap ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    /* Restore saved language (inline <head> script already set attributes,
       but we still need to wire up buttons, aria, title, etc.) */
    var saved = 'en';
    try { saved = localStorage.getItem('ebm-lang') || 'en'; } catch (_) {}

    /* Full setLang call wires everything up properly */
    setLang(saved);

    /* Init other modules */
    initReveal();
    initNavScroll();
    initMobileNav();
    initLangButtons();
  });

  /* ── Expose setLang globally (for any inline onclick if needed) ───────── */
  window.setLang = setLang;

})();
