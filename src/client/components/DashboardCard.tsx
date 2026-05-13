import type { PropsWithChildren } from 'react';

interface DashboardCardProps extends PropsWithChildren {
  label: string;
  value: string;
  meta: string;
}

export const DashboardCard = ({
  children,
  label,
  meta,
  value,
}: DashboardCardProps) => {
  return (
    <article className="dashboard-card">
      <div>
        <p className="eyebrow">{label}</p>
        <strong>{value}</strong>
      </div>
      <p>{meta}</p>
      {children}
    </article>
  );
};
