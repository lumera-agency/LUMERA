"use client";
import { useState } from "react";

/**
 * The form's optional part: on a phone it waits behind one line, so the form is two fields and a button; a computer
 * shows it as it is (ai.css). A quick pick pressed from the page (Talk) opens it, so the reader sees what was added.
 */
export function FormMore({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ai-fmore${open ? " is-open" : ""}`} onClickCapture={(e) => { if ((e.target as HTMLElement).closest(".ai-pick")) setOpen(true); }}>
      <button className="ai-fmore__btn" type="button" aria-expanded={open} onClick={() => setOpen(true)}>{label}</button>
      <div className="ai-fmore__body">{children}</div>
    </div>
  );
}
