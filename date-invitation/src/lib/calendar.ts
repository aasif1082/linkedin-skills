import { CONFIG } from '../config';
import { addDays, parseTime, toCompactDate, type CalendarDay } from './dates';

/** Everything she chose on the planning screen. */
export interface DatePlan {
  day: CalendarDay;
  place: string;
  /** Optional "HH:MM" (24h) from the time input. Empty means an all-day event. */
  time: string;
  /** Optional note she wrote. */
  message: string;
}

/** A calendar event, independent of which calendar app it ends up in. */
export interface CalendarEvent {
  title: string;
  location: string;
  description: string;
  /**
   * Start/end in the compact form shared by Google Calendar and iCalendar:
   *  - all-day: "YYYYMMDD", with `end` being the day AFTER (exclusive end)
   *  - timed:   "YYYYMMDDTHHMMSS" with no "Z", i.e. "floating" local time,
   *             so 7pm stays 7pm in her own timezone.
   */
  start: string;
  end: string;
  allDay: boolean;
}

/** Turns her choices into a calendar event using the texts from CONFIG. */
export function buildEvent(plan: DatePlan): CalendarEvent {
  let description = CONFIG.EVENT_DESCRIPTION.replace('{signature}', CONFIG.YOUR_NAME);
  const note = plan.message.trim();
  if (note) description += `\n\nYour note: "${note}"`;

  const base = {
    title: CONFIG.EVENT_TITLE,
    location: plan.place.trim(),
    description,
  };

  const time = parseTime(plan.time);
  if (!time) {
    // All-day event: both Google and iCalendar treat the end date as exclusive,
    // so a one-day event on the 25th runs from 20260925 to 20260926.
    return {
      ...base,
      start: toCompactDate(plan.day),
      end: toCompactDate(addDays(plan.day, 1)),
      allDay: true,
    };
  }

  // Timed event. Let Date handle rollover (e.g. 23:00 + 2h lands on the next day).
  const startDate = new Date(plan.day.year, plan.day.month, plan.day.day, time.hours, time.minutes);
  const endDate = new Date(startDate.getTime() + CONFIG.EVENT_DURATION_HOURS * 60 * 60 * 1000);
  return { ...base, start: toLocalStamp(startDate), end: toLocalStamp(endDate), allDay: false };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local wall-clock time as "YYYYMMDDTHHMMSS" (no timezone suffix). */
function toLocalStamp(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

/** Current instant in UTC as "YYYYMMDDTHHMMSSZ" (for the iCalendar DTSTAMP). */
function toUtcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * GOOGLE CALENDAR
 *
 * Google Calendar has a public "event template" URL that opens the
 * "create event" page with fields pre-filled. No API key, no OAuth: she just
 * lands on the form (signed in to her own Google account) and taps Save.
 *
 *   https://calendar.google.com/calendar/render?action=TEMPLATE
 *     &text=<title>
 *     &dates=<start>/<end>      all-day: 20260925/20260926
 *                               timed:   20260925T190000/20260925T210000
 *     &details=<description>
 *     &location=<place>
 *     &ctz=<IANA timezone>      how to read the floating timed values
 *
 * Every value is percent-encoded with encodeURIComponent so emoji, commas,
 * ampersands and newlines in the description survive intact.
 * ────────────────────────────────────────────────────────────────────────── */
export function googleCalendarUrl(event: CalendarEvent, timeZone = localTimeZone()): string {
  const params: [string, string][] = [
    ['action', 'TEMPLATE'],
    ['text', event.title],
    ['dates', `${event.start}/${event.end}`],
    ['details', event.description],
    ['location', event.location],
  ];
  // Only meaningful for timed events; all-day events have no clock time.
  if (!event.allDay && timeZone) params.push(['ctz', timeZone]);

  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `https://calendar.google.com/calendar/render?${query}`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * OUTLOOK CALENDAR (outlook.live.com / Microsoft 365)
 *
 * Outlook's "compose event" deeplink works the same way as Google's: a plain
 * link that opens a pre-filled new-event form. Dates are ISO 8601; all-day
 * events use bare dates with `allday=true` and an exclusive end date, and
 * timed events use local wall-clock time without an offset.
 * ────────────────────────────────────────────────────────────────────────── */
export function outlookCalendarUrl(event: CalendarEvent): string {
  const params: [string, string][] = [
    ['path', '/calendar/action/compose'],
    ['rru', 'addevent'],
    ['subject', event.title],
    ['startdt', toIso(event.start)],
    ['enddt', toIso(event.end)],
    ['allday', String(event.allDay)],
    ['location', event.location],
    ['body', event.description],
  ];
  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `https://outlook.live.com/calendar/0/deeplink/compose?${query}`;
}

/** "20260925" -> "2026-09-25", "20260925T193000" -> "2026-09-25T19:30:00". */
function toIso(compact: string): string {
  const date = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  if (compact.length === 8) return date;
  return `${date}T${compact.slice(9, 11)}:${compact.slice(11, 13)}:${compact.slice(13, 15)}`;
}

function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * .ICS FILE (iCalendar, RFC 5545)
 *
 * A plain-text file that Apple Calendar, Outlook, Google Calendar, Samsung
 * Calendar, Thunderbird, etc. all import. The rules that matter:
 *
 *  1. Lines end with CRLF ("\r\n"), not just "\n".
 *  2. TEXT values escape  \  ;  ,  and newlines  (as \\  \;  \,  \n).
 *  3. Lines longer than 75 octets (bytes, not characters: ❤️ is 6 bytes)
 *     are "folded": split, with each continuation line starting with a space.
 *  4. All-day events use DTSTART;VALUE=DATE with an exclusive DTEND.
 *     Timed events use floating local time (no "Z", no TZID) so the date
 *     happens at the chosen wall-clock time in her timezone.
 *  5. Every event needs a UID and a DTSTAMP.
 * ────────────────────────────────────────────────────────────────────────── */
export function buildIcs(event: CalendarEvent, now: Date = new Date()): string {
  const dateProp = (name: string, value: string) =>
    event.allDay ? `${name};VALUE=DATE:${value}` : `${name}:${value}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Date Invitation//Will You Go On A Date With Me//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${now.getTime()}-${Math.random().toString(36).slice(2, 10)}@date-invitation`,
    `DTSTAMP:${toUtcStamp(now)}`,
    dateProp('DTSTART', event.start),
    dateProp('DTEND', event.end),
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    // A gentle nudge the day before (all-day) or two hours before (timed).
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(event.title)}`,
    `TRIGGER:${event.allDay ? '-P1D' : '-PT2H'}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Rule 2: escape iCalendar TEXT values. Backslash first, or it double-escapes. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * Rule 3: fold lines at 75 octets. Splits on whole code points (never inside
 * a multi-byte UTF-8 sequence, which would corrupt emoji).
 */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  // Continuation lines start with a space, which counts toward their 75.
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/**
 * Whether the page can offer a file download. Inside the claude.ai artifact
 * viewer (which provides `window.claude`) the sandbox blocks page-started
 * downloads and .ics files, so the .ics button is hidden there.
 */
export function canDownloadFiles(): boolean {
  return typeof (window as { claude?: unknown }).claude === 'undefined';
}

/** Triggers a download of the .ics file in the browser. */
export function downloadIcs(event: CalendarEvent, filename = 'our-date.ics'): void {
  const blob = new Blob([buildIcs(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
