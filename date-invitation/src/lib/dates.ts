/**
 * Dates are kept as plain local calendar days ({ year, month, day }), never as
 * UTC instants. A date night on the 25th is the 25th wherever she opens this,
 * so there is no timezone arithmetic to get wrong.
 */
export interface CalendarDay {
  year: number;
  /** 0-based, like Date#getMonth(). */
  month: number;
  day: number;
}

export function today(now: Date = new Date()): CalendarDay {
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function compareDays(a: CalendarDay, b: CalendarDay): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function isSameDay(a: CalendarDay | null, b: CalendarDay | null): boolean {
  return !!a && !!b && compareDays(a, b) === 0;
}

export function isPast(day: CalendarDay, now: Date = new Date()): boolean {
  return compareDays(day, today(now)) < 0;
}

export function addDays(day: CalendarDay, n: number): CalendarDay {
  const d = new Date(day.year, day.month, day.day + n);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 2026-09-25 -> "20260925" (the compact form both Google and iCalendar use). */
export function toCompactDate(day: CalendarDay): string {
  return `${day.year}${pad(day.month + 1)}${pad(day.day)}`;
}

/** "19:30" -> { hours: 19, minutes: 30 }, or null for an empty/invalid value. */
export function parseTime(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function formatLongDate(day: CalendarDay): string {
  return new Date(day.year, day.month, day.day).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(value: string): string {
  const t = parseTime(value);
  if (!t) return '';
  return new Date(2000, 0, 1, t.hours, t.minutes).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
