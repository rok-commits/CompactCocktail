# Occasions — pinned scroll-reveal variant (mobile) — ARCHIVED

Replaced by the horizontal swipe pile on 2026-07-22.
Last live commit with this variant: bd0f2cf (git checkout bd0f2cf -- home.css home.js to restore wholesale).

## home.css — mobile @media (max-width:860px) block, occasions rules

```css
  /* "Take it anywhere" = a pinned, scroll-stepped reveal on mobile.
     The section is made TALL to create scroll room; the full-bleed cork
     card (.wrap) locks into the viewport ("viewfinder") while that room is
     consumed. Each slice of scroll drops one whole polaroid onto the pile
     (bottom→top) via polStack() in home.js — driven off scroll POSITION,
     so it's momentum-proof and replays on the way back up. When the last
     photo lands, the card scrolls away and normal flow resumes.

     The pin is NOT position:sticky. Sticky was fragile against mobile
     viewport dynamics (the svh/vh/innerHeight three-way mismatch + the URL
     bar resizing the viewport mid-scroll), which let the board scroll past
     instead of locking. Instead polStack() toggles .is-pinned/.is-past to
     drive position:fixed directly — guaranteed to fill the viewport on any
     browser. The card is full-bleed 100svh so it genuinely fills the
     screen; the cork bg/shadow live on .wrap so the pinned board sits on a
     steady texture. .occasions is just the (fixed-height) scroll track. */
  .occasions{min-height:0;height:210vh;display:block;padding:0;margin:24px 0 0;
    background:none;box-shadow:none;border-radius:0;position:relative}
  /* heading sits just under the nav; the photo stage (flex:1) then fills
     the rest and centres the pile within it — so the photos ride in the
     upper-middle of the viewport instead of bunching at the bottom (which
     they did when the whole group was centred as one tall unit). */
  .occasions .wrap{height:100svh;max-width:none;
    margin:0;padding:96px 20px 32px;border-radius:0;
    display:flex;flex-direction:column;justify-content:flex-start;
    background-color:#bd9455;
    background-image:
      linear-gradient(160deg,rgba(195,156,92,.55),rgba(120,78,32,.6)),
      url("assets/cork-texture.jpg");
    background-size:cover;background-position:center;
    box-shadow:inset 0 0 100px rgba(64,38,12,.4)}
  /* JS-driven pin: fixed while in range, then parked at the track bottom.
     top:0 → full viewport (nav sits over the top strip, but the copy is
     vertically centred so nothing important is covered). */
  .occasions .wrap.is-pinned{position:fixed;top:0;left:0;right:0;z-index:1}
  .occasions .wrap.is-past{position:absolute;bottom:0;left:0;right:0}
  /* stage is absolutely centred in the whole card, so the pile rides at the
     viewport's vertical middle regardless of how tall the heading is (the
     heading flows in the top padding above it). Nudged up 4% so it reads as
     upper-middle rather than dead-centre. */
  .pol-stage{position:absolute;left:0;right:0;top:46%;transform:translateY(-50%);
    height:min(52vh,420px);margin:0}
  .pol-row{position:relative;height:100%;display:flex;align-items:center;justify-content:center;overflow:visible}
  .pol{position:absolute;top:50%;left:50%;width:240px;max-width:70vw;margin:0;will-change:transform,opacity}
  /* no push-pins in the thrown/stacked mobile layout — the photos land
     on top of one another, so a pin per photo makes no sense here */
  .pol::before{display:none}
  /* subtle scroll-progress line — tells people the reveal is short and has a
     defined end (so they keep scrolling) without implying clickable slides.
     Built + driven by polStack() in home.js; only shown while pinned. */
  .pol-progress{position:absolute;left:50%;bottom:38px;transform:translateX(-50%);
    width:112px;height:3px;border-radius:3px;background:rgba(255,255,255,.26);
    overflow:hidden;opacity:0;transition:opacity .35s ease;pointer-events:none;z-index:2}
  .pol-progress.on{opacity:1}
  .pol-progress > i{display:block;height:100%;width:0;border-radius:3px;
    background:rgba(255,255,255,.92);transition:width .16s ease-out}
```

## home.css — reduced-motion fallback block

```css
/* Reduced-motion fallback for the polaroid reveal: no pin, no scroll-driven
   animation. The section becomes a normal block and the photos lay out as a
   simple centred column, all visible at once. polStack() detects the same
   media query and skips pinning, so nothing fights this layout. */
@media (max-width:860px) and (prefers-reduced-motion:reduce){
  .occasions{height:auto;min-height:0;position:relative}
  .occasions .wrap{position:static !important;height:auto;padding:64px 20px 56px}
  .occasions .wrap.is-pinned,.occasions .wrap.is-past{position:static !important}
  .pol-stage{position:static;transform:none;height:auto;margin-top:28px}
  .pol-row{flex-direction:column;align-items:center;gap:22px;height:auto}
  .pol{position:static !important;transform:none !important;opacity:1 !important;
    width:min(70vw,300px);margin:0}
  .pol-progress{display:none}
}
```

## home.js — polStack() IIFE (incl. header comment)

```js
).forEach(el => { el.classList.add('reveal'); io.observe(el); });

/* ---------- polaroid pile: scroll-stepped stack (mobile layout — see
   .occasions/.pol-stage/.pol in home.css). The section is made tall and
   its cork card (.wrap) is sticky, so the board locks into the viewport
   while the extra scroll room is consumed. We map scroll POSITION within
   the section to how many photos have landed: each slice of scroll drops
   one more polaroid onto the pile (bottom→top), and scrolling back up
   lifts them off again. Driving it off position rather than intercepting
   gestures is what makes it momentum-proof (a fast fling just lands the
   ones it passes), never double-fires, and always replays. Above the
   mobile breakpoint the photos are a static fanned row (CSS) — we strip
   our inline styles so they don't override it. ---------- */
(function polStack() {
  const occ   = document.querySelector('.occasions');
  const stage = document.querySelector('.pol-stage');
  const wrap  = occ && occ.querySelector('.wrap');
  const cards = [...document.querySelectorAll('.pol')];
  if (!occ || !stage || !wrap || !cards.length) return;
  const mq = matchMedia('(max-width:860px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const n = cards.length;

  // subtle scroll-progress line (styled in home.css). Built here so the
  // markup stays out of the two index.html files; its fill tracks reveal
  // progress so the pin reads as short and finite.
  const progress = document.createElement('div');
  progress.className = 'pol-progress';
  const progressFill = document.createElement('i');
  progress.appendChild(progressFill);
  wrap.appendChild(progress);
  const REST = [ // small scatter per card once landed (x/y/r), plus which side it slides in from
    { x: -16, y: 10, r: -6, side: -1 }, { x: 14, y: -6, r: 5, side: 1 }, { x: -10, y: 4, r: -4, side: -1 },
    { x: 12, y: 8, r: 5, side: 1 }, { x: -14, y: -4, r: -5, side: -1 },
  ];
  const DURATION = 520; // ms — one card's landing animation
  const EASE = 'cubic-bezier(.16,1,.3,1)'; // fast start, long slow tail — the "drop, then slide to a stop" feel
  const state = new Array(n).fill(false); // is card i currently landed?
  let pin = '';       // '', 'pinned' or 'past' — current pin phase
  let ticking = false;

  function paint(i, atRest) {
    const rest = REST[i % REST.length];
    const card = cards[i];
    if (atRest) {
      card.style.transform = `translate(calc(-50% + ${rest.x}px), calc(-50% + ${rest.y}px)) rotate(${rest.r}deg) scale(1)`;
      card.style.opacity = '1';
    } else {
      const startX = rest.x + rest.side * 240; // waits off to the side, not below
      const startY = rest.y - 36; // and a little above its resting spot, so it drops as it slides in
      card.style.transform = `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px)) rotate(0deg) scale(.86)`;
      card.style.opacity = '0';
    }
    card.style.zIndex = String(i + 1); // later photos land on top of earlier ones
  }

  function arm() {
    // paint all cards to their hidden/off-stage start with no transition,
    // then flush and re-enable transitions so the first real landing animates
    cards.forEach((card, i) => { card.style.transition = 'none'; paint(i, false); state[i] = false; });
    void stage.offsetWidth;
    cards.forEach(card => { card.style.transition = `transform ${DURATION}ms ${EASE}, opacity ${Math.round(DURATION * 0.5)}ms ease-out`; });
  }

  function clear() {
    // above the breakpoint (and under reduced-motion) .pol-row is a static
    // layout — leftover inline styles would override it, so strip them
    cards.forEach((card, i) => { card.style.transition = ''; card.style.transform = ''; card.style.opacity = ''; card.style.zIndex = ''; state[i] = false; });
    setPin('');                       // drop the fixed-pin classes
    progress.classList.remove('on');  // hide the progress line
  }

  // Drive the pin via position:fixed rather than position:sticky — sticky
  // was unreliable against mobile viewport dynamics; toggling these classes
  // guarantees the board fills the viewport for the whole pinned range.
  function setPin(phase) {
    if (phase === pin) return;
    wrap.classList.toggle('is-pinned', phase === 'pinned');
    wrap.classList.toggle('is-past',   phase === 'past');
    pin = phase;
  }

  // The scroll window over which the board is pinned. secTop is where the
  // card's top reaches the viewport top (pin begins); once the remaining
  // track (section height − one card height) is consumed the card parks at
  // the section bottom (pin ends). Progress across that window drives how
  // many photos have landed: n+1 even zones, so photo i lands at i/(n+1).
  function geom() {
    const secTop = occ.getBoundingClientRect().top + window.scrollY;
    const pinStart = secTop;
    const pinEnd = secTop + occ.offsetHeight - wrap.offsetHeight;
    return { pinStart, pinEnd };
  }

  function update() {
    ticking = false;
    if (!mq.matches) return;
    const { pinStart, pinEnd } = geom();
    const y = window.scrollY;
    let p;
    if (y < pinStart)      { setPin('');       p = 0; }
    else if (y < pinEnd)   { setPin('pinned'); p = (y - pinStart) / (pinEnd - pinStart); }
    else                   { setPin('past');   p = 1; }
    const cp = Math.max(0, Math.min(1, p));
    const target = Math.max(0, Math.min(n, Math.floor(cp * (n + 1))));
    for (let i = 0; i < n; i++) {
      const shouldRest = i < target;
      if (shouldRest !== state[i]) { paint(i, shouldRest); state[i] = shouldRest; }
    }
    // progress line: visible only while the board is engaged (pinned / just
    // past), fill tracks how far through the reveal we are
    progress.classList.toggle('on', pin !== '');
    progressFill.style.width = (cp * 100) + '%';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function setup() {
    // reduced-motion or desktop → static layout (see home.css), no pinning
    if (mq.matches && !reduce.matches) { arm(); update(); }
    else clear();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setup, { passive: true });
  mq.addEventListener('change', setup);
  reduce.addEventListener('change', setup);
  setup();
})();
```
