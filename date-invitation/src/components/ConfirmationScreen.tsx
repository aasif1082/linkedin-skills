import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../config';
import { buildEvent, downloadIcs, googleCalendarUrl, type DatePlan } from '../lib/calendar';
import { celebrateConfirmed } from '../lib/celebrate';
import { formatLongDate, formatTime } from '../lib/dates';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  plan: DatePlan;
  onEdit: () => void;
}

/** Screen 5: the "IT'S A DATE!" card plus the add-to-calendar actions. */
export function ConfirmationScreen({ plan, onEdit }: Props) {
  const event = useMemo(() => buildEvent(plan), [plan]);
  const googleUrl = useMemo(() => googleCalendarUrl(event), [event]);
  const [added, setAdded] = useState<'google' | 'ics' | null>(null);

  useEffect(() => {
    celebrateConfirmed();
  }, []);

  const time = formatTime(plan.time);

  return (
    <Card className="confirmed">
      <p className="eyebrow">Okay, it's official. We have a date. ❤️</p>
      <h1 className="title title-xl">IT'S A DATE! ❤️</h1>

      <div className="ticket">
        <div className="ticket-row">
          <span className="ticket-icon" aria-hidden="true">📅</span>
          <div>
            <span className="ticket-label">Date</span>
            <span className="ticket-value">
              {formatLongDate(plan.day)}
              {time && ` · ${time}`}
            </span>
          </div>
        </div>
        <div className="ticket-row">
          <span className="ticket-icon" aria-hidden="true">📍</span>
          <div>
            <span className="ticket-label">Place</span>
            <span className="ticket-value">{plan.place}</span>
          </div>
        </div>
        <div className="ticket-row">
          <span className="ticket-icon" aria-hidden="true">💌</span>
          <div>
            <span className="ticket-label">Message</span>
            <span className="ticket-value ticket-message">
              {plan.message || CONFIG.DEFAULT_MESSAGE}
            </span>
          </div>
        </div>
      </div>

      <p className="lead">I'll see you there ❤️</p>
      <p className="muted">Can't wait for our date, {CONFIG.GIRLFRIEND_NAME}.</p>

      <div className="actions">
        {/* A real link (not window.open) so mobile browsers never block it. */}
        <a
          className="btn btn-primary btn-block btn-stack"
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setAdded('google')}
        >
          Add To My Calendar
          <small>Opens Google Calendar</small>
        </a>
        <Button
          variant="secondary"
          block
          className="btn-stack"
          onClick={() => {
            downloadIcs(event);
            setAdded('ics');
          }}
        >
          Download .ics
          <small>Apple Calendar, Outlook &amp; others</small>
        </Button>
        {added && (
          <p className="toast" role="status">
            {added === 'google'
              ? 'Google Calendar opened in a new tab. Tap Save there ❤️'
              : 'Downloaded! Open the file to add it to your calendar ❤️'}
          </p>
        )}
        <Button variant="ghost" onClick={onEdit}>
          ← Change the plan
        </Button>
      </div>
    </Card>
  );
}
