import { isValidElement, type ReactNode } from "react";

/**
 * The words a message renders, as plain text: a t() string or a rich one (t.rich, the price lines with their <b>, an
 * answer with a link in it). The structured data says what the page says, so it is read from the same nodes the page
 * shows. A <br> becomes a space; the typesetting's no-break spaces (lib/typeset) become plain ones.
 */
export function plainText(node: ReactNode): string {
  const walk = (n: ReactNode): string => {
    if (n == null || typeof n === "boolean") return "";
    if (typeof n === "string" || typeof n === "number" || typeof n === "bigint") return String(n);
    if (Array.isArray(n)) return n.map(walk).join("");
    if (isValidElement<{ children?: ReactNode }>(n)) return n.type === "br" ? " " : walk(n.props.children);
    if (typeof n === "object" && Symbol.iterator in n) return Array.from(n as Iterable<ReactNode>, walk).join("");
    return "";
  };
  return walk(node)
    .replace(/[   ]/g, " ")
    .replace(/­/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
