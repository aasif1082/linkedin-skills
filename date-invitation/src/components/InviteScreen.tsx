import { useState } from 'react';
import { CONFIG, NO_MESSAGES } from '../config';
import { Button } from './Button';
import { Card } from './Card';
import { HeartIcon } from './FloatingHearts';

interface Props {
  onYes: () => void;
}

/** NO click that triggers "Okay okay… I'll ask one last time." */
const LAST_ASK = NO_MESSAGES.length + 1;

/**
 * Screens 1 and 2: the question, and the playful NO loop.
 *
 * Each NO shows the next message and makes YES a little bigger and NO a little
 * smaller, but NO never shrinks below a comfortable tap size and never moves
 * away. After the "last time" ask, one more NO is respected with a gentle
 * "that's okay" screen, so she can always genuinely say no.
 */
export function InviteScreen({ onYes }: Props) {
  const [noCount, setNoCount] = useState(0);
  const [wiggle, setWiggle] = useState(0);

  const declined = noCount > LAST_ASK;
  const growth = Math.min(noCount, LAST_ASK);
  const yesScale = 1 + growth * 0.08;
  const noScale = Math.max(0.8, 1 - growth * 0.02);

  const handleNo = () => {
    setNoCount((n) => n + 1);
    setWiggle((w) => w + 1);
  };

  if (declined) {
    return (
      <Card className="invite">
        <div className="big-emoji" aria-hidden="true">🫶</div>
        <h1 className="title">That's okay ❤️</h1>
        <p className="lead">
          No pressure at all, {CONFIG.GIRLFRIEND_NAME}. The invitation stays open whenever you
          change your mind.
        </p>
        <p className="muted">(The YES button will be right here. Just saying. 😌)</p>
        <div className="actions">
          <Button onClick={onYes} scale={1.1} className="pulse">
            Actually… YES ❤️
          </Button>
          <Button variant="ghost" onClick={() => setNoCount(0)}>
            Start over
          </Button>
        </div>
      </Card>
    );
  }

  let eyebrow: string;
  let heading: string;
  let question: string;
  if (noCount === 0) {
    eyebrow = `Hey ${CONFIG.GIRLFRIEND_NAME} ❤️`;
    heading = 'I have a very important question for you…';
    question = 'Will you go on a date with me?';
  } else if (noCount < LAST_ASK) {
    eyebrow = 'Hmm… are you sure? 🥺';
    heading = NO_MESSAGES[noCount - 1];
    question = 'Will you go on a date with me?';
  } else {
    eyebrow = 'Okay okay…';
    heading = "I'll ask one last time.";
    question = 'Will you go on a date with me? ❤️';
  }

  return (
    <Card className="invite">
      <div className="heart-badge" aria-hidden="true">
        <HeartIcon />
      </div>

      <p className="eyebrow" key={`eyebrow-${noCount === 0}`}>{eyebrow}</p>
      {/* Re-keyed so each new message fades in instead of silently swapping. */}
      <h1 className="title message-pop" key={`msg-${noCount}`} aria-live="polite">
        {heading}
      </h1>
      <p className="question">{question}</p>

      <div className="actions actions-row">
        <Button
          onClick={onYes}
          scale={noCount >= LAST_ASK ? yesScale + 0.15 : yesScale}
          className={noCount >= 3 ? 'pulse' : ''}
        >
          YES ❤️
        </Button>
        <Button
          variant="secondary"
          onClick={handleNo}
          scale={noScale}
          key={`no-${wiggle}`}
          className={wiggle ? 'wiggle' : ''}
        >
          NO 🙈
        </Button>
      </div>

      {noCount > 0 && noCount < LAST_ASK && (
        <p className="attempts" aria-hidden="true">
          {'💔'.repeat(Math.min(noCount, 5))}
          {noCount > 5 ? ` +${noCount - 5}` : ''}
        </p>
      )}
    </Card>
  );
}
