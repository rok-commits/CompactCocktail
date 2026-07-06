/* Tap-ready wizard — decision flow from the dispensing-system PDF
   (Lackó). One question at a time; every path ends in a contact form
   pre-filled with the answer trail so the team knows what to prep. */

(function () {
  var QUESTIONS = {
    q1: { label: 'built-in system', text: 'Does your venue have a built-in dispensing system?', yes: 'q2', no: 'q4' },
    q2: { label: 'free line', text: 'Is there a free line to connect the keg?', yes: 'q3', no: 'q4' },
    q3: { label: 'coupler', text: 'Do you have the right coupler on hand?', hint: '12L keg → “F” KeyKEG coupler · 30L keg → “M” coupler', yes: 'ready', no: 'coupler' },
    q4: { label: 'counter space', text: 'Is there counter space (top & bottom) for a built-in system?', yes: 'tap', no: 'tap' }
  };

  var OUTCOMES = {
    ready: {
      title: 'You’re tap-ready.',
      text: 'Your setup pours as-is. Leave your details and we’ll confirm the coupler size and ship your first kegs.',
      cta: 'Send — we’ll get in touch →'
    },
    coupler: {
      title: 'One small part missing.',
      text: 'You just need the right coupler — 12L takes an “F” KeyKEG head, 30L an “M”. Leave your details and we’ll sort it out with your first order, through our partners.',
      cta: 'Send — we’ll sort the coupler →'
    },
    tap: {
      title: 'No tap? No problem.',
      text: 'Leave your details and we’ll get in touch — a mobile tap solves it, and we’ll sort out the right setup together through our partners.',
      cta: 'Send — we’ll get in touch →'
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
        '<p class="ot-wstep">Question ' + askedCount() + '</p>' +
        '<h3 class="ot-wq">' + q.text + '</h3>' +
        (q.hint ? '<p class="ot-whint">' + q.hint + '</p>' : '') +
        '<div class="ot-wbtns">' +
          '<button class="btn btn-primary" data-a="yes">Yes</button>' +
          '<button class="btn ot-btn-outline" data-a="no">No</button>' +
        '</div>' +
        (trail.length ? '<button class="ot-wback" data-back>&larr; Back</button>' : '') +
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
    return trail.map(function (t) {
      return QUESTIONS[t.q].label + ': ' + t.answer;
    }).join(' · ');
  }

  function renderOutcome(id) {
    var o = OUTCOMES[id];
    wizard.innerHTML =
      '<div class="ot-wcard ot-wcard-outcome">' +
        '<p class="ot-wstep">Your result</p>' +
        '<h3 class="ot-wq">' + o.title + '</h3>' +
        '<p class="ot-wtext">' + o.text + '</p>' +
        '<p class="ot-wtrail">Your setup — ' + trailText() + '</p>' +
        /* TODO: wire submission (incl. the answer trail) to email */
        '<form class="ot-wform">' +
          '<input type="text" name="venue" placeholder="Venue or event" aria-label="Venue or event" required>' +
          '<div class="ot-form-row">' +
            '<input type="email" name="email" placeholder="you@venue.hu" aria-label="Email" required>' +
            '<input type="tel" name="phone" placeholder="Phone (optional)" aria-label="Phone">' +
          '</div>' +
          '<input type="hidden" name="setup" value="' + id + ' | ' + trailText() + '">' +
          '<button class="btn btn-primary" type="submit">' + o.cta + '</button>' +
        '</form>' +
        '<p class="ot-wsent" hidden>Thanks — we’ll be in touch within a day.</p>' +
        '<button class="ot-wback" data-restart>&#8635; Start over</button>' +
      '</div>';

    wizard.querySelector('.ot-wform').addEventListener('submit', function (e) {
      e.preventDefault();
      e.target.hidden = true;
      wizard.querySelector('.ot-wsent').hidden = false;
      markContactGiven();
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
