"use client";
import { useRef, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useMagnetic } from "@/components/fx/magnetic/useMagnetic";
import { RunLabel } from "@/components/fx/run-label/RunLabel";
import { useRunLabel } from "@/components/fx/run-label/useRunLabel";
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
 * A link styled as a button. Hover: it keeps its colour and glows a little, the label runs like a
 * ticker (fx/run-label), the arrow leaves up-right as its copy comes in.
 */
export function ButtonLink({ href, variant = "primary", size, magnetic = false, className, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, { strength: typeof magnetic === "number" ? magnetic : 1, enabled: Boolean(magnetic) });
  useRunLabel(ref);
  return (
    <a ref={ref} href={href} className={cn("btn", `btn--${variant}`, size && `btn--${size}`, className)} {...rest}>
      <span className="btn__label">{typeof children === "string" ? <RunLabel>{children}</RunLabel> : children}</span>
      <ArrowIcon />
    </a>
  );
}
