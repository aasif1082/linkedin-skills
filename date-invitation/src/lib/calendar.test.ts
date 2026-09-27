import { describe, expect, it } from 'vitest';
import {
  buildEvent,
  buildIcs,
  escapeText,
  foldLine,
  googleCalendarUrl,
  outlookCalendarUrl,
} from './calendar';
import { isPast, parseTime } from './dates';

const EXPECTED_DESCRIPTION =
  "It's a date! ❤️\n\n" +
  'You said YES, so now you officially have a date with me.\n\n' +
  "Can't wait to see you.\n\n" +
  '— Your favourite person ❤️';

// The example from the brief: 25 September 2026, "Some Restaurant, Bangalore".
const plan = {
  day: { year: 2026, month: 8, day: 25 },
  place: 'Some Restaurant, Bangalore',
  time: '',
  message: '',
};

describe('buildEvent', () => {
  it('builds an all-day event with an exclusive end date', () => {
    const event = buildEvent(plan);
    expect(event).toMatchObject({
      title: 'Date with ❤️',
      location: 'Some Restaurant, Bangalore',
      description: EXPECTED_DESCRIPTION,
      start: '20260925',
      end: '20260926',
      allDay: true,
    });
  });

  it('rolls the end over month boundaries', () => {
    const event = buildEvent({ ...plan, day: { year: 2026, month: 8, day: 30 } });
    expect(event.end).toBe('20261001');
  });

  it('builds a timed event in floating local time', () => {
    const event = buildEvent({ ...plan, time: '19:30' });
    expect(event).toMatchObject({ start: '20260925T193000', end: '20260925T213000', allDay: false });
  });

  it('rolls a late timed event into the next day', () => {
    const event = buildEvent({ ...plan, time: '23:00' });
    expect(event.end).toBe('20260926T010000');
  });

  it('appends her note to the description', () => {
    const event = buildEvent({ ...plan, message: '  Wear the blue shirt  ' });
    expect(event.description).toBe(`${EXPECTED_DESCRIPTION}\n\nYour note: "Wear the blue shirt"`);
  });
});

describe('googleCalendarUrl', () => {
  it('pre-fills every field of the brief example', () => {
    const url = new URL(googleCalendarUrl(buildEvent(plan), 'Asia/Kolkata'));
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Date with ❤️');
    expect(url.searchParams.get('dates')).toBe('20260925/20260926');
    expect(url.searchParams.get('location')).toBe('Some Restaurant, Bangalore');
    expect(url.searchParams.get('details')).toBe(EXPECTED_DESCRIPTION);
    // All-day events carry no timezone.
    expect(url.searchParams.has('ctz')).toBe(false);
  });

  it('adds the timezone for timed events', () => {
    const url = new URL(googleCalendarUrl(buildEvent({ ...plan, time: '19:00' }), 'Asia/Kolkata'));
    expect(url.searchParams.get('dates')).toBe('20260925T190000/20260925T210000');
    expect(url.searchParams.get('ctz')).toBe('Asia/Kolkata');
  });

  it('encodes characters that would break the query string', () => {
    const url = googleCalendarUrl(buildEvent({ ...plan, place: 'Tom & Jerry’s #1 ?' }));
    expect(url).not.toContain(' ');
    expect(new URL(url).searchParams.get('location')).toBe('Tom & Jerry’s #1 ?');
  });
});

describe('outlookCalendarUrl', () => {
  it('pre-fills an all-day event', () => {
    const url = new URL(outlookCalendarUrl(buildEvent(plan)));
    expect(url.origin + url.pathname).toBe('https://outlook.live.com/calendar/0/deeplink/compose');
    expect(url.searchParams.get('subject')).toBe('Date with ❤️');
    expect(url.searchParams.get('startdt')).toBe('2026-09-25');
    expect(url.searchParams.get('enddt')).toBe('2026-09-26');
    expect(url.searchParams.get('allday')).toBe('true');
    expect(url.searchParams.get('location')).toBe('Some Restaurant, Bangalore');
    expect(url.searchParams.get('body')).toBe(EXPECTED_DESCRIPTION);
  });

  it('pre-fills a timed event', () => {
    const url = new URL(outlookCalendarUrl(buildEvent({ ...plan, time: '19:30' })));
    expect(url.searchParams.get('startdt')).toBe('2026-09-25T19:30:00');
    expect(url.searchParams.get('enddt')).toBe('2026-09-25T21:30:00');
    expect(url.searchParams.get('allday')).toBe('false');
  });
});

describe('buildIcs', () => {
  const now = new Date(Date.UTC(2026, 8, 26, 10, 0, 0));
  const ics = buildIcs(buildEvent(plan), now);
  const unfolded = ics.replace(/\r\n /g, '');

  it('uses CRLF line endings and no bare LF', () => {
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('keeps every physical line within 75 octets', () => {
    const encoder = new TextEncoder();
    for (const line of ics.split('\r\n')) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('contains the required structure and values', () => {
    expect(unfolded).toMatch(/^BEGIN:VCALENDAR\r\nVERSION:2.0\r\n/);
    expect(unfolded).toContain('DTSTART;VALUE=DATE:20260925\r\n');
    expect(unfolded).toContain('DTEND;VALUE=DATE:20260926\r\n');
    expect(unfolded).toContain('DTSTAMP:20260926T100000Z\r\n');
    expect(unfolded).toContain('SUMMARY:Date with ❤️\r\n');
    expect(unfolded).toContain('LOCATION:Some Restaurant\\, Bangalore\r\n');
    expect(unfolded).toContain(`DESCRIPTION:${escapeText(EXPECTED_DESCRIPTION)}\r\n`);
    expect(unfolded).toMatch(/UID:\S+@date-invitation\r\n/);
    expect(unfolded.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('writes timed events without VALUE=DATE', () => {
    const timed = buildIcs(buildEvent({ ...plan, time: '19:00' }), now);
    expect(timed).toContain('DTSTART:20260925T190000\r\n');
    expect(timed).toContain('DTEND:20260925T210000\r\n');
  });
});

describe('ics helpers', () => {
  it('escapes backslash, semicolon, comma and newlines', () => {
    expect(escapeText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
  });

  it('never splits a multi-byte character when folding', () => {
    const folded = foldLine('DESCRIPTION:' + '❤️'.repeat(40));
    const decoded = folded.split('\r\n ').join('');
    expect(decoded).toBe('DESCRIPTION:' + '❤️'.repeat(40));
    for (const part of folded.split('\r\n')) {
      expect(part).not.toContain('�');
    }
  });
});

describe('dates', () => {
  const now = new Date(2026, 8, 26, 15, 0);
  it('treats yesterday as past and today as selectable', () => {
    expect(isPast({ year: 2026, month: 8, day: 25 }, now)).toBe(true);
    expect(isPast({ year: 2026, month: 8, day: 26 }, now)).toBe(false);
    expect(isPast({ year: 2027, month: 0, day: 1 }, now)).toBe(false);
  });

  it('parses times strictly', () => {
    expect(parseTime('19:30')).toEqual({ hours: 19, minutes: 30 });
    expect(parseTime('')).toBeNull();
    expect(parseTime('25:00')).toBeNull();
  });
});
