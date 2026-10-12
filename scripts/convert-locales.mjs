// One-off: website-v2/locales/*.json (flat keys, inline HTML) → src/messages/*.json for next-intl.
//   flat "a.b.c" → nested { a: { b: { c } } }; a key that is both a string and a parent keeps its
//   string under ".text" (services.price.1 → services.price.1.text)
//   inline HTML → rich-text tags: <em class="hl"> → <hl>, <em class="sig"> → <sig>, <br> → <br></br>,
//   <a class="link" href="#contact"> → <contact>; <mark> stays <mark>
import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2] ?? "../website-v2/locales";
const rich = (s) =>
  s
    .replace(/<em class="hl">(.*?)<\/em>/g, "<hl>$1</hl>")
    .replace(/<em class="sig">(.*?)<\/em>/g, "<sig>$1</sig>")
    .replace(/<a class="link" href="#contact">(.*?)<\/a>/g, "<contact>$1</contact>")
    .replace(/<br\s*\/?>/g, "<br></br>");

for (const lang of ["uk", "ru"]) {
  const flat = JSON.parse(readFileSync(`${SRC}/${lang}.json`, "utf8"));
  const keys = Object.keys(flat);
  const parents = new Set(keys.filter((k) => keys.some((o) => o.startsWith(k + "."))));
  const out = {};
  for (const [key, value] of Object.entries(flat)) {
    const path = key.split(".");
    if (parents.has(key)) path.push("text");
    let node = out;
    for (const part of path.slice(0, -1)) node = node[part] ??= {};
    node[path.at(-1)] = rich(value);
  }
  writeFileSync(`src/messages/${lang}.json`, JSON.stringify(out, null, 2) + "\n");
  const left = JSON.stringify(out).match(/<(?!\/?(hl|sig|contact|br|mark)>)[a-z][^>]*>/g);
  console.log(lang, keys.length, "keys;", parents.size, "moved to .text;", "unconverted tags:", left ?? "none");
}
