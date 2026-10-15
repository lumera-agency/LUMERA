/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-v2.js (the working folder); the corporate entry is
   the React clinic sample (../clinic/module.tsx, 15 Oct 2026). */
/* «Дизайн і сайти» (/dyzain-i-saity): the example sites' modules. One per format (the owner, 14–15 Oct 2026): four
 * designs assembled from ready premium blocks (ReactBits, 21st.dev, ported), each with its own CSS and its own 3D object:
 *   js/sites-pv-n-landing.js + css/sites-pv-n-landing.css — Лендінг «Фуксія» (the photo studio)
 *   js/sites-pv-n-plus.js    + css/sites-pv-n-plus.css    — Лендінг+ «План» (the same studio, its own design)
 *   ../clinic/module.tsx     + clinic/clinic.css          — Корпоративний сайт «Петроль» (the dental clinic, opts.page 0–3;
 *                                                             React, round 14: the old vanilla module was removed)
 *   js/sites-pv-n-shop.js    + css/sites-pv-n-shop.css    — Магазин «Дзеркало» (the glass decor shop)
 * Each exports meta = { theme, cube, bg }, build(H, c, data, e, opts) → the site's inner HTML (or '' to fall back to the
 * configurator's own sample), object3d = true (it draws its own 3D object) and enhance(site, ctx): its interactions,
 * set up once per render (event listeners and one-off animations only; nothing that runs at rest).
 * (The Авторський samples of earlier rounds were taken off the page on 15 Oct; their files are kept outside the project.)
 */
import * as nLanding from './sites-pv-n-landing.js';
import * as nPlus from './sites-pv-n-plus.js';
import * as nCorp from '../clinic/module';
import * as nShop from './sites-pv-n-shop.js';

export const N = { landing: nLanding, plus: nPlus, corporate: nCorp, ecommerce: nShop };
