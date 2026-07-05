# Compact Cocktail — website

Static site for [compactcocktail.hu](https://compactcocktail.hu): bar-quality cocktails by the keg.

- `index.html` — B2C homepage (v5 design)
- `brand.css` — brand tokens (colours, Outfit font, radii) from the Figma brand guide
- `home.css` / `home.js` — homepage styles + flavour switcher/shop cards
- `assets/` — web-sized images only

No build step. Deploy as a static site (Vercel: import repo → framework preset "Other" → no build command, output dir `.`).

TODO before launch: real webshop URL on the "Shop online" buttons, real testimonial quotes, final prices, `/on-tap` B2B page.
