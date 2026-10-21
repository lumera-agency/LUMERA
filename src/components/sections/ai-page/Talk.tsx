"use client";
import { ButtonLink } from "@/components/ui/button/Button";

/**
 * «Обговорити» on a lineup card: to the form, with that product's quick pick on (the form's picks: the page's, in the
 * lineup's order), as the old panels did. Without the form's script it is a plain link to #contact.
 */
export function Talk({ pick, variant = "ghost", children }: { pick: number; variant?: "ghost" | "primary"; children: React.ReactNode }) {
  return (
    <ButtonLink
      href="#contact"
      variant={variant}
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        const button = document.querySelectorAll<HTMLButtonElement>(".ai-pick")[pick];
        if (button && button.getAttribute("aria-pressed") !== "true") button.click();
        // (the form's module reads the page's address when it loads: it is fetched on the click, never on the server)
        import("@/components/sections/contact/lead-form.js").then(({ goToForm }) => goToForm(matchMedia("(prefers-reduced-motion: reduce)").matches));
      }}
    >
      {children}
    </ButtonLink>
  );
}
