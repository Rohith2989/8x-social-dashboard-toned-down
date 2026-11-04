// 2_401_883 → "2.40M", 112_840 → "112.8K", 8_402 → "8.4K", 248 → "248"
export function compact(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${+(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export const full = (n: number) => Math.round(n).toLocaleString("en-US");

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "2026-10-24" → "24 Oct"; with the weekday → "Sat, 24 Oct". The day and its month never part at a line's end
export function day(iso: string, weekday = false) {
  const d = new Date(`${iso}T12:00:00Z`);
  const s = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return weekday ? `${WEEKDAYS[d.getUTCDay()]}, ${s}` : s;
}

export const weekdayOf = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();
