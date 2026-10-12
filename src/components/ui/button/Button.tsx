"use client";
import { useRef, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useMagnetic } from "@/components/fx/magnetic/useMagnetic";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import "./button.css";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "ghost" | "line";
  size?: "xs" | "sm";
  /** opt-in pull toward the cursor (fx/magnetic); the site's buttons don't use it */
  magnetic?: boolean | number;
  children: React.ReactNode;
};

/**
 * A link styled as a button (button.css). Primary: liquid rises with a running wave; ghost / line:
 * the fill sweeps up from the bottom. The arrow swaps on the diagonal.
 */
export function ButtonLink({ href, variant = "primary", size, magnetic = false, className, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, { strength: typeof magnetic === "number" ? magnetic : 1, enabled: Boolean(magnetic) });
  return (
    <a ref={ref} href={href} className={cn("btn", `btn--${variant}`, size && `btn--${size}`, className)} {...rest}>
      <span className="btn__label">{children}</span>
      <ArrowIcon />
    </a>
  );
}
