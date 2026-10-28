import { studioName } from "@/config/site";
import { LogoMark } from "./LogoSprite";
import "./logo.css";

/** The studio's lockup: the mark and its name (config/site) in one line of mono caps (the preloader's brand line). */
export function Logo({ href, label, small = false, className, ...rest }: { href: string; label: string; small?: boolean; className?: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={["logo", small && "logo--sm", className].filter(Boolean).join(" ")} href={href} aria-label={label} {...rest}>
      <LogoContent />
    </a>
  );
}

/** The mark + the studio's name, config/site (for links that bring their own <a>, like the topbar's back-to-top). */
export function LogoContent() {
  return (
    <>
      <LogoMark className="logo__mark" />
      <span className="logo__mono">{studioName}</span>
    </>
  );
}
