"use client";
import { useState } from "react";

/**
 * The lineup on a computer, as a price list (after 21st.dev's pricing lists and Feature Steps; the owner's pick, 30 Oct
 * 2026): every name and price on the left, the chosen one's scene and words beside them. Phones have the stack (Offer).
 */
export function OfferPicker({ items }: { items: { id: string; name: string; price: React.ReactNode; panel: React.ReactNode }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="ai-oa ai-wide">
      {items.map((it, i) => (
        <div className={`ai-oa__item${i === open ? " is-open" : ""}`} key={it.id}>
          <h3 className="ai-oa__h">
            <button className="ai-oa__head" type="button" aria-expanded={i === open} aria-controls={`oa-${it.id}`} onClick={() => setOpen(i)}>
              <span className="ai-oa__name">{it.name}</span>
              <span className="ai-oa__price">{it.price}</span>
            </button>
          </h3>
          <div className="ai-oa__panel" id={`oa-${it.id}`} hidden={i !== open}>{it.panel}</div>
        </div>
      ))}
    </div>
  );
}
