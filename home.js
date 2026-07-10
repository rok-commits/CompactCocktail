/* B2C v5 — hero flavour switcher + shop cards + story modal + scroll reveal */

/* TODO: real per-flavour product links once the Fehér Nyúl webshop pages
   are confirmed (set `shop` per flavour; WEBSHOP_URL is the fallback). */
const WEBSHOP_URL = 'https://fehernyul.hu/webshop';

/* `available:false` = not in the webshop at launch → "coming soon" sticker
   + Notify me instead of Buy. TODO: confirm the launch list with the client.
   `story`/`video` feed the click-popup — placeholder copy until László's
   flavour infopack arrives (video: {src, poster, subs} once filmed). */
const FLAVOURS = [
  { id: 'spritz',   name: 'Spritz',           colorVar: '--fl-spritz',
    ing: 'Aperol, sparkling wine, soda · 8%', available: true, video: null,
    story: 'Born on Venetian canals as the aperitivo of choice, ours is built on real Aperol and proper sparkling wine. Bitter, bubbly, unbothered.' },
  { id: 'mojito',   name: 'Mojito',           colorVar: '--fl-mojito',
    ing: 'Planteray rum, lime, fresh mint, soda · 9.5%', available: true, video: null,
    story: 'Havana’s gift to hot afternoons — and Hemingway’s standing order. Planteray rum, fresh mint and lime, exactly as a bartender would build it.' },
  { id: 'paloma',   name: 'Paloma',           colorVar: '--fl-paloma',
    ing: 'Tequila, lime, grapefruit, soda · 9.5%', available: false, video: null,
    story: 'Mexico’s true favourite tequila drink — not the margarita. Grapefruit, lime and a clean tequila bite, made for long tables in the sun.' },
  { id: 'pornstar', name: 'Pornstar Martini', colorVar: '--fl-pornstar',
    ing: 'Vodka, passion fruit, vanilla, lime · 9.5%', available: true, video: null,
    story: 'London, 2002: a cheeky name on a seriously good drink. Passion fruit, vanilla and vodka — the party cocktail that never left the charts.' },
  { id: 'mango',    name: 'Mango Mule',       colorVar: '--fl-mango',
    ing: 'Vodka, mango purée, lime, ginger beer · 9.5%', available: false, video: null,
    story: 'The Moscow Mule took a detour through the tropics. Mango purée, sharp lime and spicy ginger beer — our own twist on a copper-mug classic.' },
];

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
    kegImg.src  = `assets/keg-full-${f.id}.png`;
    garnish.src = `assets/garnish-${f.id}.png`;
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
       data-i="${i}" role="button" tabindex="0" aria-label="${f.name} — the story">
    ${f.available ? '' : '<span class="shop-sticker">Coming soon</span>'}
    <img src="assets/keg-full-${f.id}.png" alt="${f.name} keg">
    <h3>${f.name}</h3>
    <p class="ing">${f.ing}</p>
    <button class="btn btn-primary" data-buy="${i}">${f.available ? 'Buy' : 'Notify me'}</button>
    <span class="shop-more">The story&nbsp;&rarr;</span>
  </div>`).join('');

/* ---------- webshop redirect popup (all purchases finish at Fehér Nyúl) ---------- */
function shopRedirect(f) {
  const url = (f && f.shop) || WEBSHOP_URL;
  ccModal({
    html:
      '<button class="cc-modal-x" data-close aria-label="Close">&times;</button>' +
      '<h3>Off to the webshop.</h3>' +
      '<p class="cc-modal-sub">Don’t be alarmed — our kegs are sold through our partner brewery. You’ll finish your purchase on the <b>Fehér Nyúl webshop</b>.</p>' +
      '<div class="cc-modal-btns">' +
        `<a class="btn btn-primary" href="${url}" target="_blank" rel="noopener" data-close>Take me there&nbsp;&rarr;</a>` +
        '<button class="btn cc-btn-outline" data-close>Stay here</button>' +
      '</div>'
  });
}

/* ---------- flavour story popup (content pending László's infopack) ---------- */
function openStory(f) {
  const media = f.video
    ? `<video controls playsinline poster="${f.video.poster || ''}">
         <source src="${f.video.src}">
         ${f.video.subs ? `<track kind="subtitles" src="${f.video.subs}" srclang="en" default>` : ''}
       </video>`
    : `<img src="assets/keg-full-${f.id}.png" alt="${f.name} keg">
       <span class="story-soon">micro-video coming soon</span>`;
  const m = ccModal({
    html:
      '<button class="cc-modal-x" data-close aria-label="Close">&times;</button>' +
      `<div class="story-media" style="background:${colorOf(f)}">${media}</div>` +
      `<h3>${f.name}</h3>` +
      `<p class="cc-modal-sub">${f.story}</p>` +
      '<div class="cc-modal-btns">' +
        (f.available
          ? '<button class="btn btn-primary" data-shop>Buy this keg&nbsp;&rarr;</button>'
          : '<button class="btn btn-primary" data-notify>Notify me when it lands</button>') +
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

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });

document.querySelectorAll(
  '.shop-card,.bubble,.makers-copy'
).forEach(el => { el.classList.add('reveal'); io.observe(el); });
