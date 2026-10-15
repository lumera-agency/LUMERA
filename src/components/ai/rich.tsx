import { rich } from "@/lib/rich";

/** The AI pages' rich-text tags: the main page's (hl, b, br, contact → the form …) plus a title line that rises out of
 *  its own mask (the AI page's first screen) and a link to the calculator. */
export const aiRich = {
  ...rich,
  line: (chunks: React.ReactNode) => (
    <span className="ai-l">
      <span className="tone">{chunks}</span>
    </span>
  ),
  calc: (chunks: React.ReactNode) => (
    <a className="link" href="#calc">
      {chunks}
    </a>
  ),
};
