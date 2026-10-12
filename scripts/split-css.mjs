// One-off: split website-v2's stylesheets into per-component files (src/**), 1:1.
// Each rule goes to the component of its first BEM block (state classes like .js / .is-on are skipped);
// @media / @supports / @container wrappers are kept per file; rule order inside a file follows the
// original cascade (style.css → sections.css → why-orbit.css → configurator.css → accents.css).
// @keyframes and @property go to the file that uses them. 2 · Старт (removed in v2) is dropped.
//   node scripts/split-css.mjs ../website-v2/css
import postcss from "postcss";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SRC = process.argv[2] ?? "../website-v2/css";
const FILES = ["style.css", "sections.css", "why-orbit.css", "configurator.css", "accents.css"];

const T = {
  tokens: "src/styles/tokens.legacy.css",
  base: "src/styles/base.css",
  button: "src/components/ui/button/button.css",
  logo: "src/components/ui/logo/logo.css",
  header: "src/components/layout/header/header.css",
  topbar: "src/components/layout/topbar/topbar.css",
  footer: "src/components/layout/footer/footer.css",
  page: "src/components/layout/page/page.css",
  hero: "src/components/sections/hero/hero.css",
  preloader: "src/components/fx/preloader/preloader.css",
  what: "src/components/sections/what/what.css",
  services: "src/components/sections/services/services.css",
  demos: "src/components/sections/services/demos/demos.css",
  manifesto: "src/components/sections/manifesto/manifesto.css",
  why: "src/components/sections/why/why.css",
  approach: "src/components/sections/approach/approach.css",
  faq: "src/components/sections/faq/faq.css",
  contact: "src/components/sections/contact/contact.css",
  pricing: "src/components/sections/pricing/configurator.css",
  unsorted: "src/styles/unsorted.css",
  drop: null,
};

const BLOCKS = {
  button: ["btn", "arrow", "roll", "link"],
  logo: ["logo", "sprite"],
  header: ["header", "nav", "lang", "menu-toggle", "mobile-menu"],
  topbar: ["topbar"],
  footer: ["footer"],
  page: ["page", "spine", "section", "container", "s-head", "card", "tags", "chip", "visually-hidden", "skip-link", "t-d", "t-m", "hl", "sig"],
  hero: ["hero", "rail", "tone"],
  preloader: ["preloader"],
  what: ["what"],
  services: ["services", "service", "service-tab", "service-tabs", "svc-pick", "ride", "statement"],
  demos: ["demo", "demo-steps", "demo-replay", "mock-window", "marks", "cursor", "ripple", "rise", "mh", "sf", "gs", "sa", "au", "w"],
  manifesto: ["manifesto"],
  why: ["why", "w5", "st-glyph", "g"],
  approach: ["process", "stage", "stages", "after", "next"],
  faq: ["faq", "faq-wrap"],
  contact: ["contact", "lead-form", "field", "checks", "check", "get", "chips"],
  pricing: ["cfg", "pv", "pvw", "rb", "plan", "fd"],
  drop: ["start", "stone-scan"],
};
// demo internals are prefixed with their scene: d-cap, gs-plan, au-req, sa-kpi …
const PREFIX = [
  [/^d-/, "demos"], [/^gs-/, "demos"], [/^au-/, "demos"], [/^sa-/, "demos"], [/^mh__/, "demos"],
  [/^w5-/, "why"], [/^g-/, "why"], [/^cfg-/, "pricing"], [/^pv-/, "pricing"], [/^rb-/, "pricing"], [/^start/, "drop"],
];
const STATE = /^(js|motion|webgl|no-webgl|is-.*|has-.*|menu-open|intro-done|sections-ready|sections-css|i18n-pending|cfg-pending)$/;

const blockOf = (cls) => cls.split(/__|--/)[0];
const lookup = new Map(Object.entries(BLOCKS).flatMap(([t, list]) => list.map((b) => [b, t])));

function targetOfSelector(sel) {
  if (/^\s*:root\b/.test(sel)) return "tokens";
  const classes = [...sel.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]).filter((c) => !STATE.test(c));
  for (const cls of classes) {
    for (const [re, t] of PREFIX) if (re.test(cls)) return t;
    const t = lookup.get(blockOf(cls));
    if (t) return t;
    return "unsorted:" + blockOf(cls);
  }
  return "base"; // element-only selectors: html, body, a, :focus-visible …
}

const out = Object.fromEntries(Object.keys(T).map((k) => [k, postcss.root()]));
const unknown = new Map();
const pending = { keyframes: [], property: [] };

/** Clone `node` into target `t`, recreating the chain of at-rule wrappers `chain`. */
function place(t, node, chain) {
  let parent = out[t];
  for (const wrap of chain) {
    const last = parent.last;
    if (last && last.type === "atrule" && last.name === wrap.name && last.params === wrap.params) parent = last;
    else {
      const copy = wrap.clone({ nodes: [] });
      parent.append(copy);
      parent = copy;
    }
  }
  parent.append(node.clone());
}

function walk(container, chain, file) {
  container.each((node) => {
    if (node.type === "comment") return; // comments re-attach poorly once rules move: dropped
    if (node.type === "atrule") {
      if (node.name === "keyframes") return void pending.keyframes.push({ node, chain, file });
      if (node.name === "property") return void pending.property.push({ node, chain, file });
      if (node.name === "font-face") return; // fonts.css is ported by hand
      if (["media", "supports", "container", "layer"].includes(node.name) && node.nodes) return void walk(node, [...chain, node], file);
      return void place("base", node, chain);
    }
    if (node.type !== "rule") return;
    // split a selector list across targets when its parts belong to different components
    const groups = new Map();
    for (const sel of node.selectors) {
      let t = targetOfSelector(sel);
      if (t.startsWith("unsorted:")) {
        unknown.set(t.slice(9), (unknown.get(t.slice(9)) ?? 0) + 1);
        t = "unsorted";
      }
      if (t === "drop") continue;
      if (!groups.has(t)) groups.set(t, []);
      groups.get(t).push(sel);
    }
    for (const [t, sels] of groups) {
      const copy = node.clone({ selectors: sels });
      place(t, copy, chain);
    }
  });
}

for (const f of FILES) walk(postcss.parse(readFileSync(`${SRC}/${f}`, "utf8")), [], f);

// @keyframes / @property → every file that uses them (most are used in one)
const texts = () => Object.fromEntries(Object.keys(out).map((k) => [k, out[k].toString()]));
let body = texts();
for (const { node, chain } of pending.keyframes) {
  const re = new RegExp(`\\b${node.params.trim()}\\b`);
  const users = Object.keys(out).filter((k) => k !== "tokens" && re.test(body[k]));
  (users.length ? users : ["base"]).forEach((t) => place(t, node, chain));
}
body = texts();
for (const { node, chain } of pending.property) {
  const name = node.params.trim();
  const users = Object.keys(out).filter((k) => body[k].includes(`var(${name}`) || body[k].includes(`${name}:`));
  (users.length ? users : ["base"]).forEach((t) => out[t].prepend(node.clone()));
}

const HEAD = (k) => `/* ${k}: split 1:1 from website-v2/css by scripts/split-css.mjs (rule order kept) */\n`;
for (const [k, root] of Object.entries(out)) {
  if (!T[k] || !root.nodes.length) continue;
  mkdirSync(dirname(T[k]), { recursive: true });
  writeFileSync(T[k], HEAD(k) + root.toString().replace(/\n{3,}/g, "\n\n") + "\n");
  console.log(String(root.toString().split("\n").length).padStart(6), T[k]);
}
console.log("unsorted blocks:", Object.fromEntries(unknown));
