import { useMemo, useState } from 'react';
import { daysInMonth, formatLongDate, isPast, isSameDay, today, type CalendarDay } from '../lib/dates';

interface Props {
  value: CalendarDay | null;
  onChange: (day: CalendarDay) => void;
}

const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  // 2023-01-01 was a Sunday, so this yields localized Sun..Sat initials.
  new Date(2023, 0, 1 + i).toLocaleDateString(undefined, { weekday: 'narrow' }),
);

/**
 * A small month calendar. Past days are disabled (not just styled), today gets
 * a ring, and the selected day is filled. Months before the current one can't
 * be navigated to at all.
 */
export function Calendar({ value, onChange }: Props) {
  const now = today();
  const [view, setView] = useState(() => ({
    year: (value ?? now).year,
    month: (value ?? now).month,
  }));

  const atCurrentMonth = view.year === now.year && view.month === now.month;

  const cells = useMemo(() => {
    const leading = new Date(view.year, view.month, 1).getDay();
    const total = daysInMonth(view.year, view.month);
    const list: (CalendarDay | null)[] = Array(leading).fill(null);
    for (let d = 1; d <= total; d++) list.push({ year: view.year, month: view.month, day: d });
    return list;
  }, [view]);

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => shiftMonth(-1)}
          disabled={atCurrentMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="calendar-month" aria-live="polite">
          {monthLabel}
        </div>
        <button
          type="button"
          className="calendar-nav"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-grid calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="calendar-grid" role="group" aria-label={monthLabel}>
        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;
          const past = isPast(day);
          const selected = isSameDay(day, value);
          const isToday = isSameDay(day, now);
          const classes = [
            'calendar-day',
            past && 'is-past',
            isToday && 'is-today',
            selected && 'is-selected',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={day.day}
              type="button"
              className={classes}
              disabled={past}
              aria-pressed={selected}
              aria-label={`${formatLongDate(day)}${isToday ? ' (today)' : ''}`}
              onClick={() => onChange(day)}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
