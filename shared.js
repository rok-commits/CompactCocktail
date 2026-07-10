/* Shared behaviours for both pages — load at the end of <body>, before
   the page script. Age gate, generic modal (window.ccModal), mobile
   hamburger nav, nav scroll-spy. */

(function () {
  /* pages under /en/ reference assets one level up */
  var ROOT = /\/en\//.test(location.pathname) ? '../' : '';

  /* ---------- generic modal ----------
     ccModal({ html, dismissable=true, opaque=false, onClose })
     → backdrop element with .close(); [data-close] children close it. */
  window.ccModal = function (opts) {
    var back = document.createElement('div');
    back.className = 'cc-modal-backdrop' + (opts.opaque ? ' cc-backdrop-opaque' : '');
    back.innerHTML = '<div class="cc-modal" role="dialog" aria-modal="true">' + opts.html + '</div>';
    document.body.appendChild(back);
    document.body.classList.add('cc-noscroll');

    function close() {
      document.removeEventListener('keydown', onKey);
      back.classList.remove('on');
      setTimeout(function () {
        back.remove();
        if (!document.querySelector('.cc-modal-backdrop')) document.body.classList.remove('cc-noscroll');
      }, 260);
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === 'Escape' && opts.dismissable !== false) close(); }

    document.addEventListener('keydown', onKey);
    back.addEventListener('click', function (e) {
      if (e.target === back && opts.dismissable !== false) close();
    });
    back.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    /* double rAF so the entry transition runs */
    requestAnimationFrame(function () { requestAnimationFrame(function () { back.classList.add('on'); }); });
    back.close = close;
    return back;
  };

  /* ---------- form submission stub ----------
     TODO: wire to the real backend (Formspree / Mailchimp / own endpoint —
     decision pending with András). Swap the body of this ONE function and
     every form on the site (newsletter, B2B contact, tap-ready wizard)
     submits for real. */
  window.ccSubmitForm = function (form) {
    var data = { _page: location.pathname };
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    console.info('[CoCo] form submission (backend TODO):', data);
    return Promise.resolve({ ok: true });
  };

  /* ---------- 18+ age gate ---------- */
  var AGE_KEY = 'cc_age_ok';
  var ageOk = false;
  try { ageOk = localStorage.getItem(AGE_KEY) === '1'; } catch (e) {}
  if (!ageOk) {
    var gate = ccModal({
      dismissable: false,
      opaque: true,
      html:
        '<img class="cc-gate-logo" src="' + ROOT + 'assets/logo-orange.svg" alt="Compact Cocktail">' +
        '<h3>Are you 18 or older?</h3>' +
        '<p class="cc-modal-sub">You must be of legal drinking age to enter this site.</p>' +
        '<div class="cc-modal-btns">' +
          '<button class="btn btn-primary" data-yes>Yes, I’m 18+</button>' +
          '<button class="btn cc-btn-outline" data-no>Not yet</button>' +
        '</div>' +
        '<p class="cc-gate-fine">Please enjoy responsibly.</p>'
    });
    gate.querySelector('[data-yes]').addEventListener('click', function () {
      try { localStorage.setItem(AGE_KEY, '1'); } catch (e) {}
      gate.close();
    });
    gate.querySelector('[data-no]').addEventListener('click', function () {
      gate.querySelector('.cc-modal').innerHTML =
        '<img class="cc-gate-logo" src="' + ROOT + 'assets/logo-orange.svg" alt="Compact Cocktail">' +
        '<h3>See you in a few years.</h3>' +
        '<p class="cc-modal-sub">Come back when you’re 18 &mdash; the kegs will be waiting.</p>' +
        '<p class="cc-gate-fine">Please enjoy responsibly.</p>';
    });
  }

  /* ---------- mobile hamburger ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav-burger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- nav scroll-spy ---------- */
  var spyLinks = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var spySections = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if (spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
  }
})();
