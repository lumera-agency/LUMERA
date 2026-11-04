"use client";
/*
 * The contact pill beside the header's CTA: Telegram, Viber, and the phone, whose small card lists the two numbers
 * (config/contacts). The card opens on 150 ms of hover or a click, stays while the pointer is on the phone or the
 * card, closes 220 ms after it leaves the pill, at once when it moves on to Telegram or Viber, on Esc (focus back to the
 * button) or a click outside.
 */
import { useEffect, useRef, useState } from "react";
import { useSiteNav } from "./SiteNavProvider";
import "./contacts.css";

/* The icons, solid (the owner, 3 Nov: the outlined ones read as drawn by hand): Telegram's plane with its fold cut
   through, Viber's bubble with the handset cut out of it, the handset with two waves. A hover in the pill sets them
   moving (contacts.css). Used in the menu and the footer too. */
export function TelegramIcon() {
  return (
    <svg className="ico ico--tg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M21.4 3.3 2.5 10.6c-.8.3-.7 1.4.1 1.6l5 1.6 1.8 5.4c.2.6 1 .8 1.5.3l2.6-2.4 4.8 3.5c.6.4 1.4.1 1.6-.6L22.6 4.6c.2-.9-.5-1.6-1.2-1.3ZM8.9 13.5l8.6-6.3-7.1 7.4-.6 3.2-.9-4.3Z" />
    </svg>
  );
}

export function ViberIcon() {
  return (
    <svg className="ico ico--viber" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        d="M12 2.4c5.7 0 9 2.5 9 8.1s-3.3 8.1-9 8.1c-.7 0-1.4 0-2-.1l-3 2.9c-.4.4-1 .1-1-.4v-3.2c-2.2-1.2-3-3.5-3-7.3 0-5.6 3.3-8.1 9-8.1ZM15.58 12.05c-.57 0-1.11-.09-1.62-.26-.16-.06-.34-.01-.46.11l-.72.91c-1.3-.62-2.52-1.79-3.17-3.14l.9-.76c.12-.13.16-.31.11-.47-.17-.51-.26-1.06-.26-1.62 0-.25-.21-.46-.46-.46H8.31C8.06 6.36 7.76 6.47 7.76 6.82c0 4.27 3.56 7.82 7.82 7.82.33 0 .46-.29.46-.54v-1.59c0-.25-.21-.46-.46-.46Z"
      />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg className="ico ico--phone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M18.61 15.64c-1.11 0-2.18-.18-3.18-.5-.32-.11-.67-.03-.91.22l-1.41 1.77c-2.55-1.22-4.93-3.51-6.2-6.15l1.75-1.49c.24-.25.32-.6.22-.92-.33-1-.5-2.07-.5-3.18 0-.49-.41-.89-.89-.89H4.37c-.48 0-1.07.22-1.07.89 0 8.36 6.96 15.31 15.31 15.31.64 0 .89-.57.89-1.06v-3.11c0-.49-.41-.89-.89-.89Z" />
      <path className="ico__wave" d="M14.4 7a2.7 2.7 0 0 1 2.6 2.6" />
      <path className="ico__wave" d="M14.6 3.6a6 6 0 0 1 5.8 5.8" />
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
  /** The pointer moved on to Telegram or Viber: the phone's card (opened by the hover) goes at once. */
  const leavePhone = (e: React.PointerEvent) => {
    if (!mouse(e)) return;
    clearTimeout(timer.current);
    if (open && hoverOpened.current) setOpen(false);
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
      <a className="contacts__btn" href={c.telegram} target="_blank" rel="noopener" aria-label={L.telegram} title="Telegram" onPointerEnter={leavePhone}>
        <TelegramIcon />
      </a>
      <a className="contacts__btn" href={c.viber} aria-label={L.viber} title="Viber" onPointerEnter={leavePhone}>
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
