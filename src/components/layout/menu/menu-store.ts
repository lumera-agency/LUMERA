"use client";
/* The site menu's open state, shared by whoever opens it (the header's and the topbar's burgers) and
   the sheet itself. It remembers who opened it, so focus goes back there on closing. */
import { useSyncExternalStore } from "react";

let open = false;
let opener: HTMLElement | null = null;
const listeners = new Set<() => void>();

export const menu = {
  get: () => open,
  set(value: boolean, from?: HTMLElement | null) {
    if (value === open) return;
    open = value;
    if (value) opener = from ?? (document.activeElement as HTMLElement | null);
    listeners.forEach((listener) => listener());
  },
  toggle(from?: HTMLElement | null) {
    menu.set(!open, from);
  },
  opener: () => opener,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
};

export const useMenuOpen = () => useSyncExternalStore(menu.subscribe, menu.get, () => false);
