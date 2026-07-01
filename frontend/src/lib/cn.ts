import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
