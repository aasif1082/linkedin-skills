import confetti from 'canvas-confetti';

const COLORS = ['#e0566f', '#f4a3b4', '#ffd6de', '#a3243b', '#f7c59f', '#ffffff'];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let heartShape: confetti.Shape | null = null;
function heart(): confetti.Shape | undefined {
  try {
    heartShape ??= confetti.shapeFromText({ text: '❤️', scalar: 2 });
    return heartShape;
  } catch {
    return undefined; // Older browsers: fall back to regular confetti.
  }
}

/** Big two-sided confetti burst with hearts mixed in, for the YES moment. */
export function celebrateYes(): void {
  if (prefersReducedMotion()) return;
  const h = heart();
  const shared = { colors: COLORS, disableForReducedMotion: true, zIndex: 50 };

  confetti({ ...shared, particleCount: 90, spread: 80, origin: { y: 0.65 } });
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ ...shared, particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...shared, particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  if (h) {
    setTimeout(() => {
      confetti({ ...shared, shapes: [h], scalar: 2, particleCount: 24, spread: 100, origin: { y: 0.6 } });
    }, 350);
  }
}

/** A softer shower of hearts for the confirmation card. */
export function celebrateConfirmed(): void {
  if (prefersReducedMotion()) return;
  const h = heart();
  confetti({
    colors: COLORS,
    shapes: h ? [h] : ['circle'],
    scalar: h ? 1.8 : 1,
    particleCount: 30,
    spread: 120,
    startVelocity: 30,
    gravity: 0.6,
    origin: { y: 0.4 },
    disableForReducedMotion: true,
    zIndex: 50,
  });
}
