import { useEffect, useState } from 'react';
import { CelebrationScreen } from './components/CelebrationScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { FloatingHearts } from './components/FloatingHearts';
import { Footer } from './components/Footer';
import { InviteScreen } from './components/InviteScreen';
import { PlanScreen } from './components/PlanScreen';
import type { DatePlan } from './lib/calendar';

type Screen = 'invite' | 'celebrate' | 'plan' | 'confirmed';

export default function App() {
  const [screen, setScreen] = useState<Screen>('invite');
  const [plan, setPlan] = useState<DatePlan | null>(null);

  // Each screen starts at the top (the plan screen is taller than a phone).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen]);

  return (
    <div className="app">
      <FloatingHearts />
      <main className="stage">
        {screen === 'invite' && <InviteScreen onYes={() => setScreen('celebrate')} />}
        {screen === 'celebrate' && <CelebrationScreen onNext={() => setScreen('plan')} />}
        {screen === 'plan' && (
          <PlanScreen
            initial={plan}
            onConfirm={(p) => {
              setPlan(p);
              setScreen('confirmed');
            }}
          />
        )}
        {screen === 'confirmed' && plan && (
          <ConfirmationScreen plan={plan} onEdit={() => setScreen('plan')} />
        )}
      </main>
      <Footer />
    </div>
  );
}
