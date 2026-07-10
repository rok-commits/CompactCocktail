/* Tap-ready wizard — decision flow from the dispensing-system PDF
   (Lackó). One question at a time; every path ends in a contact form
   pre-filled with the answer trail so the team knows what to prep. */

/* Trusted ticker — same moving banner as B2C. TODO: real venue logos
   (set logo per venue) once collected; initials chips until then. */
(function () {
  var OT_VENUES = [
    { name: 'Sirály Bár',      logo: null },
    { name: 'Kempinski',       logo: null },
    { name: 'Voilá',           logo: null },
    { name: 'Fehér Nyúl',      logo: null },
    { name: 'Whisky Show',     logo: null },
    { name: 'Time Out Market', logo: null }
  ];
  var track = document.querySelector('.ticker-track');
  if (!track) return;
  function initials(n) {
    return n.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
  }
  function item(v) {
    return '<span class="tk">' +
      (v.logo ? '<img class="tk-logo" src="' + v.logo + '" alt="">'
              : '<i class="tk-logo">' + initials(v.name) + '</i>') +
      v.name + '</span>';
  }
  var set = OT_VENUES.map(item).join('');
  track.innerHTML = set + set; // duplicate for the seamless loop
})();

(function () {
  var LANG = window.CC_LANG || 'en';
  var t = function (x) { return typeof x === 'string' ? x : x[LANG]; };

  /* wizard chrome strings, per language */
  var W = LANG === 'hu' ? {
    question: 'kérdés', result: 'Az eredményed', trail: 'A szetted — ',
    yes: 'Igen', no: 'Nem', back: '&larr; Vissza', restart: '&#8635; Újrakezdem',
    venue: 'Hely vagy rendezvény', email: 'te@hely.hu', phone: 'Telefon (nem kötelező)',
    msg: 'Bármi, amit tudnunk érdemes? (nem kötelező)',
    sent: 'Köszönjük — egy napon belül jelentkezünk.', qword: function (n) { return n + '. kérdés'; }
  } : {
    question: 'question', result: 'Your result', trail: 'Your setup — ',
    yes: 'Yes', no: 'No', back: '&larr; Back', restart: '&#8635; Start over',
    venue: 'Venue or event', email: 'you@venue.hu', phone: 'Phone (optional)',
    msg: 'Anything we should know? (optional)',
    sent: 'Thanks — we’ll be in touch within a day.', qword: function (n) { return 'Question ' + n; }
  };

  var QUESTIONS = {
    q1: { label: { en: 'built-in system', hu: 'beépített rendszer' },
          text: { en: 'Does your venue have a built-in dispensing system?', hu: 'Van beépített sörcsaprendszer a helyeden?' }, yes: 'q2', no: 'q4' },
    q2: { label: { en: 'free line', hu: 'szabad vonal' },
          text: { en: 'Is there a free line to connect the keg?', hu: 'Van szabad vonal, amire a hordó csatlakozhat?' }, yes: 'q3', no: 'q4' },
    q3: { label: { en: 'coupler', hu: 'csatlakozófej' },
          text: { en: 'Do you have the right coupler on hand?', hu: 'Van megfelelő csatlakozófej (coupler) kéznél?' },
          hint: { en: '12L keg → “F” KeyKEG coupler · 30L keg → “M” coupler', hu: '12 literes hordó → „F” KeyKEG fej · 30 literes → „M” fej' }, yes: 'ready', no: 'coupler' },
    q4: { label: { en: 'counter space', hu: 'hely a pultnál' },
          text: { en: 'Is there counter space (top & bottom) for a built-in system?', hu: 'Van hely a pulton és alatta egy beépített rendszernek?' }, yes: 'tap', no: 'tap' }
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
    tap: {
      title: { en: 'No tap? No problem.', hu: 'Nincs csap? Nem gond.' },
      text: { en: 'Leave your details and we’ll get in touch — a mobile tap solves it, and we’ll sort out the right setup together through our partners.',
              hu: 'Add meg az elérhetőséged és jelentkezünk — egy mobil csapoló megoldja, a megfelelő szettet pedig partnereinken keresztül közösen összerakjuk.' },
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
