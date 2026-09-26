import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Multiplies the button's size (used by the YES / NO game). */
  scale?: number;
  block?: boolean;
}

export function Button({ variant = 'primary', scale, block, className = '', style, ...rest }: Props) {
  const classes = ['btn', `btn-${variant}`, block ? 'btn-block' : '', className]
    .filter(Boolean)
    .join(' ');
  const merged = scale ? ({ ...style, '--scale': scale } as CSSProperties) : style;
  return <button type="button" className={classes} style={merged} {...rest} />;
}
