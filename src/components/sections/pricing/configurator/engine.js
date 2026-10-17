/**
 * Lumera · Project Configurator — pricing / timeline / naming engine (pd6 + the owner's 9 Oct decisions).
 *
 * Drop-in replacement for js/configurator/engine.js. Plain ES module, no DOM, no copy.
 * EVERY price and duration lives in PRICING, every bundle in BUNDLES. The UI never holds
 * a number of its own: option tags, bundle prices, the breakdown, the totals, the bar and
 * the lead payload are all derived from here. Texts live in strings.js (uk / ru).
 *
 * What changed against the live engine (pd6/configurator-spec.md §4):
 *   - growth.googleAds 200 → 250 (one-time setup, analytics included);
 *   - adsManagement: a new optional MONTHLY item, $150/month, only with ads;
 *   - formats.existing: «У мене вже є сайт» (no build, price 0, timeline unknown);
 *   - BUNDLES: the four one-tap presets; matchBundle / applyBundle / normalize;
 *   - calculateProject returns once / monthly separately and nameParts instead of an
 *     English projectLabel (the UI composes the UA/RU name from strings.js);
 *   - lineItems carry `period: 'once' | 'month'`; design.essential is listed at $0;
 *   - buildFlow / projectLabel are gone (the preview's system layer replaces the lead path).
 * The owner, 9 Oct (art direction pass): an existing site may buy request handling WITHOUT ads
 * («Заявки в Telegram» $100 or «CRM і AI» $500 alone). Its default stays the ads setup ($250).
 * At least one service is always bought: no ads + «Лише пошта» on an existing site is not a
 * configuration (normalize moves the requests to Telegram; «Лише пошта» rests while there are no ads).
 * The owner, 10 Oct: «Аналітика» is a service of its own, growth.analytics $150 (GA4, request tracking:
 * where each request came from, the site's and the ad campaigns'). It is bought without the ads setup;
 * the ads setup ($250) still includes it. So growth is none / analytics / googleAds / googleAdsAi (the UI
 * lists them in PRICING.growth's order); «ads» below means googleAds or googleAdsAi (hasAds), and only ads
 * open the monthly management. Analytics counts as a purchase: an existing site with analytics alone
 * keeps «Лише пошта». It is set up in parallel (no extra weeks). Its preset 'analytics' (existing site +
 * analytics, $150) is the target of 2 · Старт's «Налаштувати аналітику» and the second «або» card in 6.
 */

/**
 * @typedef {'landing'|'landingPlus'|'corporate'|'ecommerce'|'existing'} SiteFormat
 * @typedef {'essential'|'custom'} DesignLevel
 * @typedef {'none'|'analytics'|'googleAds'|'googleAdsAi'} GrowthOption
 * @typedef {'none'|'lead'|'crmAi'} AutomationOption
 * @typedef {{format:SiteFormat, design:DesignLevel, advancedMotion:boolean, threeDHero:boolean,
 *            secondLanguage:boolean, growth:GrowthOption, adsManagement:boolean,
 *            automation:AutomationOption}} ProjectConfig
 */

/** @type {ProjectConfig} */
export const DEFAULT_CONFIG = Object.freeze({
  format: 'landing',
  design: 'essential',
  advancedMotion: false,
  threeDHero: false,
  secondLanguage: false,
  growth: 'none',
  adsManagement: false, // NEW · monthly, only with ads
  automation: 'none',
});

export const PRICING = {
  currency: '$',
  // the total may move by this share after the call (shown as a note, not as a range)
  tolerance: 0.1,

  // weeks: [min, max] for the format alone; null = not known yet (no estimate shown)
  formats: {
    landing:   { price: 500,  weeks: [1, 2] },
    // the owner, 17 Oct: «Лендінг+» (one page, 9–10 blocks), as on /dyzain-i-saity
    landingPlus: { price: 700, weeks: [2, 3] },
    corporate: { price: 900,  weeks: [3, 4] },
    ecommerce: { price: 1500, weeks: [4, 6] },
    // NEW · «У мене вже є сайт»: we don't build a site, so no site options (its weeks: calculateTimeline)
    existing:  { price: 0,    weeks: null, build: false },
  },

  // custom design and motion grow with the site (owner's review, 9 Oct): more pages, more to design
  design: {
    essential: { price: 0, weeks: 0 }, // built on a template
    custom:    { price: { landing: 200, landingPlus: 300, corporate: 400, ecommerce: 600 }, weeks: { landing: 1, landingPlus: 1, corporate: 1.5, ecommerce: 2 } }, // individual (not offered on the main page since 17 Oct)
  },
  advancedMotion: { price: { landing: 150, landingPlus: 200, corporate: 250, ecommerce: 300 }, weeks: { landing: 0.5, landingPlus: 0.5, corporate: 1, ecommerce: 1 } },
  threeDHero:     { price: 400, weeks: 1 },

  // more pages → more to translate
  secondLanguage: {
    price: { landing: 100, landingPlus: 100, corporate: 150, ecommerce: 200 },
    weeks: { landing: 0, landingPlus: 0, corporate: 0.5, ecommerce: 0.5 },
  },

  // one-time setups, done in parallel with development: no extra weeks. The key order is the UI's order;
  // `ads: true` = a Google Ads setup (opens the monthly management)
  growth: {
    none:        { price: 0 },
    analytics:   { price: 150 }, // NEW (10 Oct) · analytics alone: GA4, request tracking, no ads
    googleAds:   { price: 250, ads: true }, // was 200 · setup + analytics (GA4, request tracking)
    googleAdsAi: { price: 350, ads: true }, // unchanged · the same + the site prepared for ChatGPT / Gemini answers
  },

  // NEW · optional, per month, only with ads (hasAds: googleAds / googleAdsAi; not with analytics alone)
  adsManagement: { monthly: 150 },

  automation: {
    none:  { price: 0,   weeks: 0 },
    lead:  { price: 100, weeks: 0 },
    crmAi: { price: 500, weeks: 1 },
  },
};

/** Ads in this configuration: a Google Ads setup (analytics alone is not ads). */
export const hasAds = (cfg) => !!PRICING.growth[cfg.growth]?.ads;

/** A price or a duration that may depend on the format ({ landing, corporate, ecommerce }). */
const perFormat = (v, format) => (typeof v === 'object' && v !== null ? v[format] ?? v.landing : v);

/**
 * NEW · one-tap presets, in display order. A preset sets every field except adsManagement
 * (monthly, the visitor's own choice); normalize() then drops it if the preset has no ads.
 * The sums are not stored: the UI shows calculateProject(bundle.config).
 *   site      landing                                 = 500
 *   siteAds   landing + googleAds + lead              = 500 + 250 + 100 = 850
 *   full      corporate + googleAds + crmAi           = 900 + 250 + 500 = 1 650
 *   existing  existing site + googleAds               = 250
 *   analytics existing site + analytics               = 150 (alt, like existing)
 */
const SITE_BASE = { design: 'essential', advancedMotion: false, threeDHero: false, secondLanguage: false };
export const BUNDLES = [
  { id: 'site',     config: { format: 'landing',   ...SITE_BASE, growth: 'none',      automation: 'none' } },
  { id: 'siteAds',  config: { format: 'landing',   ...SITE_BASE, growth: 'googleAds', automation: 'lead' } },
  { id: 'full',     config: { format: 'corporate', ...SITE_BASE, growth: 'googleAds', automation: 'crmAi' } },
  { id: 'existing', config: { format: 'existing',  ...SITE_BASE, growth: 'googleAds', automation: 'none' }, alt: true },
  { id: 'analytics', config: { format: 'existing', ...SITE_BASE, growth: 'analytics', automation: 'none' }, alt: true },
];

/* ---------- consistency rules ---------- */

/**
 * The one place that keeps a configuration valid. The UI calls it after every change.
 *  - an existing site has no site options; with neither ads nor analytics it takes at least «Заявки в Telegram»;
 *  - ads management exists only with ads (not with analytics alone).
 * @param {ProjectConfig} cfg
 * @returns {ProjectConfig}
 */
export function normalize(cfg) {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  if (c.format === 'existing') {
    Object.assign(c, SITE_BASE);
    // something is always bought for an existing site: without ads, the requests go to Telegram at least
    if (c.growth === 'none' && c.automation === 'none') c.automation = 'lead';
  }
  if (!hasAds(c)) c.adsManagement = false;
  return c;
}

/** Is this option usable in this configuration? (the UI dims and skips what isn't) */
export function isAvailable(group, value, cfg) {
  const existing = cfg.format === 'existing';
  if (existing && ['design', 'advancedMotion', 'threeDHero', 'secondLanguage'].includes(group)) return false;
  // an existing site without ads or analytics buys request handling: «Лише пошта» rests until one is on
  if (existing && group === 'automation' && value === 'none') return cfg.growth !== 'none';
  if (group === 'adsManagement') return hasAds(cfg);
  return true;
}

const PRESET_KEYS = ['format', 'design', 'advancedMotion', 'threeDHero', 'secondLanguage', 'growth', 'automation'];

/** The bundle this configuration is exactly, or null (adsManagement is ignored). */
export function matchBundle(cfg) {
  const b = BUNDLES.find((x) => PRESET_KEYS.every((k) => x.config[k] === cfg[k]));
  return b ? b.id : null;
}

/** The configuration a bundle tap produces: the preset, the visitor's monthly choice kept. */
export function applyBundle(id, cfg = DEFAULT_CONFIG) {
  const b = BUNDLES.find((x) => x.id === id);
  if (!b) throw new Error('Unknown bundle: ' + id);
  return normalize({ ...b.config, adsManagement: cfg.adsManagement });
}

/* ---------- prices of single options (for the tags next to controls) ---------- */

/** @returns {number} */
export function optionPrice(group, value, cfg = DEFAULT_CONFIG) {
  switch (group) {
    case 'format': return PRICING.formats[value].price;
    case 'design': return perFormat(PRICING.design[value].price, cfg.format);
    case 'advancedMotion': return perFormat(PRICING.advancedMotion.price, cfg.format);
    case 'threeDHero': return PRICING.threeDHero.price;
    case 'secondLanguage': return PRICING.secondLanguage.price[cfg.format] ?? PRICING.secondLanguage.price.landing;
    case 'growth': return PRICING.growth[value].price;
    case 'adsManagement': return PRICING.adsManagement.monthly;
    case 'automation': return PRICING.automation[value].price;
    default: throw new Error('Unknown option group: ' + group);
  }
}

/* ---------- breakdown ---------- */

/**
 * Line items of the estimate, in display order. `id` is the strings key under `items`.
 * @param {ProjectConfig} cfg
 * @returns {{id:string, price:number, period:'once'|'month'}[]}
 */
export function lineItems(cfg) {
  const once = (id, price) => ({ id, price, period: 'once' });
  const lines = [];
  if (cfg.format !== 'existing') {
    lines.push(once('format.' + cfg.format, PRICING.formats[cfg.format].price));
    // one design level since 17 Oct (the owner): the samples are the design the price buys, so no design line
    if (cfg.design !== 'essential') lines.push(once('design.' + cfg.design, perFormat(PRICING.design[cfg.design].price, cfg.format)));
    if (cfg.advancedMotion) lines.push(once('advancedMotion', perFormat(PRICING.advancedMotion.price, cfg.format)));
    if (cfg.threeDHero) lines.push(once('threeDHero', PRICING.threeDHero.price));
    if (cfg.secondLanguage) lines.push(once('secondLanguage', PRICING.secondLanguage.price[cfg.format]));
  }
  if (cfg.growth !== 'none') lines.push(once('growth.' + cfg.growth, PRICING.growth[cfg.growth].price));
  if (cfg.automation !== 'none') lines.push(once('automation.' + cfg.automation, PRICING.automation[cfg.automation].price));
  if (cfg.adsManagement && hasAds(cfg)) lines.push({ id: 'adsManagement', price: PRICING.adsManagement.monthly, period: 'month' });
  return lines;
}

/* ---------- timeline ---------- */

/**
 * Not a plain sum. Design-side work (custom design, motion, 3D) overlaps, so the longest
 * item counts in full and the rest at half. Translation and the CRM/AI integration come
 * after the build. Ads, analytics and Telegram run in parallel. An existing site: a week, two with the CRM.
 * @param {ProjectConfig} cfg
 * @returns {{min:number, max:number} | null} weeks
 */
export function calculateTimeline(cfg) {
  // an existing site: nothing is built; ads, analytics or Telegram take about a week to set up, the CRM about one more
  if (cfg.format === 'existing') return { min: 1, max: cfg.automation === 'crmAi' ? 2 : 1 };
  const base = PRICING.formats[cfg.format].weeks;
  if (!base) return null;
  const [baseMin, baseMax] = base;
  const overlapping = [
    perFormat(PRICING.design[cfg.design].weeks, cfg.format),
    cfg.advancedMotion ? perFormat(PRICING.advancedMotion.weeks, cfg.format) : 0,
    cfg.threeDHero ? PRICING.threeDHero.weeks : 0,
  ].filter(Boolean).sort((a, b) => b - a);
  let extra = overlapping.length ? overlapping[0] + overlapping.slice(1).reduce((s, w) => s + w, 0) * 0.5 : 0;
  if (cfg.secondLanguage) extra += PRICING.secondLanguage.weeks[cfg.format];
  extra += PRICING.automation[cfg.automation].weeks;
  return { min: baseMin + Math.floor(extra), max: baseMax + Math.max(0, Math.ceil(extra - 0.25)) };
}

/* ---------- name ---------- */

/**
 * What the UI needs to name the project in UA/RU (strings.js `name(parts)`):
 * the bundle when the configuration is one, otherwise its parts.
 */
export function nameParts(cfg) {
  return {
    bundle: matchBundle(cfg),
    format: cfg.format,
    ads: hasAds(cfg),
    stats: cfg.growth === 'analytics', // analytics alone (with ads it is part of the setup)
    leads: cfg.automation, // 'none' | 'lead' | 'crmAi'
  };
}

/* ---------- the one function the UI calls ---------- */

/** @param {ProjectConfig} cfg */
export function calculateProject(cfg) {
  const c = normalize(cfg);
  const lines = lineItems(c);
  const once = lines.filter((l) => l.period === 'once').reduce((s, l) => s + l.price, 0);
  const monthly = lines.filter((l) => l.period === 'month').reduce((s, l) => s + l.price, 0);
  const weeks = calculateTimeline(c);
  return {
    price: once, // kept: the one-time total (old callers read `price`)
    once,
    monthly, // 0 or PRICING.adsManagement.monthly
    monthlyOffer: hasAds(c) && !c.adsManagement ? PRICING.adsManagement.monthly : 0,
    priceMin: once,
    priceMax: once,
    estimatedWeeksMin: weeks ? weeks.min : null,
    estimatedWeeksMax: weeks ? weeks.max : null,
    lines,
    bundle: matchBundle(c),
    nameParts: nameParts(c),
    adBudgetNote: hasAds(c),
  };
}

/* ---------- formatting ---------- */

const NBSP = ' ';
export const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
export const money = (n) => PRICING.currency + group(n);
/** Tag next to an option: "+ $200"; "" for a zero add-on (the UI shows "включено"). */
export const addonTag = (n) => (n === 0 ? '' : '+' + NBSP + money(n));

/* ---------- lead payload ---------- */

/** One field for "Email, Telegram или телефон": decide which it is. (unchanged) */
export function parseContact(raw) {
  const v = String(raw || '').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { email: v, telegram: '', phone: '' };
  if (/^\+?[\d\s()-]{9,18}$/.test(v)) return { email: '', telegram: '', phone: v };
  const tg = v.replace(/^(https?:\/\/)?t\.me\//i, '').replace(/^@/, '');
  if (/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(tg)) return { email: '', telegram: '@' + tg, phone: '' };
  return null;
}

/**
 * Object for the API / webhook (n8n → Telegram → CRM).
 * @param {ProjectConfig} cfg
 * @param {{name:string, contact:string, company?:string}} form
 * @param {'uk'|'ru'} lang
 * @param {string} label  the UA/RU project name the visitor saw (strings.js name())
 */
export function buildLeadPayload(cfg, form, lang = 'uk', label = '') {
  const c = normalize(cfg);
  const p = calculateProject(c);
  const contact = parseContact(form.contact) || { email: '', telegram: '', phone: '' };
  return {
    source: 'lumera_project_configurator',
    lang,
    project: {
      bundle: p.bundle, // NEW · 'site' | 'siteAds' | 'full' | 'existing' | 'analytics' | null
      format: c.format,
      design: c.design,
      motion: c.advancedMotion,
      threeD: c.threeDHero,
      secondLanguage: c.secondLanguage,
      growth: c.growth, // 'none' | 'analytics' | 'googleAds' | 'googleAdsAi'
      adsManagement: c.adsManagement, // NEW
      automation: c.automation,
      label,
    },
    estimate: {
      currency: PRICING.currency,
      price: p.once,
      once: p.once, // NEW
      monthly: p.monthly, // NEW
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      lines: p.lines,
      timelineMin: p.estimatedWeeksMin,
      timelineMax: p.estimatedWeeksMax,
    },
    contact: {
      name: String(form.name || '').trim(),
      email: contact.email,
      telegram: contact.telegram,
      phone: contact.phone,
      company: String(form.company || '').trim(),
    },
  };
}

/** Placeholder transport — point LEAD_ENDPOINT at the real webhook. (unchanged) */
export const LEAD_ENDPOINT = '/api/lead';
export async function submitLead(payload, endpoint = LEAD_ENDPOINT) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Lead endpoint answered ' + res.status);
  return true;
}
