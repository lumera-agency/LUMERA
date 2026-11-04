/*
 * The four links' tiny UI glyphs (72 × 44, inline SVG): Поиск, Сайт, Заявка, Откуда заявка. Their short stories
 * play from why-orbit.js (STORIES, playStory); the classes are its parts.
 */
export type WhyLink = "search" | "site" | "lead" | "source";

const SVGS: Record<WhyLink, React.ReactNode> = {
  search: (
    <svg viewBox="0 0 72 44" focusable="false">
      <rect className="g-l" x=".5" y=".5" width="71" height="12" rx="6" />
      <circle className="g-l" cx="7.5" cy="6.5" r="2.5" />
      <path className="g-l" d="m9.4 8.4 2.1 2.1" />
      <rect className="g-f2 g-q" x="15" y="5.5" width="26" height="2" rx="1" />
      <rect className="g-caret" x="42.5" y="3.5" width="1" height="6" />
      <rect className="g-hl" x="-3.5" y="16.5" width="58" height="13" rx="3" />
      <g className="g-r1">
        <rect className="g-ac" x=".5" y="19.5" width="9" height="5" rx="1.25" />
        <rect className="g-on" x=".5" y="19.5" width="9" height="5" rx="1.25" />
        <rect className="g-f2" x="13" y="19" width="36" height="3" rx="1.5" />
        <rect className="g-f" x="13" y="25" width="22" height="2" rx="1" />
      </g>
      <rect className="g-f g-r2" x="0" y="34" width="56" height="2" rx="1" />
      <rect className="g-f g-r3" x="0" y="40" width="42" height="2" rx="1" />
    </svg>
  ),
  site: (
    <svg viewBox="0 0 72 44" focusable="false">
      <rect className="g-l" x=".5" y=".5" width="71" height="43" rx="4.5" />
      <path className="g-l" d="M.5 9.5h71" />
      <circle className="g-d" cx="5.5" cy="5" r="1.25" />
      <circle className="g-d" cx="9.5" cy="5" r="1.25" />
      <circle className="g-d" cx="13.5" cy="5" r="1.25" />
      <rect className="g-f2 g-b1" x="7" y="16" width="30" height="4" rx="2" />
      <rect className="g-f g-b2" x="7" y="24" width="22" height="2" rx="1" />
      <g className="g-b3">
        <rect className="g-ac" x="7" y="31" width="15" height="6" rx="3" />
        <rect className="g-on" x="7" y="31" width="15" height="6" rx="3" />
      </g>
      <g className="g-b4">
        <rect className="g-l" x="44.5" y="15.5" width="20" height="22" rx="3" />
        <circle className="g-f" cx="54.5" cy="26.5" r="5" />
      </g>
    </svg>
  ),
  lead: (
    <svg viewBox="0 0 72 44" focusable="false">
      <g className="g-card">
        <rect className="g-l" x=".5" y="9.5" width="71" height="25" rx="7" />
        <circle className="g-l" cx="13" cy="22" r="6.5" />
        <path
          className="g-l"
          d="M9 22.3l8.6-3.7-1.8 7.9-2.9-2.3-1.6 1.5v-2.5l4.4-3.8"
        />
        <rect className="g-f2" x="24" y="16.5" width="26" height="3" rx="1.5" />
        <rect className="g-f" x="24" y="24" width="36" height="2" rx="1" />
      </g>
      <circle className="g-ping" cx="66" cy="9.5" r="3.5" />
      <g className="g-dot">
        <circle className="g-ac" cx="66" cy="9.5" r="3" />
        <circle className="g-on" cx="66" cy="9.5" r="3" />
      </g>
    </svg>
  ),
  source: (
    <svg viewBox="0 0 72 44" focusable="false">
      <g className="g-tag">
        <path
          className="g-l"
          d="M.5 3.5a3 3 0 0 1 3-3h33l6 6-6 6h-33a3 3 0 0 1-3-3z"
        />
        <circle className="g-ac" cx="6.5" cy="6.5" r="1.6" />
        <circle className="g-on" cx="6.5" cy="6.5" r="1.6" />
        <rect className="g-f2" x="11" y="5.5" width="22" height="2" rx="1" />
      </g>
      <path className="g-l" d="M.5 43.5h71" />
      <rect className="g-f g-bar" x="4" y="32" width="9" height="11" rx="1" />
      <rect className="g-f2 g-bar" x="18" y="18" width="9" height="25" rx="1" />
      <rect className="g-f g-bar" x="32" y="35" width="9" height="8" rx="1" />
      <rect className="g-f g-bar" x="46" y="27" width="9" height="16" rx="1" />
    </svg>
  ),
};

export function WhyGlyph({
  link,
  className = "w5-glyph",
}: {
  link: WhyLink;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      {SVGS[link]}
    </span>
  );
}
