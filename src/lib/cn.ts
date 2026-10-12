import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Class names: conditional (clsx) and Tailwind-conflict-free (tailwind-merge). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
