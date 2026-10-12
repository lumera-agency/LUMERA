import { LogoMark } from "./LogoSprite";
import "./logo.css";

/** The LUMERA STUDIO lockup: the mark and one line of mono caps (the preloader's brand line). */
export function Logo({ href, label, small = false, className, ...rest }: { href: string; label: string; small?: boolean; className?: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={["logo", small && "logo--sm", className].filter(Boolean).join(" ")} href={href} aria-label={label} {...rest}>
      <LogoContent />
    </a>
  );
}

/** The mark + «Lumera Studio» (for links that bring their own <a>, like the topbar's back-to-top). */
export function LogoContent() {
  return (
    <>
      <LogoMark className="logo__mark" />
      <span className="logo__mono">Lumera Studio</span>
    </>
  );
}
