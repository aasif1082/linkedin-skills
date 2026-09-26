import { useEffect, type CSSProperties } from 'react';
import { celebrateYes } from '../lib/celebrate';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  onNext: () => void;
}

/** Screen 3: confetti, hearts, and the "YAYYYYY!". */
export function CelebrationScreen({ onNext }: Props) {
  useEffect(() => {
    celebrateYes();
  }, []);

  return (
    <Card className="celebrate">
      <div className="burst" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties}>❤️</span>
        ))}
        <span className="burst-center">💘</span>
      </div>
      <h1 className="title title-xl">YAYYYYY! ❤️</h1>
      <p className="lead">I knew you would say yes.</p>
      <p className="muted">You've officially made me very happy today. ❤️</p>
      <p className="question">Now let's plan our date.</p>
      <div className="actions">
        <Button onClick={onNext} block>
          Pick Our Date →
        </Button>
      </div>
    </Card>
  );
}
