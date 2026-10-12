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
  /** pull toward the cursor; a number scales it */
  magnetic?: boolean | number;
  /** extra element attributes (data-*) the page's scripts look for */
  children: React.ReactNode;
};

/** A link styled as a button: label + the rolling arrow. Primary carries the sheen on hover. */
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
