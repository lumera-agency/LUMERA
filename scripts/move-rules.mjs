// Move the rules whose selector matches a pattern from one stylesheet to another (order kept,
// @media wrappers recreated). node scripts/move-rules.mjs <from.css> <to.css> <regex>
import postcss from "postcss";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const [from, to, pattern] = process.argv.slice(2);
const re = new RegExp(pattern);
const src = postcss.parse(readFileSync(from, "utf8"));
const dst = existsSync(to) ? postcss.parse(readFileSync(to, "utf8")) : postcss.root();
let moved = 0;
src.walkRules((rule) => {
  if (!re.test(rule.selector)) return;
  const chain = [];
  for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) chain.unshift(p);
  let parent = dst;
  for (const at of chain) {
    const last = parent.last;
    if (last && last.type === "atrule" && last.name === at.name && last.params === at.params) parent = last;
    else { const c = at.clone({ nodes: [] }); parent.append(c); parent = c; }
  }
  parent.append(rule.clone());
  const holder = rule.parent;
  rule.remove();
  moved++;
  if (holder.type === "atrule" && !holder.nodes.length) holder.remove();
});
mkdirSync(dirname(to), { recursive: true });
writeFileSync(from, src.toString());
writeFileSync(to, dst.toString().trim() + "\n");
console.log(`moved ${moved} rules → ${to}`);
