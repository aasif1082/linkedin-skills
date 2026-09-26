import { useState, type FormEvent } from 'react';
import { CONFIG } from '../config';
import type { DatePlan } from '../lib/calendar';
import { formatLongDate, isPast, type CalendarDay } from '../lib/dates';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Card } from './Card';

interface Props {
  initial: DatePlan | null;
  onConfirm: (plan: DatePlan) => void;
}

/** Screen 4: pick a day, a place, an optional time and an optional note. */
export function PlanScreen({ initial, onConfirm }: Props) {
  // Drop a previously chosen day if it has since slipped into the past.
  const [day, setDay] = useState<CalendarDay | null>(
    initial && !isPast(initial.day) ? initial.day : null,
  );
  const [place, setPlace] = useState(initial?.place ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');

  const canConfirm = day !== null && place.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!day || !canConfirm) return;
    onConfirm({ day, place: place.trim(), time, message: message.trim() });
  };

  let hint = '';
  if (!day && !place.trim()) hint = 'Pick a day and a place first 🥰';
  else if (!day) hint = 'Now pick a day on the calendar 📅';
  else if (!place.trim()) hint = 'And tell me where we are going 📍';

  return (
    <Card className="plan">
      <p className="eyebrow">Now comes the important part…</p>
      <h1 className="title">Okay, where and when are we going?</h1>
      <p className="muted">When are you free to make a little memory with me?</p>

      <form className="plan-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <span className="field-label" id="date-label">
            Pick a day
          </span>
          <Calendar value={day} onChange={setDay} />
          <p className={`selected-date ${day ? 'has-date' : ''}`} aria-live="polite">
            {day ? `📅 ${formatLongDate(day)}` : 'No day picked yet'}
          </p>
        </div>

        <label className="field">
          <span className="field-label">
            What time? <span className="optional">(optional)</span>
          </span>
          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Where are we going?</span>
          <input
            type="text"
            className="input"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Somewhere we'll make memories ❤️"
            aria-description="Enter the place…"
            autoComplete="off"
            maxLength={150}
            required
          />
          <span className="field-help">Enter the place… a restaurant, café, park, anywhere.</span>
        </label>

        <label className="field">
          <span className="field-label">
            Anything you want to tell me? <span className="optional">(optional)</span>
          </span>
          <textarea
            className="input textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={CONFIG.DEFAULT_MESSAGE}
            rows={3}
            maxLength={300}
          />
        </label>

        <Button type="submit" block disabled={!canConfirm}>
          Confirm Date ❤️
        </Button>
        {hint && <p className="form-hint">{hint}</p>}
      </form>
    </Card>
  );
}
