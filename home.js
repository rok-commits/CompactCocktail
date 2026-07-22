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

/* ---------- webshop redirect popup (all purchases finish at Fehér Nyúl) ---------- */
function shopRedirect(f) {
  const url = (f && f.shop) || WEBSHOP_URL;
  ccModal({
    html:
      '<button class="cc-modal-x" data-close aria-label="Close">&times;</button>' +
      `<h3>${T.shopH}</h3>` +
      `<p class="cc-modal-sub">${T.shopP}</p>` +
      '<div class="cc-modal-btns">' +
        `<a class="btn btn-primary" href="${url}" target="_blank" rel="noopener" data-close>${T.shopGo}</a>` +
        `<a class="btn cc-btn-outline" href="${PICKUP_URL}" target="_blank" rel="noopener" data-close>${T.shopPickup}</a>` +
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
/* ---------- polaroid pile (mobile): a two-column stack you build by
   swiping (layout in home.css — .occasions/.pol-stage/.pol-row). Cards 1+2
   drop onto the left/right columns when the stage scrolls into view. The
   stage is a hidden horizontal snap-scroller (stops built here): each
   swipe throws the next card onto the pile — 3 → left column, 4 → right,
   5 → middle — and swiping back lifts them off. Position-driven off
   scrollLeft, so momentum can't double-fire and it always replays; the
   page's vertical flow is never touched. Every landing is the "few cm
   drop": straight down onto its spot with a slight settle rotation.
   Desktop keeps the static fanned row; prefers-reduced-motion shows the
   finished pile with no animation. Earlier takes archived in
   variants/occasions-pinned-reveal.md + git history. ---------- */
(function polPile() {
  const occ   = document.querySelector('.occasions');
  const stage = document.querySelector('.pol-stage');
  const cards = [...document.querySelectorAll('.pol')];
  if (!occ || !stage || cards.length < 3) return;
  const mq = matchMedia('(max-width:860px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const n = cards.length;
  const BASE = 2;    // cards already on the table before any swiping
  const ZONE = 140;  // px of horizontal scroll per thrown card (one snap stop)
  const zones = n - BASE;
  // resting spots: x is % across the stage (so the pile fills any width and
  // the outer edges may bleed past the cork card), y/r a small scatter.
  // 1+3 share the left column, 2+4 the right, 5 tops the middle.
  const REST = [
    { x: 26, y: 0,  r: -5 }, { x: 74, y: 8,  r: 4 }, { x: 27, y: 14, r: -2 },
    { x: 73, y: -2, r: 5 },  { x: 50, y: 6,  r: -3 },
  ];
  const DURATION = 600;
  const EASE = 'cubic-bezier(.3,1.3,.4,1)'; // small overshoot — drop, then settle
  const state = new Array(n).fill(false);   // is card i currently on the table?
  let entered = false, ticking = false, io = null, built = false;

  function buildTrack() {
    if (built) return; built = true;
    for (let i = 0; i < zones; i++) {
      const z = document.createElement('div');
      z.className = 'pol-snapzone';
      stage.appendChild(z);
    }
    const fill = document.createElement('div');
    fill.className = 'pol-snapfill';
    stage.appendChild(fill);
  }

  function paint(i, landed, delayMs) {
    const rest = REST[i % REST.length];
    const card = cards[i];
    card.style.left = rest.x + '%';
    card.style.transitionDelay = (landed && delayMs ? delayMs : 0) + 'ms';
    if (landed) {
      card.style.transform = `translate(-50%, calc(-50% + ${rest.y}px)) rotate(${rest.r}deg) scale(1)`;
      card.style.opacity = '1';
    } else {
      // held a few cm above its landing spot — falls straight down onto it
      card.style.transform = `translate(-50%, calc(-50% + ${rest.y - 30}px)) rotate(${rest.r * 0.4}deg) scale(1.05)`;
      card.style.opacity = '0';
    }
    card.style.zIndex = String(i + 1); // later throws land on top
  }

  // how many cards belong on the table right now: none before the stage is
  // seen; the two base columns once it is; +1 per snapped zone of swipe
  function target() {
    if (!entered) return 0;
    const z = Math.round(stage.scrollLeft / ZONE);
    return BASE + Math.max(0, Math.min(zones, z));
  }

  function update() {
    ticking = false;
    if (!mq.matches) return;
    const t = target();
    let batch = 0; // stagger when several land in one go (entrance, hard fling)
    for (let i = 0; i < n; i++) {
      const should = i < t;
      if (should !== state[i]) {
        paint(i, should, batch * 90);
        state[i] = should;
        if (should) batch++;
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function arm() {
    buildTrack();
    // start everything lifted, with no transition (no first-paint flash),
    // then flush and re-enable so the first drop animates
    cards.forEach((c, i) => { c.style.transition = 'none'; paint(i, false, 0); state[i] = false; });
    void stage.offsetWidth;
    cards.forEach(c => { c.style.transition = `transform ${DURATION}ms ${EASE}, opacity ${Math.round(DURATION / 2)}ms ease-out`; });
    if (!io) {
      io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio >= 0.25) {
            entered = true; update();
          } else if (!e.isIntersecting) {
            // fully out of view — rewind + lift everything for a replay
            entered = false; stage.scrollLeft = 0; update();
          }
        });
      }, { threshold: [0, 0.25] });
      io.observe(stage);
    }
    stage.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  function staticPile() {
    // reduced motion: full finished pile, no entrance, swiping changes nothing
    buildTrack();
    if (io) { io.disconnect(); io = null; }
    stage.removeEventListener('scroll', onScroll);
    cards.forEach((c, i) => { c.style.transition = 'none'; paint(i, true, 0); state[i] = true; });
  }

  function clear() {
    // desktop: strip inline styles so the static fanned CSS row shows
    if (io) { io.disconnect(); io = null; }
    stage.removeEventListener('scroll', onScroll);
    cards.forEach((c, i) => {
      c.style.transition = ''; c.style.transform = ''; c.style.opacity = '';
      c.style.zIndex = ''; c.style.left = ''; c.style.transitionDelay = '';
      state[i] = false;
    });
    entered = false;
  }

  function setup() {
    if (!mq.matches) clear();
    else if (reduce.matches) staticPile();
    else arm();
  }

  mq.addEventListener('change', setup);
  reduce.addEventListener('change', setup);
  setup();
})();
