import { useMemo, type CSSProperties } from 'react';

interface Props {
  count?: number;
}

/** Soft hearts drifting up behind everything. Pure CSS, pointer-events off. */
export function FloatingHearts({ count = 14 }: Props) {
  // Randomize once per mount so hearts don't jump around on re-render.
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 18,
        duration: 12 + Math.random() * 14,
        delay: -Math.random() * 26,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.18 + Math.random() * 0.3,
      })),
    [count],
  );

  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={
            {
              left: `${h.left}%`,
              width: h.size,
              height: h.size,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              '--drift': `${h.drift}px`,
              '--heart-opacity': h.opacity,
            } as CSSProperties
          }
        >
          <HeartIcon />
        </span>
      ))}
    </div>
  );
}

export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 28s-11-6.9-11-15a6 6 0 0 1 11-3.3A6 6 0 0 1 27 13c0 8.1-11 15-11 15z"
      />
    </svg>
  );
}
