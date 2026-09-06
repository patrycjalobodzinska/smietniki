/** Shared formatting helpers - keep locale/format decisions in one place. */

const PL = "pl-PL";

export function formatDateTime(value: string | number | Date): string {
  return new Intl.DateTimeFormat(PL, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat(PL, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** "5 min temu", "2 godz. temu" - relative time in Polish. */
export function formatRelative(value: string | number | Date): string {
  const diff = Date.now() - new Date(value).getTime();
  const rtf = new Intl.RelativeTimeFormat(PL, { numeric: "auto" });
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return rtf.format(-mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}
