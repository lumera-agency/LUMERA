import { ImageResponse } from "next/og";
import { MARK_DOT, MARK_PATHS, MARK_SIZE } from "@/components/ui/logo/mark";

/**
 * /logo.png: the studio's logo for search engines and AI assistants (the Organization's `logo` in components/seo/graph).
 * The site's own mark (components/ui/logo/mark) in the share pictures' ivory on their black, with the lime dot of the
 * favicon (the owner's pick, 17 Nov 2026), square, 512 px: Google asks
 * for 112 px at least and a picture that still reads on white. Made once, at build; a new mark in mark.ts is a new logo
 * here too.
 */
export const dynamic = "force-static";

const SIZE = 512;
/** The mark's share of the tile, as on the app icon (public/apple-touch-icon.png) */
const MARK = Math.round(SIZE * 0.6);

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <svg width={MARK} height={MARK} viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} fill="#f6f6f3">
          {MARK_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
          <circle cx={MARK_DOT.cx} cy={MARK_DOT.cy} r={MARK_DOT.r} fill="#daff02" />
        </svg>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
