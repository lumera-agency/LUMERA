import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { studioName } from "@/config/site";

/**
 * The share picture (og:image; twitter:image takes it from Open Graph) of every page, one template: the mark, the
 * studio's name (config/site) and the page's h1, from the same messages the h1 is set from. Each page's
 * opengraph-image.tsx names its title's keys; the locale comes from the route's [locale], not from a page render.
 *
 * Satori (next/og) reads ttf / otf / woff, not the site's woff2, so the picture has its own two faces, made with
 * fontTools from public/fonts (licences: public/fonts/LICENSES): Geologica 400 at SHRP 64 (the h1's setting) as a
 * static instance, latin + cyrillic merged; IBM Plex Mono 400, latin (the name line), converted as is.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/** Both locales' pictures are made at build: the layout's params do not reach a route handler such as this. */
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

const font = (file: string) => readFile(join(process.cwd(), "src/components/og/fonts", file));
const [geologica, plexMono] = await Promise.all([font("geologica-400-shrp64.ttf"), font("ibm-plex-mono-400-latin.ttf")]);

const BG = "#0a0a0a";
const INK = "#f6f6f3";
const EMBER = "#d2561c";
const TITLE = 84;
/** About this many characters of the title fit a line (the box is a little wider: the count is an estimate) */
const LINE = 22;

/** A word of the title: its pieces, the <hl> ones in ember. */
type Word = { text: string; hl: boolean }[];

const length = (line: Word[]) => line.reduce((n, word) => n + word.reduce((m, piece) => m + piece.text.length, 0), line.length - 1);

/** Greedy lines of at most `limit` characters (a longer word takes a line of its own). */
function wrap(words: Word[], limit: number) {
  const lines: Word[][] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last && length([...last, word]) <= limit) last.push(word);
    else lines.push([word]);
  }
  return lines;
}

/** text-wrap: balance, as the h1 has it: the fewest lines, as even as they go (by characters: Satori measures none for us). */
function balance(words: Word[]) {
  const count = wrap(words, LINE).length;
  let limit = LINE;
  while (limit > 1 && wrap(words, limit - 1).length === count) limit--;
  return wrap(words, limit);
}

/**
 * The title's lines as the h1 sets them: one per key and one per <line> inside a message, each balanced; <hl> marks
 * the key words. Satori lays every child out as a flex item and does not flow text across inline spans, so a line is
 * a row of words: split at plain spaces only, the typesetting's no-break spaces keep their words together.
 */
function titleLines(messages: string[]): Word[][] {
  return messages.flatMap((message) => {
    const lines = [...message.matchAll(/<line>([\s\S]*?)<\/line>/g)].map((m) => m[1]);
    return (lines.length ? lines : [message]).flatMap((line) => {
      const words: Word[] = [];
      let word: Word = [];
      let hl = false;
      for (const part of line.replace(/<(?!\/?hl>)[^>]*>/g, "").split(/(<\/?hl>)/)) {
        if (part === "<hl>" || part === "</hl>") {
          hl = part === "<hl>";
          continue;
        }
        part.split(" ").forEach((text, i) => {
          if (i > 0 && word.length) {
            words.push(word);
            word = [];
          }
          if (text) word.push({ text, hl });
        });
      }
      if (word.length) words.push(word);
      return balance(words);
    });
  });
}

/** The logo mark (components/ui/logo/LogoSprite), inline: Satori draws no <use href> and no outside SVG. */
function Mark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 329 329" fill={color}>
      <path d="M119 269.5C119 302.361 92.3609 329 59.5 329C26.6391 329 0 302.361 0 269.5C0 253.546 6.27877 239.059 16.5 228.375C26.7212 217.691 53 193.038 53 164.5C53 135.962 26.7212 111.309 16.5 100.625C6.27877 89.9406 0 75.4536 0 59.5C0 26.6391 26.6391 0 59.5 0C92.3609 0 119 26.6391 119 59.5C119 75.4536 112.721 89.9406 102.5 100.625C92.2788 111.309 66 135.962 66 164.5C66 193.038 92.2788 217.691 102.5 228.375C112.721 239.059 119 253.546 119 269.5Z" />
      <path d="M59.5 329C26.6391 329 0 302.361 0 269.5C1.4364e-06 236.639 26.6391 210 59.5 210C75.4536 210 89.9406 216.279 100.625 226.5C111.309 236.721 135.962 263 164.5 263C193.038 263 217.691 236.721 228.375 226.5C239.059 216.279 253.546 210 269.5 210C302.361 210 329 236.639 329 269.5C329 302.361 302.361 329 269.5 329C253.546 329 239.059 322.721 228.375 312.5C217.691 302.279 193.038 276 164.5 276C135.962 276 111.309 302.279 100.625 312.5C89.9406 322.721 75.4536 329 59.5 329Z" />
      <circle cx="270" cy="59" r="59" />
    </svg>
  );
}

/** The template: the lockup top left (as in the header), the title bottom left, the mark large and faint on the right. */
export function OgCard({ title, locale }: { title: string[]; locale: string }) {
  return (
    <div
      lang={locale}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px 72px",
        background: BG,
        backgroundImage: "radial-gradient(circle at 84% 46%, rgba(246, 246, 243, 0.07), rgba(10, 10, 10, 0) 48%)",
        color: INK,
        fontFamily: "Geologica",
      }}
    >
      {/* the opacity on the box, not the fill: the mark's shapes overlap */}
      <div style={{ position: "absolute", top: 118, right: 70, display: "flex", opacity: 0.06 }}>
        <Mark size={400} color={INK} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Mark size={52} color={INK} />
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 26, letterSpacing: 4.2, textTransform: "uppercase" }}>{studioName}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        {titleLines(title).map((line, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", columnGap: TITLE * 0.25, fontSize: TITLE, lineHeight: 1.05, letterSpacing: TITLE * -0.035 }}>
            {line.map((word, j) => (
              <div key={j} style={{ display: "flex" }}>
                {word.map((piece, k) => (
                  <span key={k} style={{ color: piece.hl ? EMBER : INK }}>{piece.text}</span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A page's opengraph-image: its title's message keys in, the picture in the route's locale out. */
export function ogImage(titleKeys: string[]) {
  return async function Image({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    const t = await getTranslations({ locale });
    return new ImageResponse(<OgCard title={titleKeys.map((key) => t.raw(key) as string)} locale={locale} />, {
      ...size,
      fonts: [
        { name: "Geologica", data: geologica, weight: 400, style: "normal" },
        { name: "IBM Plex Mono", data: plexMono, weight: 400, style: "normal" },
      ],
    });
  };
}
