/* B2C v5 — hero flavour switcher + shop cards + scroll reveal */

const FLAVOURS = [
  { id: 'spritz',   name: 'Spritz',           colorVar: '--fl-spritz',
    ing: 'Aperol, sparkling wine, soda · 8%' },
  { id: 'mojito',   name: 'Mojito',           colorVar: '--fl-mojito',
    ing: 'Planteray rum, lime, fresh mint, soda · 9.5%' },
  { id: 'paloma',   name: 'Paloma',           colorVar: '--fl-paloma',
    ing: 'Tequila, lime, grapefruit, soda · 9.5%' },
  { id: 'pornstar', name: 'Pornstar Martini', colorVar: '--fl-pornstar',
    ing: 'Vodka, passion fruit, vanilla, lime · 9.5%' },
  { id: 'mango',    name: 'Mango Mule',       colorVar: '--fl-mango',
    ing: 'Vodka, mango purée, lime, ginger beer · 9.5%' },
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
grid.innerHTML = FLAVOURS.map(f => `
  <div class="shop-card" style="--fl:${colorOf(f)}">
    <img src="assets/keg-full-${f.id}.png" alt="${f.name} keg">
    <h3>${f.name}</h3>
    <p class="ing">${f.ing}</p>
    <button class="btn btn-primary">Buy</button>
  </div>`).join('');

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
