/**
 * Google Analytics 4 (the owner, 17 Nov 2026: the property «ECLO — eclo.com.ua», his file eclo-ga4-code.html). The
 * root layout writes this script into every page of the production build only (previews and local hosts send nothing),
 * as the body's first markup, next to Vercel's analytics. What it counts:
 * - page views (GA4's own, history changes included);
 * - a click on tel: → click_phone_<page>, on t.me → click_telegram_<page>, on Viber → click_viber_<page>;
 * - a lead the server took → lead_form_<page> (the form calls window.ecloTrackLead: sections/contact/lead-form.js).
 * <page> is the page the click or the lead happened on, each page its own (the owner, 17 Nov 2026: «на каждой странице
 * четко отдельно»), the Russian version under the same name (its page_path starts with /ru). Google Ads ties a lead to
 * its ad click by itself; the name only says where it happened.
 * Changed from his file: no service carried over from page to page; Google's gtag.js loads once the page has loaded
 * (the first screen does not wait for it; the events wait in dataLayer); visitors from the EEA, the UK and Switzerland
 * get no cookies (Consent Mode, denied by default: the site has no consent banner). The content policy lets Google's
 * hosts in (next.config.ts) and the privacy page says what is counted (messages/privacy).
 */
export const GA4_ID = "G-XJ7WSKTEC6";

/** each page's name in the events: its path without the language, as app/[locale] has them */
export const GA4_PAGES: Record<string, string> = {
  "": "home",
  "dyzain-i-saity": "dyzain",
  "reklama-i-analityka": "reklama",
  "ai-avtomatyzatsiia": "ai",
  "keisy/poshuk-zamovlen": "keis_brygada",
  "keisy/ai-asystent": "keis_salon",
  kontakty: "kontakty",
  "pro-nas": "pro_nas",
  "polityka-konfidentsiinosti": "polityka",
};

/** where cookies wait for a consent the site never asks for: the EEA, the UK, Switzerland */
const NO_COOKIES = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH".split(" ");

export const GA4_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', region:${JSON.stringify(NO_COOKIES)}});
gtag('js', new Date());
gtag('config', '${GA4_ID}');
(function () {
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') load();
  else { addEventListener('load', load, { once: true }); setTimeout(load, 4000); }

  var PAGES = ${JSON.stringify(GA4_PAGES)};
  function pageName() {
    var p = location.pathname.toLowerCase().replace(/^\\/ru(?=\\/|$)/, '').replace(/^\\/+|\\/+$/g, '');
    if (Object.prototype.hasOwnProperty.call(PAGES, p)) return PAGES[p];
    return p.indexOf('lab') === 0 ? 'lab' : 'other';
  }
  function send(base, params) {
    params = params || {};
    params.page_path = location.pathname;
    gtag('event', base + '_' + pageName(), params);
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = (a.getAttribute('href') || '').toLowerCase();
    var base = null;
    if (h.indexOf('tel:') === 0) base = 'click_phone';
    else if (h.indexOf('t.me/') > -1 || h.indexOf('telegram.me/') > -1 || h.indexOf('tg://') === 0) base = 'click_telegram';
    else if (h.indexOf('viber://') === 0 || h.indexOf('viber.me') > -1 || h.indexOf('viber.com/') > -1) base = 'click_viber';
    if (base) send(base, { link_url: a.href });
  }, true);
  window.ecloTrackLead = function (formName) { send('lead_form', { form_name: formName || 'contact' }); };
})();
`;
