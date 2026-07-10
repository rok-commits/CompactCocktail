/* B2C v5 — hero flavour switcher + shop cards + story modal + scroll reveal */

const LANG = window.CC_LANG || 'en';   // set by shared.js from <html lang>
const ROOT = window.CC_ROOT || '';     // '../' on /en/ pages

/* TODO: real per-flavour product links once the Fehér Nyúl webshop pages
   are confirmed (set `shop` per flavour; WEBSHOP_URL is the fallback). */
const WEBSHOP_URL = 'https://fehernyul.hu/webshop';

/* page strings rendered by JS, per language */
const T = LANG === 'hu' ? {
  buy: 'Megveszem', notify: 'Értesíts', story: 'A sztori',
  sticker: 'Hamarosan', aria: ' — a sztori',
  buyKeg: 'Megveszem ezt a hordót&nbsp;&rarr;', notifyKeg: 'Értesíts, ha megérkezik',
  videoSoon: 'hamarosan mikro-videó',
  shopH: 'Irány a webshop.',
  shopP: 'Ne ijedj meg — a hordóinkat a partner sörfőzdénk árulja. A vásárlást a <b>Fehér Nyúl webshopjában</b> fejezed be.',
  shopGo: 'Vigyél oda&nbsp;&rarr;', shopStay: 'Maradok',
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
  shopH: 'Off to the webshop.',
  shopP: 'Don’t be alarmed — our kegs are sold through our partner brewery. You’ll finish your purchase on the <b>Fehér Nyúl webshop</b>.',
  shopGo: 'Take me there&nbsp;&rarr;', shopStay: 'Stay here',
  ing: {
    spritz: 'Aperol, sparkling wine, soda · 8%',
    mojito: 'Planteray rum, lime, fresh mint, soda · 9.5%',
    paloma: 'Tequila, lime, grapefruit, soda · 9.5%',
    pornstar: 'Vodka, passion fruit, vanilla, lime · 9.5%',
    mango: 'Vodka, mango purée, lime, ginger beer · 9.5%',
  }
};

/* `available:false` = not in the webshop at launch → "coming soon" sticker
   + Notify me instead of Buy. TODO: confirm the launch list with the client.
   `story`/`video` feed the click-popup — placeholder copy until László's
   flavour infopack arrives (video: {src, poster, subs} once filmed). */
const FLAVOURS = [
  { id: 'spritz',   name: 'Spritz',           colorVar: '--fl-spritz',
    available: true, video: null, story: {
      en: 'Born on Venetian canals as the aperitivo of choice, ours is built on real Aperol and proper sparkling wine. Bitter, bubbly, unbothered.',
      hu: 'A velencei csatornák aperitivója, igazi Aperolból és rendes pezsgőből építve. Keserű, buborékos, laza.' } },
  { id: 'mojito',   name: 'Mojito',           colorVar: '--fl-mojito',
    available: true, video: null, story: {
      en: 'Havana’s gift to hot afternoons — and Hemingway’s standing order. Planteray rum, fresh mint and lime, exactly as a bartender would build it.',
      hu: 'Havanna ajándéka a forró délutánokra — és Hemingway állandó rendelése. Planteray rum, friss menta és lime, pontosan úgy, ahogy egy bártender készítené.' } },
  { id: 'paloma',   name: 'Paloma',           colorVar: '--fl-paloma',
    available: false, video: null, story: {
      en: 'Mexico’s true favourite tequila drink — not the margarita. Grapefruit, lime and a clean tequila bite, made for long tables in the sun.',
      hu: 'Mexikó igazi kedvenc tequilás itala — nem a margarita. Grépfrút, lime és tiszta tequila, hosszú, napsütötte asztalokhoz.' } },
  { id: 'pornstar', name: 'Pornstar Martini', colorVar: '--fl-pornstar',
    available: true, video: null, story: {
      en: 'London, 2002: a cheeky name on a seriously good drink. Passion fruit, vanilla and vodka — the party cocktail that never left the charts.',
      hu: 'London, 2002: pimasz név egy komolyan jó italon. Maracuja, vanília és vodka — a partikoktél, ami sosem esett ki a slágerlistáról.' } },
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

function show(i) {
  current = i;
  const f = FLAVOURS[i];
  panel.style.background = colorOf(f);
  panel.style.setProperty('--fl-dark', darkOf(f));
  panel.dataset.flavour = f.id;
  pattern.classList.remove('roll');
  void pattern.offsetWidth; // restart the roll animation
  pattern.classList.add('roll');
  stage.classList.add('switching');
  setTimeout(() => {
    kegImg.src  = `${ROOT}assets/keg-full-${f.id}.png`;
    garnish.src = `${ROOT}assets/garnish-${f.id}.png`;
    fname.textContent = f.name;
    stage.classList.remove('switching');
  }, 320);
  dots.forEach((d, j) => d.classList.toggle('active', j === i));
}

function restart() {
  clearInterval(timer);
  timer = setInterval(() => show((current + 1) % FLAVOURS.length), 4200);
}
restart();
panel.addEventListener('mouseenter', () => clearInterval(timer));
panel.addEventListener('mouseleave', restart);

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
        `<button class="btn cc-btn-outline" data-close>${T.shopStay}</button>` +
      '</div>'
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
  document.querySelector('.cta').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.querySelector('.cta-form input')?.focus({ preventScroll: true }), 600);
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

/* ---------- trusted ticker — venue logo + name pairs ----------
   TODO: when the client's venue-logo sheet arrives, drop the files in
   assets/venues/ and set logo:'assets/venues/<file>.svg' per venue;
   until then an initials chip is rendered. */
const VENUES = [
  { name: 'Time Out Market',   logo: null },
  { name: 'Spíler Biergarten', logo: null },
  { name: 'Voilá',             logo: null },
  { name: 'Pántlika',          logo: null },
  { name: 'Gajdó',             logo: null },
  { name: 'Accor',             logo: null },
  { name: 'Rajkai',            logo: null },
  { name: 'Világbéke',         logo: null },
  { name: 'Utazó Bár',         logo: null },
  { name: 'Patent',            logo: null },
  { name: 'Flip Mood',         logo: null },
  { name: 'Vak Varjú',         logo: null },
  { name: 'És Bisztró',        logo: null },
];

const tickTrack = document.querySelector('.ticker-track');
if (tickTrack) {
  const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const tkItem = v => `<span class="tk">` +
    (v.logo ? `<img class="tk-logo" src="${v.logo}" alt="">`
            : `<i class="tk-logo">${initials(v.name)}</i>`) +
    `${v.name}</span>`;
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
