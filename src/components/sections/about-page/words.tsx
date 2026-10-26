import { Fragment } from "react";

/**
 * The page's text effects split a message into words on the server, so they play from the first paint (CSS, about.css)
 * and no word ever jumps. A message's own `<hl>…</hl>` (the heading's key word in ember) keeps its mark. Words break only
 * at plain spaces: the typesetting's no-break spaces stay inside a word, as they glue it. `word` gets each word and its
 * number counted from `from` (a block with several messages counts on).
 */
export function splitWords(raw: string, word: (w: string, i: number) => React.ReactNode, from = 0): React.ReactNode[] {
  let i = from;
  const out: React.ReactNode[] = [];
  const push = (text: string) =>
    text.split(" ").forEach((w, k) => {
      if (k) out.push(" ");
      if (w) out.push(<Fragment key={`w${i}`}>{word(w, i++)}</Fragment>);
    });
  for (const part of raw.split(/(<hl>[\s\S]*?<\/hl>)/)) {
    const hl = /^<hl>([\s\S]*)<\/hl>$/.exec(part);
    if (!hl) {
      push(part);
      continue;
    }
    const start = out.length;
    push(hl[1]);
    out.push(<em className="hl" key={`hl${i}`}>{out.splice(start)}</em>);
  }
  return out;
}

/** How many words splitWords makes of a message (the next one's `from`) */
export const countWords = (raw: string) => raw.replace(/<\/?hl>/g, "").split(" ").filter(Boolean).length;
