"use client";
import { ButtonLink } from "@/components/ui/button/Button";

/**
 * «Обговорити» on a lineup card: to the form, with that product's quick pick on (the form's picks: the page's, in the
 * lineup's order), as the old panels did. Without the form's script it is a plain link to #contact.
 */
export function Talk({ pick, variant = "ghost", plain = false, children }: { pick: number; variant?: "ghost" | "primary"; /** a quiet text link: four buttons in a row outweighed the prices */ plain?: boolean; children: React.ReactNode }) {
  const go = (e: React.MouseEvent) => {
    e.preventDefault();
    const button = document.querySelectorAll<HTMLButtonElement>(".ai-pick")[pick];
    if (button && button.getAttribute("aria-pressed") !== "true") button.click();
    // (the form's module reads the page's address when it loads: it is fetched on the click, never on the server)
    import("@/components/sections/contact/lead-form.js").then(({ goToForm }) => goToForm(matchMedia("(prefers-reduced-motion: reduce)").matches));
  };
  if (plain) {
    return (
      <a className="ai-offer__talk" href="#contact" onClick={go}>
        <span>{children}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
      </a>
    );
  }
  return (
    <ButtonLink href="#contact" variant={variant} size="sm" onClick={go}>
      {children}
    </ButtonLink>
  );
}
