import type { PropsWithChildren } from 'react';

type SignalPillTone = 'neutral' | 'strong' | 'medium' | 'low';

interface SignalPillProps extends PropsWithChildren {
  tone?: SignalPillTone;
}

export const SignalPill = ({
  children,
  tone = 'neutral',
}: SignalPillProps) => {
  return <span className={`signal-pill signal-pill--${tone}`}>{children}</span>;
};
