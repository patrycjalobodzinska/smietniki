import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * Use this in every component that accepts a `className` prop.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
