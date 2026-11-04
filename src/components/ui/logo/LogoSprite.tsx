import { MARK_DOT, MARK_PATHS } from "./mark";
import "./logo.css";

/** The logo mark (the L with its light), drawn once; every <LogoMark> reuses it via <use>. */
export function LogoSprite() {
  return (
    <svg className="sprite" width="0" height="0" aria-hidden="true" focusable="false">
      <symbol id="logo-mark" viewBox="0 0 329 329">
        {MARK_PATHS.map((path) => (
          <path key={path} d={path} />
        ))}
        <circle cx={MARK_DOT.cx} cy={MARK_DOT.cy} r={MARK_DOT.r} />
      </symbol>
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 329 329" aria-hidden="true" focusable="false">
      <use href="#logo-mark" />
    </svg>
  );
}
