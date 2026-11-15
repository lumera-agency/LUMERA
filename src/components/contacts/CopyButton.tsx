"use client";
/*
 * Copies a phone or the mail (on a computer a «tel:» link has nowhere to go): the button's mark turns into a lime
 * check and a small note says it is done, for 1.8 s.
 */
import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" className={copied ? "kt-copy is-done" : "kt-copy"} onClick={copy} aria-label={`${label}: ${text}`} title={label}>
      <svg className="kt-copy__ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
        <path d="M15.5 5.5v-.25A1.75 1.75 0 0 0 13.75 3.5h-8.5A1.75 1.75 0 0 0 3.5 5.25v8.5c0 .97.78 1.75 1.75 1.75h.25" />
      </svg>
      <svg className="kt-copy__ok" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m5 12.5 4.2 4.2L19 7" />
      </svg>
      <span className="kt-copy__note" role="status">{copied ? done : ""}</span>
    </button>
  );
}
