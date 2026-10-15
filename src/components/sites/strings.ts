import { getMessages } from "next-intl/server";

type Tree = { [key: string]: string | Tree };

/** The page's messages as the script reads them: the static page's flat keys (hero.title → sites.hero.title, x.sample →
 *  sample, st.1._ → sites.st.1), the rich tags taken out (the script writes text only). */
export async function sitesStrings(): Promise<Record<string, string>> {
  const tree = ((await getMessages()) as Tree).sites as Tree;
  const out: Record<string, string> = {};
  const walk = (node: Tree, path: string[]) => {
    for (const [k, v] of Object.entries(node)) {
      const next = k === "_" ? path : [...path, k];
      if (typeof v === "string") {
        const flat = next[0] === "x" ? next.slice(1).join(".") : ["sites", ...next].join(".");
        out[flat] = v.replace(/<\/?\w+>/g, "");
      } else walk(v, next);
    }
  };
  walk(tree, []);
  return out;
}
