"use client";
/*
 * The contact pill beside the header's CTA: Telegram, Viber, and the phone, whose small card lists the two numbers
 * (config/contacts). The card opens on 150 ms of hover or a click, stays while the pointer is on the pill or the
 * card, closes 220 ms after it leaves, on Esc (focus back to the button) or a click outside.
 */
import { useEffect, useRef, useState } from "react";
import { useSiteNav } from "./SiteNavProvider";
import "./contacts.css";

export function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.5 4.2 3.4 10.8c-.8.3-.8 1.5.1 1.7l4.3 1.3 1.6 5c.2.7 1.1.9 1.6.4l2.4-2.3 4.5 3.3c.6.4 1.4.1 1.6-.6l2.6-13.1c.2-.9-.7-1.6-1.6-1.3Z" />
      <path d="m7.8 13.8 9.3-6.1-6.9 7.2-.6 3.9" />
    </svg>
  );
}

export function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.8c5.3 0 8.6 2.4 8.6 7.7s-3.3 7.8-8.6 7.8c-.8 0-1.6 0-2.3-.2L6.6 21v-3.5c-2.1-1.1-3.2-3.3-3.2-7 0-5.3 3.3-7.7 8.6-7.7Z" />
      <path d="M9.4 7.4c.4-.3 1-.2 1.2.2l.6 1.2c.2.4.1.8-.2 1.1l-.4.3c.4 1 1.2 1.8 2.2 2.2l.3-.4c.3-.3.7-.4 1.1-.2l1.2.6c.4.2.5.8.2 1.2-.6.8-1.4 1.1-2.3.8a7 7 0 0 1-4.7-4.7c-.3-.9 0-1.7.8-2.3Z" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.6 3.5h2.6l1.4 3.8-1.9 1.3a11 11 0 0 0 6.7 6.7l1.3-1.9 3.8 1.4v2.6a2 2 0 0 1-2.1 2A16.6 16.6 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1Z" />
    </svg>
  );
}

const INTENT = 150;
const GRACE = 220;

export function Contacts() {
  const nav = useSiteNav();
  const L = nav.labels;
  const c = nav.contacts;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const hoverOpened = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const back = root.current?.contains(document.activeElement);
      setOpen(false);
      if (back) button.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const mouse = (e: React.PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";
  const later = (fn: () => void, ms: number) => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  return (
    <div
      className="contacts"
      ref={root}
      onPointerLeave={(e) => mouse(e) && hoverOpened.current && later(() => setOpen(false), GRACE)}
      onPointerEnter={() => clearTimeout(timer.current)}
      onBlur={(e) => {
        if (open && e.relatedTarget && !root.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <a className="contacts__btn" href={c.telegram} target="_blank" rel="noopener" aria-label={L.telegram} title="Telegram">
        <TelegramIcon />
      </a>
      <a className="contacts__btn" href={c.viber} aria-label={L.viber} title="Viber">
        <ViberIcon />
      </a>
      <button
        ref={button}
        className="contacts__btn"
        type="button"
        aria-expanded={open}
        aria-controls="contacts-card"
        aria-label={L.phones}
        title={L.phones}
        onPointerEnter={(e) => {
          if (!mouse(e) || open) return;
          later(() => {
            hoverOpened.current = true;
            setOpen(true);
          }, INTENT);
        }}
        onPointerLeave={() => !open && clearTimeout(timer.current)}
        onClick={() => {
          clearTimeout(timer.current);
          if (open && hoverOpened.current) return void (hoverOpened.current = false); // a click keeps the hover's card
          hoverOpened.current = false;
          setOpen(!open);
        }}
      >
        <PhoneIcon />
      </button>

      <div className="contacts__card" id="contacts-card" hidden={!open}>
        <p className="contacts__k">{L.phones}</p>
        <ul>
          {c.phones.map((p) => (
            <li key={p.href}>
              <a className="contacts__phone" href={p.href} aria-label={`${L.call}: ${p.text}`}>
                <PhoneIcon />
                <span>{p.text}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="contacts__chats">
          <a href={c.telegram} target="_blank" rel="noopener">
            <TelegramIcon />
            Telegram
          </a>
          <a href={c.viber}>
            <ViberIcon />
            Viber
          </a>
        </div>
      </div>
    </div>
  );
}
