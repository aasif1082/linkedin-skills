import type { ReactNode } from 'react';

/** The frosted rounded card every screen sits in. Re-keyed per screen for the fade-in. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card screen-enter ${className}`}>{children}</section>;
}
