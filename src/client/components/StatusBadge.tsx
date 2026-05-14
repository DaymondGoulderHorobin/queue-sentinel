import type { PropsWithChildren } from 'react';

type StatusBadgeTone = 'build' | 'critical' | 'high' | 'medium' | 'low' | 'open';

interface StatusBadgeProps extends PropsWithChildren {
  tone?: StatusBadgeTone;
}

export const StatusBadge = ({
  children,
  tone = 'open',
}: StatusBadgeProps) => {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
};
