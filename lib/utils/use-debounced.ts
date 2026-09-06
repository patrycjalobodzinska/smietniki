"use client";

import { useEffect, useState } from "react";

/**
 * Value that trails `value` by `delay` ms. Used for search inputs so a query
 * key changes once the user stops typing, not on every keystroke.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
