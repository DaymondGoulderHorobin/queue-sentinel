import type { PropsWithChildren } from 'react';

interface MetricCardProps extends PropsWithChildren {
  label: string;
  value: string;
  meta: string;
  tone?: 'standard' | 'urgent' | 'success';
}

export const MetricCard = ({
  children,
  label,
  meta,
  tone = 'standard',
  value,
}: MetricCardProps) => {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <p>{meta}</p>
      {children}
    </article>
  );
};
