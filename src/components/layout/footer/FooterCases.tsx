"use client";
import { useEffect, useState } from "react";

/**
 * The footer map's cases. Phones: one row with a plus; a tap opens the list (each case leads to its own page or tab).
 * Wider screens: an open column, as the others.
 */
export function FooterCases({ label, items }: { label: string; items: { text: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 600px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return (
    <div className="footer__col footer__col--cases" data-open={open ? "" : undefined}>
      <p className="footer__k footer__k--col">{label}</p>
      <button className="footer__acc" type="button" aria-expanded={open} aria-controls="footer-cases" onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <i aria-hidden="true" />
      </button>
      <div className="footer__acc-body" id="footer-cases" inert={phone && !open}>
        <ul>
          {items.map((c) => (
            <li key={c.href}>
              <a className="footer__link" href={c.href}>
                <span>{c.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
