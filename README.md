# Compact Cocktail — website

Static site for [compactcocktail.hu](https://compactcocktail.hu): bar-quality cocktails by the keg.

## Structure

- `index.html` / `on-tap.html` — **Hungarian** B2C + B2B pages (root = main market)
- `en/index.html` / `en/on-tap.html` — **English** versions
- `brand.css` — brand tokens (colours, Outfit font, radii) from the Figma brand guide
- `home.css` / `home.js` — B2C styles + flavour switcher, shop cards, story popup, ticker
- `ontap.css` / `ontap.js` — B2B styles + tap-ready wizard, venue ticker
- `shared.css` / `shared.js` — both pages: age gate, modals, mobile nav, language routing, `ccSubmitForm()` stub
- `assets/` — web-sized images only

## Languages — keep in sync!

Root pages are Hungarian, `/en/` is English, linked with `hreflang`.
First visit auto-picks by browser language (`shared.js`), the header
HU/EN toggle stores the choice in `localStorage`.

**Every structural or copy edit must be made in BOTH the root (HU) and
`/en/` version of the page.** JS-rendered strings (shop cards, wizard,
age gate, popups) live in per-language dictionaries inside `home.js`,
`ontap.js` and `shared.js` — edit both `en:` and `hu:` entries.

The current HU copy is an LLM draft — **needs native review by the
client before launch.**

No build step. Deploy as a static site (Vercel: import repo → framework preset "Other" → no build command, output dir `.`).

## TODO before launch

- real webshop URLs (`WEBSHOP_URL` + per-flavour `shop` in `home.js`) — pending client
- which flavours are unavailable at launch (`available:` flags in `home.js`) — pending client
- venue logo sheet → `assets/venues/`, set `logo:` in `VENUES` (home.js) + `OT_VENUES` (ontap.js)
- flavour story micro-videos + final copy (László's infopack) → `FLAVOURS[].video/story`
- retail-keg center-sticker artwork from `WebDesign_2026_CompactCocktail.ai` → replace `.ot-sticker` circles
- founder photos (Noel) + brewery photos → makers sections
- B2B PDFs (price list, setup manual, pitch deck) → `.ot-doc` links
- form backend: swap the body of `ccSubmitForm()` in `shared.js` (Formspree/Mailchimp — discuss with András)
- Mailchimp + discount-code mechanics for the newsletter (András)
- GDPR cookie banner once analytics/Mailchimp land
- native HU copy review
