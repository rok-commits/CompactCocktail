/* Tap-ready wizard — decision flow from the dispensing-system PDF
   (Lackó). One question at a time; every path ends in a contact form
   pre-filled with the answer trail so the team knows what to prep. */

/* Hero flavour switcher — same interaction/animation as the B2C hero
   (.hero-stage/.hero-keg/.hero-garnish etc. are shared via home.css),
   showing 12L trade kegs instead of 5L retail ones. Panel stays on-brand
   blue rather than flavour-tinted like B2C, since B2B is blue throughout.
   TODO: add Paloma + Mango Mule once poly-keg photos exist for them. */
(function () {
  var ROOT = window.CC_ROOT || '';
  var stage = document.querySelector('.ot-hero .hero-stage');
  if (!stage) return;
  var kegImg  = stage.querySelector('.hero-keg');
  var garnish = stage.querySelector('.hero-garnish');
  var fname   = stage.querySelector('.hero-flavour-name');
  var cursor  = stage.querySelector('.hero-cursor');
  var dotsBox = document.querySelector('.ot-hero .hero-dots');

  var FLAVOURS = [
    { id: 'mojito',   name: 'Mojito' },
    { id: 'pornstar', name: 'Pornstar Martini' },
    { id: 'spritz',   name: 'Spritz' }
  ];

  var current = 0, timer;
  FLAVOURS.forEach(function (f, i) {
    var b = document.createElement('button');
    b.className = 'hero-dot' + (i === 0 ? ' active' : '');
    b.setAttribute('aria-label', f.name);
    b.addEventListener('click', function () { show(i); restart(); });
    dotsBox.appendChild(b);
  });
  var dots = [].slice.call(dotsBox.children);

  function show(i) {
    current = i;
    var f = FLAVOURS[i];
    stage.classList.remove('entering');
    stage.classList.add('switching');
    setTimeout(function () {
      kegImg.src  = ROOT + 'assets/poly-' + f.id + '.png';
      garnish.src = ROOT + 'assets/garnish-' + f.id + '.png';
      fname.textContent = f.name;
      stage.classList.remove('switching');
      stage.classList.add('entering');
      setTimeout(function () { stage.classList.remove('entering'); }, 520);
    }, 380);
    dots.forEach(function (d, j) { d.classList.toggle('active', j === i); });
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { show((current + 1) % FLAVOURS.length); }, 4200);
  }
  restart();
  stage.addEventListener('mouseenter', function () { clearInterval(timer); });
  stage.addEventListener('mouseleave', restart);

  if (matchMedia('(pointer:fine)').matches) {
    stage.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      cursor.classList.add('on');
    });
    stage.addEventListener('mouseleave', function () { cursor.classList.remove('on'); });
  }
  stage.addEventListener('click', function () { show((current + 1) % FLAVOURS.length); restart(); });

  var tx = 0, ty = 0;
  stage.addEventListener('touchstart', function (e) {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      var n = FLAVOURS.length;
      show(dx < 0 ? (current + 1) % n : (current - 1 + n) % n);
      restart();
    }
  }, { passive: true });
})();

/* Trusted ticker — same moving banner as B2C.
   TODO: Sirály Bár has no logo yet (too new, no official mark). */
(function () {
  var ROOT = window.CC_ROOT || '';
  /* grayscale logos, same rule as VENUES in home.js: square:true = a
     circular/near-square badge, sized taller than the wordmark logos.
     size:{h,w} = explicit per-logo override (client: rebalance pass) —
     same values as home.js for any logo shared between both pages, so
     the two tickers stay visually consistent. */
  var OT_VENUES = [
    { name: 'Sirály Bár',        logo: null },
    { name: 'Voilá',             logo: ROOT + 'assets/venue-logos/voila-gray.png' },
    { name: 'Fehér Nyúl',        logo: ROOT + 'assets/venue-logos/fehernyul-gray.png', square: true },
    { name: 'Time Out Market',   logo: ROOT + 'assets/venue-logos/time-out-market-gray.png' },
    { name: 'Spíler Biergarten', logo: ROOT + 'assets/venue-logos/spiler-biergarten-gray.png' },
    { name: 'Pántlika',          logo: ROOT + 'assets/venue-logos/pantlika-gray.png', size: { h: 66, w: 110 } },
    { name: 'Utazó Bár',         logo: ROOT + 'assets/venue-logos/utazo-bar-gray.png', size: { h: 66, w: 388 } },
    { name: 'Vak Varjú',         logo: ROOT + 'assets/venue-logos/vak-varju-gray.png', size: { h: 66, w: 137 } },
    { name: 'ÉS Bisztró',        logo: ROOT + 'assets/venue-logos/es-bisztro-gray.png', square: true },
    { name: 'Accor',             logo: ROOT + 'assets/venue-logos/accor-gray.svg' }
  ];
  var track = document.querySelector('.ticker-track');
  if (!track) return;
  function item(v) {
    var sizeStyle = v.size ? ' style="height:' + v.size.h + 'px;width:' + v.size.w + 'px"' : '';
    return '<span class="tk" title="' + v.name + '">' +
      (v.logo ? '<img class="tk-logo' + (v.square ? ' tk-logo-square' : '') + '" src="' + v.logo + '" alt="' + v.name + '"' + sizeStyle + '>'
              // no logo yet — show the venue name as type instead of a vague initials icon
              : '<span class="tk-logo-type">' + v.name + '</span>') +
      '</span>';
  }
  var set = OT_VENUES.map(item).join('');
  track.innerHTML = set + set; // duplicate for the seamless loop
})();

(function () {
  var ROOT = window.CC_ROOT || '';
  var LANG = window.CC_LANG || 'en';
  var t = function (x) { return typeof x === 'string' ? x : x[LANG]; };

  /* wizard chrome strings, per language */
  var W = LANG === 'hu' ? {
    question: 'kérdés', result: 'Az eredményed', trail: 'A szetted — ',
    yes: 'Igen', no: 'Nem', back: '&larr; Vissza', restart: '&#8635; Újrakezdem',
    venue: 'Hely vagy rendezvény', email: 'te@hely.hu', phone: 'Telefon (nem kötelező)',
    msg: 'Bármi, amit tudnunk érdemes? (nem kötelező)',
    privacy: 'Elfogadom az <a href="#" target="_blank" rel="noopener">adatvédelmi tájékoztatót</a>.',
    sent: 'Köszönjük — egy napon belül jelentkezünk.', qword: function (n) { return n + '. kérdés'; }
  } : {
    question: 'question', result: 'Your result', trail: 'Your setup — ',
    yes: 'Yes', no: 'No', back: '&larr; Back', restart: '&#8635; Start over',
    venue: 'Venue or event', email: 'you@venue.hu', phone: 'Phone (optional)',
    msg: 'Anything we should know? (optional)',
    privacy: 'I agree to the <a href="#" target="_blank" rel="noopener">privacy policy</a>.',
    sent: 'Thanks — we’ll be in touch within a day.', qword: function (n) { return 'Question ' + n; }
  };

  /* `sketch` = fallback text for any step whose illustration isn't in yet.
     Steps with an image ready are listed in WIZARD_IMG below (assets/wizard-<id>.png);
     the "coupler" outcome reuses q3's illustration — same F/M coupler pair, which already
     shows the "one attached, one still needed" idea the outcome text is making. */
  var WIZARD_IMG = { q1: 1, q2: 1, q3: 1, q4: 1, ready: 1, tap: 1, install: 1, coupler: 1 };
  var WIZARD_IMG_SRC = { coupler: 'wizard-q3.png' };
  function wizardImgSrc(id) { return WIZARD_IMG_SRC[id] || ('wizard-' + id + '.png'); }
  var QUESTIONS = {
    q1: { label: { en: 'built-in system', hu: 'beépített rendszer' },
          text: { en: 'Does your venue have a built-in dispensing system?', hu: 'Van beépített sörcsaprendszer a helyeden?' },
          sketch: 'Bar counter with a built-in tap tower on top and a keg on the CO₂ line below', yes: 'q2', no: 'q4' },
    q2: { label: { en: 'free line', hu: 'szabad vonal' },
          text: { en: 'Is there a free line to connect the keg?', hu: 'Van szabad vonal, amire a hordó csatlakozhat?' },
          sketch: 'Under-counter draft lines, one spare line free with an open connector', yes: 'q3', no: 'q4' },
    q3: { label: { en: 'coupler', hu: 'csatlakozófej' },
          text: { en: 'Do you have the right coupler on hand?', hu: 'Van megfelelő csatlakozófej (coupler) kéznél?' },
          hint: { en: '12L keg → “F” KeyKEG coupler · 30L keg → “M” coupler', hu: '12 literes hordó → „F” KeyKEG fej · 30 literes → „M” fej' },
          sketch: '“F” and “M” KeyKEG couplers side by side, one clicking onto a keg neck', yes: 'ready', no: 'coupler' },
    q4: { label: { en: 'counter space', hu: 'hely a pultnál' },
          text: { en: 'Is there counter space (top & bottom) for a built-in system?', hu: 'Van hely a pulton és alatta egy beépített rendszernek?' },
          sketch: 'Bar counter in side view with room above the top and cabinet space below', yes: 'install', no: 'tap' }
  };

  var OUTCOMES = {
    ready: {
      title: { en: 'You’re tap-ready.', hu: 'Csapra készen állsz.' },
      text: { en: 'Your setup pours as-is. Leave your details and we’ll confirm the coupler size and ship your first kegs.',
              hu: 'A rendszered azonnal csapol. Add meg az elérhetőséged, egyeztetjük a csatlakozó méretét, és küldjük az első hordókat.' },
      cta: { en: 'Send — we’ll get in touch →', hu: 'Küldés — jelentkezünk →' }
    },
    coupler: {
      title: { en: 'One small part missing.', hu: 'Egy apró alkatrész hiányzik.' },
      text: { en: 'You just need the right coupler — 12L takes an “F” KeyKEG head, 30L an “M”. Leave your details and we’ll sort it out with your first order, through our partners.',
              hu: 'Csak a megfelelő csatlakozófej kell — a 12 literes „F”, a 30 literes „M” KeyKEG fejet kér. Add meg az elérhetőséged, és az első rendeléssel megoldjuk, partnereinken keresztül.' },
      cta: { en: 'Send — we’ll sort the coupler →', hu: 'Küldés — intézzük a csatlakozót →' }
    },
    install: {
      title: { en: 'You’ve got the room to choose.', hu: 'Van hely — válogathatsz.' },
      text: { en: 'A mobile tap or a full built-in system could both work here — worth a quick chat, including purchase, rental, or installment options. Leave your details and we’ll walk through it together.',
              hu: 'Nálatok mobil csapoló és egy teljes beépített rendszer is szóba jöhet — érdemes átbeszélni, vásárlással, bérléssel vagy részletfizetéssel is. Add meg az elérhetőséged, és átnézzük együtt.' },
      cta: { en: 'Send — let’s talk options →', hu: 'Küldés — beszéljük át az opciókat →' }
    },
    tap: {
      title: { en: 'No counter space? A mobile tap works too.', hu: 'Nincs hely a pultnál? A mobil csapoló is megoldás.' },
      text: { en: 'A mobile tap unit needs no built-in install — available to purchase, rent, or pay off in installments. Leave your details and we’ll sort out the right setup through our partners.',
              hu: 'A mobil csapoló beépítés nélkül is működik — vásárolható, bérelhető, vagy részletre is elérhető. Add meg az elérhetőséged, és partnereinken keresztül összerakjuk a megfelelő szettet.' },
      cta: { en: 'Send — we’ll get in touch →', hu: 'Küldés — jelentkezünk →' }
    }
  };

  var wizard = document.getElementById('wizard');
  if (!wizard) return;

  var trail = []; // [{q, answer}]

  function askedCount() { return trail.length + 1; }

  function renderQuestion(id) {
    var q = QUESTIONS[id];
    wizard.innerHTML =
      '<div class="ot-wcard">' +
        (WIZARD_IMG[id] ? '<div class="ot-wsketch ot-wsketch-img"><img src="' + ROOT + 'assets/' + wizardImgSrc(id) + '" alt=""></div>' :
         q.sketch ? '<div class="ot-wsketch">Sketch: ' + q.sketch + '</div>' : '') +
        '<p class="ot-wstep">' + W.qword(askedCount()) + '</p>' +
        '<h3 class="ot-wq">' + t(q.text) + '</h3>' +
        (q.hint ? '<p class="ot-whint">' + t(q.hint) + '</p>' : '') +
        '<div class="ot-wbtns">' +
          '<button class="btn btn-primary" data-a="yes">' + W.yes + '</button>' +
          '<button class="btn ot-btn-outline" data-a="no">' + W.no + '</button>' +
        '</div>' +
        (trail.length ? '<button class="ot-wback" data-back>' + W.back + '</button>' : '') +
      '</div>';

    wizard.querySelectorAll('[data-a]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = btn.getAttribute('data-a');
        trail.push({ q: id, answer: a });
        var next = q[a];
        if (QUESTIONS[next]) renderQuestion(next); else renderOutcome(next);
      });
    });
    var back = wizard.querySelector('[data-back]');
    if (back) back.addEventListener('click', function () {
      var last = trail.pop();
      renderQuestion(last.q);
    });
  }

  function trailText() {
    return trail.map(function (step) {
      var a = step.answer === 'yes' ? W.yes.toLowerCase() : W.no.toLowerCase();
      return t(QUESTIONS[step.q].label) + ': ' + a;
    }).join(' · ');
  }

  function renderOutcome(id) {
    var o = OUTCOMES[id];
    wizard.innerHTML =
      '<div class="ot-wcard ot-wcard-outcome">' +
        (WIZARD_IMG[id] ? '<div class="ot-wsketch ot-wsketch-img"><img src="' + ROOT + 'assets/' + wizardImgSrc(id) + '" alt=""></div>' : '') +
        '<p class="ot-wstep">' + W.result + '</p>' +
        '<h3 class="ot-wq">' + t(o.title) + '</h3>' +
        '<p class="ot-wtext">' + t(o.text) + '</p>' +
        '<p class="ot-wtrail">' + W.trail + trailText() + '</p>' +
        '<form class="ot-wform">' +
          '<input type="text" name="venue" placeholder="' + W.venue + '" aria-label="' + W.venue + '" required>' +
          '<div class="ot-form-row">' +
            '<input type="email" name="email" placeholder="' + W.email + '" aria-label="Email" required>' +
            '<input type="tel" name="phone" placeholder="' + W.phone + '" aria-label="Phone">' +
          '</div>' +
          '<textarea name="message" rows="3" placeholder="' + W.msg + '" aria-label="Message"></textarea>' +
          '<input type="hidden" name="setup" value="' + id + ' | ' + trailText() + '">' +
          '<label class="cc-check"><input type="checkbox" name="privacy" required><span>' + W.privacy + '</span></label>' +
          '<button class="btn btn-primary" type="submit">' + t(o.cta) + '</button>' +
        '</form>' +
        '<p class="ot-wsent" hidden>' + W.sent + '</p>' +
        '<button class="ot-wback" data-restart>' + W.restart + '</button>' +
      '</div>';

    wizard.querySelector('.ot-wform').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      ccSubmitForm(e.target).then(function () {
        e.target.hidden = true;
        wizard.querySelector('.ot-wsent').hidden = false;
        markContactGiven();
      });
    });
    wizard.querySelector('[data-restart]').addEventListener('click', function () {
      trail = [];
      renderQuestion('q1');
    });
  }

  // once a visitor has left their details through the wizard, the separate
  // "get in touch" form below is redundant for the rest of this session.
  function markContactGiven() {
    try { sessionStorage.setItem('cc_contact_given', '1'); } catch (e) {}
    hideContactSection();
  }

  function hideContactSection() {
    var contact = document.getElementById('contact');
    if (contact) contact.hidden = true;
  }

  var alreadyGiven = false;
  try { alreadyGiven = sessionStorage.getItem('cc_contact_given') === '1'; } catch (e) {}
  if (alreadyGiven) hideContactSection();

  renderQuestion('q1');
})();

/* B2B→B2C landing nudge (client, Jul 13) — if someone lands on the trade
   page by accident, offer the home shop. Once per session, and only after the
   age gate is cleared so two modals never stack. Photo is a placeholder. */
(function () {
  var ROOT = window.CC_ROOT || '';
  var LANG = window.CC_LANG || 'en';
  var SEEN = 'cc_b2b_nudge';
  var ageOk = false, seen = false;
  try { ageOk = localStorage.getItem('cc_age_ok') === '1'; } catch (e) {}
  try { seen = sessionStorage.getItem(SEEN) === '1'; } catch (e) {}
  if (seen || !ageOk) return;            // hold until age-verified; shows next load
  try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}

  var C = LANG === 'hu' ? {
    h: 'Erre az üzleti oldalunkra érkeztél.',
    p: 'Itt rendelnek bárok, hotelek és rendezvények Compact Cocktailt csapra. Folytasd itt, ha ez te vagy &mdash; vagy nézd meg az otthonra szánt partihordóinkat.',
    go: 'Irány a partihordók&nbsp;&rarr;', stay: 'Maradok az üzleti oldalon'
  } : {
    h: 'You&rsquo;ve landed on our business page.',
    p: 'This is where bars, hotels and events order Compact Cocktail on tap. Continue here if that&rsquo;s you &mdash; or shop party kegs for home instead.',
    go: 'Shop home kegs&nbsp;&rarr;', stay: 'Stay on the business page'
  };

  setTimeout(function () {
    ccModal({
      html:
        '<button class="cc-modal-x" data-close aria-label="Close">&times;</button>' +
        '<div class="cc-modal-photo"><img src="' + ROOT + 'assets/b2c-enjoy.jpg" alt=""></div>' +
        '<h3>' + C.h + '</h3>' +
        '<p class="cc-modal-sub">' + C.p + '</p>' +
        '<div class="cc-modal-btns">' +
          '<button class="btn btn-primary" data-close>' + C.stay + '</button>' +
          '<a class="btn cc-btn-outline" href="index.html">' + C.go + '</a>' +
        '</div>'
    });
  }, 700);
})();

/* FAQ accordion — the open/close animation is pure CSS now (grid-rows
   tween on .ot-faq-a in ontap.css); native <details> toggling just works. */

/* contact form — submits via ccSubmitForm (shared.js), backend TODO */
(function () {
  var form = document.querySelector('.ot-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    ccSubmitForm(form).then(function () {
      form.hidden = true;
      document.querySelector('.ot-sent').hidden = false;
    });
  });
})();
