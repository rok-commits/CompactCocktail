/* B2C v5 — hero flavour switcher + shop cards + story modal + scroll reveal */

const LANG = window.CC_LANG || 'en';   // set by shared.js from <html lang>
const ROOT = window.CC_ROOT || '';     // '../' on /en/ pages

/* TODO: real per-flavour product links once the Fehér Nyúl webshop pages
   are confirmed (set `shop` per flavour; WEBSHOP_URL is the fallback). */
const WEBSHOP_URL = 'https://fehernyul.hu/webshop';
/* in-person pickup — Mr. Alkohol, Budapest (the only pickup point at launch;
   Sirály/Shirai dropped per client, Jul 13). */
const PICKUP_URL = 'https://www.google.com/maps/search/?api=1&query=Mr.+Alkohol+Bajcsy-Zsilinszky+%C3%BAt+Budapest';

/* page strings rendered by JS, per language */
const T = LANG === 'hu' ? {
  buy: 'Megveszem', notify: 'Értesíts', story: 'A sztori',
  sticker: 'Hamarosan', aria: ' — a sztori',
  buyKeg: 'Megveszem ezt a hordót&nbsp;&rarr;', notifyKeg: 'Értesíts, ha megérkezik',
  videoSoon: 'hamarosan mikro-videó',
  shopH: 'Hogyan szeretnéd?',
  shopP: 'Ne ijedj meg — a hordóinkat a partner sörfőzdénk árulja. Online a <b>Fehér Nyúl webshopjában</b> fejezed be a vásárlást, vagy személyesen átveheted a <b>Mr. Alkoholban</b>, Budapesten.',
  shopGo: 'Online vásárlás&nbsp;&rarr;', shopPickup: 'Személyes átvétel&nbsp;&rarr;', shopStay: 'Maradok',
  leaveH: 'Most elhagyod az oldalunkat',
  leaveP: 'A vásárlásod a <b>Fehér Nyúl</b> webshopjában fejeződik be — megbízható gyártó- és szállító partnerünknél.',
  leaveGo: 'Folytatom a vásárlást&nbsp;&rarr;',
  ing: {
    spritz: 'Aperol, pezsgő, szóda · 8%',
    mojito: 'Planteray rum, lime, friss menta, szóda · 9.5%',
    paloma: 'Tequila, lime, grépfrút, szóda · 9.5%',
    pornstar: 'Vodka, maracuja, vanília, lime · 9.5%',
    mango: 'Vodka, mangópüré, lime, gyömbérsör · 9.5%',
  }
} : {
  buy: 'Buy', notify: 'Notify me', story: 'The story',
  sticker: 'Coming soon', aria: ' — the story',
  buyKeg: 'Buy this keg&nbsp;&rarr;', notifyKeg: 'Notify me when it lands',
  videoSoon: 'micro-video coming soon',
  shopH: 'How would you like it?',
  shopP: 'Don’t be alarmed — our kegs are sold through our partner brewery. Finish online on the <b>Fehér Nyúl webshop</b>, or pick one up in person at <b>Mr. Alkohol</b> in Budapest.',
  shopGo: 'Shop online&nbsp;&rarr;', shopPickup: 'Pick up in person&nbsp;&rarr;', shopStay: 'Stay here',
  leaveH: 'You’re now leaving our site',
  leaveP: 'Your order finishes on <b>Fehér Nyúl</b>’s webshop — our trusted brewing &amp; delivery partner.',
  leaveGo: 'Continue shopping&nbsp;&rarr;',
  ing: {
    spritz: 'Aperol, sparkling wine, soda · 8%',
    mojito: 'Planteray rum, lime, fresh mint, soda · 9.5%',
    paloma: 'Tequila, lime, grapefruit, soda · 9.5%',
    pornstar: 'Vodka, passion fruit, vanilla, lime · 9.5%',
    mango: 'Vodka, mango purée, lime, ginger beer · 9.5%',
  }
};

/* `available:false` = not in the webshop at launch → "coming soon" sticker
   + Notify me instead of Buy. Launch list (client, Jul 13): Mojito, Paloma,
   Pornstar Martini live; Spritz + Mango Mule coming soon, grouped at the end.
   `story`/`video` feed the click-popup — placeholder copy until László's
   flavour infopack arrives (video: {src, poster, subs} once filmed). */
const FLAVOURS = [
  { id: 'mojito',   name: 'Mojito',           colorVar: '--fl-mojito',
    available: true, video: null, story: {
      en: 'Havana’s gift to hot afternoons — and Hemingway’s standing order. Planteray rum, fresh mint and lime, exactly as a bartender would build it.',
      hu: 'Havanna ajándéka a forró délutánokra — és Hemingway állandó rendelése. Planteray rum, friss menta és lime, pontosan úgy, ahogy egy bártender készítené.' } },
  { id: 'paloma',   name: 'Paloma',           colorVar: '--fl-paloma',
    available: true, video: null, story: {
      en: 'Mexico’s true favourite tequila drink — not the margarita. Grapefruit, lime and a clean tequila bite, made for long tables in the sun.',
      hu: 'Mexikó igazi kedvenc tequilás itala — nem a margarita. Grépfrút, lime és tiszta tequila, hosszú, napsütötte asztalokhoz.' } },
  { id: 'pornstar', name: 'Pornstar Martini', colorVar: '--fl-pornstar',
    available: true, video: null, story: {
      en: 'London, 2002: a cheeky name on a seriously good drink. Passion fruit, vanilla and vodka — the party cocktail that never left the charts.',
      hu: 'London, 2002: pimasz név egy komolyan jó italon. Maracuja, vanília és vodka — a partikoktél, ami sosem esett ki a slágerlistáról.' } },
  { id: 'spritz',   name: 'Spritz',           colorVar: '--fl-spritz',
    available: false, video: null, story: {
      en: 'Born on Venetian canals as the aperitivo of choice, ours is built on real Aperol and proper sparkling wine. Bitter, bubbly, unbothered.',
      hu: 'A velencei csatornák aperitivója, igazi Aperolból és rendes pezsgőből építve. Keserű, buborékos, laza.' } },
  { id: 'mango',    name: 'Mango Mule',       colorVar: '--fl-mango',
    available: false, video: null, story: {
      en: 'The Moscow Mule took a detour through the tropics. Mango purée, sharp lime and spicy ginger beer — our own twist on a copper-mug classic.',
      hu: 'A Moscow Mule kitérőt tett a trópusokon. Mangópüré, éles lime és csípős gyömbérsör — saját csavarunk egy rézbögrés klasszikuson.' } },
];
FLAVOURS.forEach(f => { f.ing = T.ing[f.id]; });

const css = getComputedStyle(document.documentElement);
const colorOf = f => css.getPropertyValue(f.colorVar).trim();
const darkOf  = f => css.getPropertyValue(f.colorVar + '-dark').trim();

/* ---------- hero switcher ---------- */
const panel   = document.querySelector('.hero-panel');
const pattern = document.querySelector('.hero-pattern');
const stage   = document.querySelector('.hero-stage');
const kegImg  = document.querySelector('.hero-keg');
const garnish = document.querySelector('.hero-garnish');
const fname   = document.querySelector('.hero-flavour-name');
const dotsBox = document.querySelector('.hero-dots');

let current = 0, timer;

FLAVOURS.forEach((f, i) => {
  const b = document.createElement('button');
  b.className = 'hero-dot' + (i === 0 ? ' active' : '');
  b.setAttribute('aria-label', f.name);
  b.addEventListener('click', () => { show(i); restart(); });
  dotsBox.appendChild(b);
});
const dots = [...dotsBox.children];

/* ---------- image preloading ----------
   The swap in show() sets src mid-animation; without preloading, the
   incoming keg can still be decoding when the fly-in starts, which reads
   as a stutter on mobile. We DON'T preload all five up front (that's a
   burst of requests on load) — instead we keep the *next* flavour warm,
   so at any moment only ~1 extra keg+garnish is in flight, and every
   swap comes from cache. decode() also gets the bitmap ready off the
   main thread where supported. */
const imgCache = {};
function preload(i) {
  const f = FLAVOURS[(i + FLAVOURS.length) % FLAVOURS.length];
  if (imgCache[f.id]) return;
  imgCache[f.id] = [`keg-full-${f.id}`, `garnish-${f.id}`].map(name => {
    const img = new Image();
    img.src = `${ROOT}assets/${name}.png`;
    if (img.decode) img.decode().catch(() => {});
    return img;
  });
}

/* initial paint — first (available) flavour, no roll animation */
(function initHero() {
  const f = FLAVOURS[0];
  panel.style.background = colorOf(f);
  panel.style.setProperty('--fl-dark', darkOf(f));
  panel.dataset.flavour = f.id;
  kegImg.src  = `${ROOT}assets/keg-full-${f.id}.png`;
  garnish.src = `${ROOT}assets/garnish-${f.id}.png`;
  fname.textContent = f.name;
  preload(0);        // current
  preload(1);        // next one up, ready before the first auto-advance
})();

function show(i) {
  current = i;
  const f = FLAVOURS[i];
  panel.style.background = colorOf(f);
  panel.style.setProperty('--fl-dark', darkOf(f));
  panel.dataset.flavour = f.id;
  pattern.classList.remove('roll');
  void pattern.offsetWidth; // restart the roll animation
  pattern.classList.add('roll');
  stage.classList.remove('entering');
  stage.classList.add('switching');       // keg + garnish fly out
  setTimeout(() => {
    kegImg.src  = `${ROOT}assets/keg-full-${f.id}.png`;
    garnish.src = `${ROOT}assets/garnish-${f.id}.png`;
    fname.textContent = f.name;
    stage.classList.remove('switching');
    stage.classList.add('entering');      // keg + garnish fly back in
    setTimeout(() => stage.classList.remove('entering'), 520);
  }, 380);
  dots.forEach((d, j) => d.classList.toggle('active', j === i));
  preload(i + 1);   // stay one flavour ahead so the *next* swap is instant
}

function restart() {
  clearInterval(timer);
  timer = setInterval(() => show((current + 1) % FLAVOURS.length), 4200);
}
restart();
/* pause-on-hover is scoped to the keg stage, not the whole (viewport-tall)
   panel — binding it to `panel` meant a cursor merely resting anywhere on
   the hero (very likely right after a page load/click) killed the timer
   before it ever fired, so the loop looked like it "never started". */
if (matchMedia('(pointer:fine)').matches) {
  stage.addEventListener('mouseenter', () => clearInterval(timer));
  stage.addEventListener('mouseleave', restart);
}

/* ---------- "next flavour" cursor + click on the keg stage ---------- */
const cursor = document.querySelector('.hero-cursor');
if (matchMedia('(pointer:fine)').matches) {
  stage.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    cursor.classList.add('on');
  });
  stage.addEventListener('mouseleave', () => cursor.classList.remove('on'));
}
stage.addEventListener('click', () => { show((current + 1) % FLAVOURS.length); restart(); });

/* ---------- swipe between flavours on touch ---------- */
let tx = 0, ty = 0;
panel.addEventListener('touchstart', e => {
  tx = e.touches[0].clientX; ty = e.touches[0].clientY;
}, { passive: true });
panel.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    const n = FLAVOURS.length;
    show(dx < 0 ? (current + 1) % n : (current - 1 + n) % n);
    restart();
  }
}, { passive: true });

/* ---------- shop cards ---------- */
const grid = document.querySelector('.shop-grid');
grid.innerHTML = FLAVOURS.map((f, i) => `
  <div class="shop-card${f.available ? '' : ' is-out'}" style="--fl:${colorOf(f)}"
       data-i="${i}" role="button" tabindex="0" aria-label="${f.name}${T.aria}">
    ${f.available ? '' : `<span class="shop-sticker">${T.sticker}</span>`}
    <img src="${ROOT}assets/keg-full-${f.id}.png" alt="${f.name}">
    <h3>${f.name}</h3>
    <p class="ing">${f.ing}</p>
    <button class="btn btn-primary" data-buy="${i}">${f.available ? T.buy : T.notify}</button>
    <span class="shop-more">${T.story}&nbsp;&rarr;</span>
  </div>`).join('');

/* ---------- webshop redirect popup (all purchases finish at Fehér Nyúl) ----------
   `simple: true` = just a "leaving our site" notice with no pickup button —
   used from the delivery/pickup section, which already shows the pickup
   option as its own button right next to this one. */
function shopRedirect(f, { simple } = {}) {
  const url = (f && f.shop) || WEBSHOP_URL;
  ccModal({
    html:
      '<button class="cc-modal-x" data-close aria-label="Close">&times;</button>' +
      `<h3>${simple ? T.leaveH : T.shopH}</h3>` +
      `<p class="cc-modal-sub">${simple ? T.leaveP : T.shopP}</p>` +
      '<div class="cc-modal-btns">' +
        `<a class="btn btn-primary" href="${url}" target="_blank" rel="noopener" data-close>${simple ? T.leaveGo : T.shopGo}</a>` +
        (simple ? '' : `<a class="btn cc-btn-outline" href="${PICKUP_URL}" target="_blank" rel="noopener" data-close>${T.shopPickup}</a>`) +
      '</div>' +
      `<button class="cc-modal-plain" data-close>${T.shopStay}</button>`
  });
}

/* ---------- flavour story popup (content pending László's infopack) ---------- */
function openStory(f) {
  const media = f.video
    ? `<video controls playsinline poster="${f.video.poster || ''}">
         <source src="${f.video.src}">
         ${f.video.subs ? `<track kind="subtitles" src="${f.video.subs}" srclang="${LANG}" default>` : ''}
       </video>`
    : `<img src="${ROOT}assets/keg-full-${f.id}.png" alt="${f.name}">
       <span class="story-soon">${T.videoSoon}</span>`;
  const m = ccModal({
    html:
      '<button class="cc-modal-x" data-close aria-label="Close">&times;</button>' +
      `<div class="story-media" style="background:${colorOf(f)}">${media}</div>` +
      `<h3>${f.name}</h3>` +
      `<p class="cc-modal-sub">${f.story[LANG]}</p>` +
      '<div class="cc-modal-btns">' +
        (f.available
          ? `<button class="btn btn-primary" data-shop>${T.buyKeg}</button>`
          : `<button class="btn btn-primary" data-notify>${T.notifyKeg}</button>`) +
      '</div>'
  });
  const shopBtn = m.querySelector('[data-shop]');
  if (shopBtn) shopBtn.addEventListener('click', () => { m.close(); shopRedirect(f); });
  const notifyBtn = m.querySelector('[data-notify]');
  if (notifyBtn) notifyBtn.addEventListener('click', () => { m.close(); goNewsletter(); });
}

function goNewsletter() {
  const form = document.querySelector('.cta-form');
  if (!form) return;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => form.querySelector('input')?.focus({ preventScroll: true }), 600);
}

grid.addEventListener('click', e => {
  const buy = e.target.closest('[data-buy]');
  if (buy) {
    const f = FLAVOURS[+buy.dataset.buy];
    f.available ? shopRedirect(f) : goNewsletter();
    return;
  }
  const card = e.target.closest('.shop-card');
  if (card) openStory(FLAVOURS[+card.dataset.i]);
});

/* ---------- "Shop online" CTA outside the shop grid (delivery/pickup
   section) — same leaving-site popup as the per-flavour buy buttons,
   no specific flavour so shopRedirect() falls back to WEBSHOP_URL. ---------- */
document.querySelectorAll('[data-shop-cta]').forEach(btn => {
  btn.addEventListener('click', () => shopRedirect(null, { simple: true }));
});
grid.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const card = e.target.closest('.shop-card');
  if (card) openStory(FLAVOURS[+card.dataset.i]);
});

/* ---------- trusted ticker — venue logos, grayscale ----------
   TODO: Flip Mood — no official logo found online (client-confirmed
   real business, but no site/social presence turned up); needs a
   file or link from the client.
   All logos are pre-converted to grayscale (assets/venue-logos/*-gray)
   so the row reads as one uniform system instead of each venue's own
   brand colours. `square: true` = a circular/near-square badge, which
   gets a taller box than the wordmark logos so it stays readable. */
/* size: {h,w} = explicit per-logo override (client: rebalance pass),
   px, computed from each logo's real aspect ratio at ±20% of its tier's
   default height (55px wordmarks / 100px badges) so it renders at
   exactly that height with no letterboxing from the width cap. */
const VENUES = [
  { name: 'Time Out Market',   logo: `${ROOT}assets/venue-logos/time-out-market-gray.png` },
  { name: 'Spíler Biergarten', logo: `${ROOT}assets/venue-logos/spiler-biergarten-gray.png` },
  { name: 'Voilá',             logo: `${ROOT}assets/venue-logos/voila-gray.png` },
  { name: 'Pántlika',          logo: `${ROOT}assets/venue-logos/pantlika-gray.png`, size: { h: 66, w: 110 } },
  { name: 'Gajdó',             logo: `${ROOT}assets/venue-logos/gajdo-gray.png`, square: true, size: { h: 80, w: 91 } },
  { name: 'Accor',             logo: `${ROOT}assets/venue-logos/accor-gray.svg` },
  { name: 'Rajkai',            logo: `${ROOT}assets/venue-logos/rajkai-gray.png`, size: { h: 44, w: 124 } },
  { name: 'Világbéke',         logo: `${ROOT}assets/venue-logos/vilagbeke-gray.png`, square: true },
  { name: 'Utazó Bár',         logo: `${ROOT}assets/venue-logos/utazo-bar-gray.png`, size: { h: 66, w: 388 } },
  { name: 'Patent',            logo: `${ROOT}assets/venue-logos/patent-gray.png`, square: true },
  { name: 'Flip Mood',         logo: null },
  { name: 'Vak Varjú',         logo: `${ROOT}assets/venue-logos/vak-varju-gray.png`, size: { h: 66, w: 137 } },
  { name: 'És Bisztró',        logo: `${ROOT}assets/venue-logos/es-bisztro-gray.png`, square: true },
];

const tickTrack = document.querySelector('.ticker-track');
if (tickTrack) {
  const sizeStyle = v => v.size ? ` style="height:${v.size.h}px;width:${v.size.w}px"` : '';
  const tkItem = v => `<span class="tk" title="${v.name}">` +
    (v.logo ? `<img class="tk-logo${v.square ? ' tk-logo-square' : ''}" src="${v.logo}" alt="${v.name}"${sizeStyle(v)}>`
            // no logo yet — show the venue name as type instead of a vague initials icon
            : `<span class="tk-logo-type">${v.name}</span>`) +
    `</span>`;
  const set = VENUES.map(tkItem).join('');
  tickTrack.innerHTML = set + set; // duplicate for the seamless loop
}

/* ---------- math pattern parallax (brand arch tile drifts on scroll) ---------- */
const mathPattern = document.querySelector('.math-pattern');
const mathSec = document.querySelector('.math');
window.addEventListener('scroll', () => {
  const r = mathSec.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  const progress = (innerHeight - r.top) / (innerHeight + r.height);
  mathPattern.style.transform = `translate(${-progress * 260}px, ${progress * 120}px)`;
}, { passive: true });

/* ---------- how steps: start aligned, separate as you scroll down ---------- */
const howBox   = document.querySelector('.how-steps');
const howSteps = [...howBox.children];
const HOW_OFFSETS = [0, 52, 104]; // matches .how-step-mid / .how-step-last margins

function howSeparate() {
  const r = howBox.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight * 0.9), 0), 1);
  howSteps.forEach((el, i) => {
    el.style.transform = `translateY(${-HOW_OFFSETS[i] * (1 - p)}px)`;
  });
}
window.addEventListener('scroll', howSeparate, { passive: true });
howSeparate();

/* ---------- newsletter form (backend via ccSubmitForm stub) ---------- */
const ctaForm = document.querySelector('.cta-form');
if (ctaForm) ctaForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!ctaForm.reportValidity()) return;
  ccSubmitForm(ctaForm).then(() => {
    ctaForm.hidden = true;
    document.querySelector('.cta-sent').hidden = false;
  });
});

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });

document.querySelectorAll(
  '.shop-card,.bubble,.makers-copy'
).forEach(el => { el.classList.add('reveal'); io.observe(el); });
/* ---------- polaroid collage (mobile): "dropped on the table" auto-reveal
   (layout + drop keyframes in home.css — .occasions/.pol-stage/.pol). No
   gesture: when the section scrolls into view we add .pol-play, and the
   photos fall onto the cork one after another (CSS handles the physics —
   accelerating fall, cushioned contact, slide+rotate settle, no rebound)
   into a scattered two-column collage where every photo stays visible.
   Scrolling the section fully out re-arms it, so the drop replays on the
   next visit. Desktop keeps its static fanned row; prefers-reduced-motion
   shows the finished collage with no animation (CSS gates it, and we never
   add .pol-play). ---------- */
(function polDrop() {
  const occ   = document.querySelector('.occasions');
  const stage = document.querySelector('.pol-stage');
  const cards = [...document.querySelectorAll('.pol')];
  if (!occ || !stage || !cards.length) return;
  const mq = matchMedia('(max-width:860px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false, played = false;

  // "in view enough to play": the stage has entered the lower ~three-
  // quarters of the viewport but hasn't fully scrolled off the top. Latched
  // via `played`, and released once the section scrolls away, so the drop
  // replays (freshly randomised) on the next visit. (A scroll+rect check,
  // not IntersectionObserver, keeps it dependency-free.)
  function inView() {
    const r = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh * 0.8 && r.bottom > vh * 0.2;
  }

  // Randomise each card's delay + fall speed so the pile never lands on a
  // mechanical beat. Delays are a running sum of random gaps (some tight =
  // a pair landing together, some longer = a natural pause); duration
  // varies a touch too. Re-rolled every time the section re-enters view.
  function randomiseTiming() {
    let t = Math.random() * 0.06;
    cards.forEach(card => {
      card.style.animationDelay = t.toFixed(3) + 's';
      card.style.animationDuration = (0.58 + Math.random() * 0.16).toFixed(3) + 's';
      t += 0.1 + Math.random() * 0.36; // 0.10–0.46s gap before the next one
    });
  }
  function clearTiming() {
    cards.forEach(card => { card.style.animationDelay = ''; card.style.animationDuration = ''; });
  }

  function update() {
    ticking = false;
    const active = mq.matches && !reduce.matches;
    if (active && inView()) {
      if (!played) { randomiseTiming(); occ.classList.add('pol-play'); played = true; }
    } else if (played || occ.classList.contains('pol-play')) {
      occ.classList.remove('pol-play'); clearTiming(); played = false;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  mq.addEventListener('change', update);
  reduce.addEventListener('change', update);
  update();
})();
