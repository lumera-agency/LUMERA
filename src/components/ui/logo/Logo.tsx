import { LogoMark } from "./LogoSprite";
import "./logo.css";

/** The LUMERA STUDIO lockup: the mark and the two-line wordmark. */
export function Logo({ href, label, small = false, className, ...rest }: { href: string; label: string; small?: boolean; className?: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={["logo", small && "logo--sm", className].filter(Boolean).join(" ")} href={href} aria-label={label} {...rest}>
      <LogoMark className="logo__mark" />
      <span className="logo__type">
        <span className="logo__word">LUMERA</span>
        <span className="logo__sub">STUDIO</span>
      </span>
    </a>
  );
}
