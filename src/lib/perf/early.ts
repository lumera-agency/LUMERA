/*
 * The script that runs as the page is parsed, before anything is drawn (the layout puts it first in <body>).
 *
 * 1. The page's mode, FULL or LITE (lib/perf/mode.ts has the order of who decides). The device is looked at once a
 *    visit and kept (sessionStorage eclo:device): a phone is not looked at and stays FULL, with the preloader and the
 *    live stone (the owner, 12 Nov 2026, «верни как было»: for a day every phone was LITE); a computer gets a
 *    WebGL context made once for its renderer's name, then a score: 2 threads or fewer 3, 4 or fewer 1; 2 GB or less 3,
 *    4 GB or less 1; older built-in or phone-class graphics 2; Save-Data 2; a 2g connection 3, 3g 1; reduced motion 1.
 *    Three or more is LITE, so no single weak sign decides alone except the plainly weak ones.
 *    html gets .is-lite, data-mode and data-mode-why (the reason, for the monitor and for a look in the inspector).
 * 2. The intro's start states are hidden only when JS and motion are on (styles/base.css), and come back by
 *    themselves after 3.5 s should a script fail; while the preloader is still up they wait for it (up to 10 s).
 * 3. Reached through the page curtain (fx/page-curtain) the page comes up under it, html.is-curtain; should no script
 *    lift it, it goes after 6 s.
 *
 * Kept as text: it must run before the bundle. Its storage keys are the ones lib/perf/mode.ts names.
 */
export const EARLY_SCRIPT = `(function (root) {
  try { history.scrollRestoration = 'manual'; } catch (error) {}
  root.classList.add('js');
  var mode = 'full', why = 'default';
  try {
    var query = location.search;
    if (/[?&]lite=1/.test(query)) sessionStorage.setItem('eclo:lite', '1');
    else if (/[?&](lite=0|full=1)/.test(query)) sessionStorage.setItem('eclo:lite', '0');
    var tested = /[?&](lite=[01]|full=1)/.test(query) || sessionStorage.getItem('eclo:tested') === '1';
    if (tested) sessionStorage.setItem('eclo:tested', '1');
    var visit = sessionStorage.getItem('eclo:lite');
    // (the footer's switch is gone, the owner, 12 Nov 2026: a choice kept from it would hold the mode for good)
    try { localStorage.removeItem('eclo:mode'); } catch (error) {}
    var device = sessionStorage.getItem('eclo:device');
    if (!device) {
      var phone = matchMedia('(hover: none) and (pointer: coarse)').matches && Math.min(screen.width, screen.height) < 700;
      var limit = '', score = 0;
      if (!phone) {
        var renderer = '', context = null;
        try {
          context = document.createElement('canvas').getContext('webgl');
          var info = context && context.getExtension('WEBGL_debug_renderer_info');
          renderer = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
          var release = context && context.getExtension('WEBGL_lose_context');
          if (release) release.loseContext();
        } catch (error) {}
        if (!context) limit = 'no-webgl';
        else if (/swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer)) limit = 'software';
        var threads = navigator.hardwareConcurrency || 8, memory = navigator.deviceMemory || 8;
        var link = navigator.connection || {};
        score += threads <= 2 ? 3 : threads <= 4 ? 1 : 0;
        score += memory <= 2 ? 3 : memory <= 4 ? 1 : 0;
        if ((/intel/i.test(renderer) && !/iris|arc/i.test(renderer)) || /mali-(4|t)|adreno \\(tm\\) [1-5]\\d\\d|powervr|videocore/i.test(renderer)) score += 2;
        if (link.saveData) score += 2;
        if (/2g$/.test(link.effectiveType || '')) score += 3;
        else if (link.effectiveType === '3g') score += 1;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) score += 1;
      }
      device = (phone ? 'phone' : 'computer') + '|' + limit + '|' + score;
      sessionStorage.setItem('eclo:device', device);
    }
    var facts = device.split('|');
    if (facts[1]) { mode = 'lite'; why = facts[1]; }
    else if (tested && visit) { mode = visit === '1' ? 'lite' : 'full'; why = 'test'; }
    else if (visit === '1') { mode = 'lite'; why = 'slow'; }
    else if (+facts[2] >= 3) { mode = 'lite'; why = 'weak'; }
  } catch (error) {}
  if (mode === 'lite') root.classList.add('is-lite');
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-mode-why', why);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('motion');
  try {
    var curtainAt = +sessionStorage.getItem('eclo:curtain');
    sessionStorage.removeItem('eclo:curtain');
    var navigation = performance.getEntriesByType('navigation')[0];
    if (root.classList.contains('motion') && Date.now() - curtainAt < 8000 && (!navigation || navigation.type === 'navigate')) {
      root.classList.add('is-curtain');
      setTimeout(function () { root.classList.remove('is-curtain'); }, 6000);
    }
  } catch (error) {}
  var startedAt = Date.now();
  setTimeout(function ready() {
    if (document.querySelector('[data-preloader]') && Date.now() - startedAt < 10000) return setTimeout(ready, 250);
    root.classList.add('is-ready');
  }, 3500);
})(document.documentElement)`;
