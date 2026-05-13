import { DashboardCard } from '../components/DashboardCard';
import type { QueueIncident } from '../../shared/types';

interface MetricsPageProps {
  incidents: QueueIncident[];
}

export const MetricsPage = ({ incidents }: MetricsPageProps) => {
  const duplicateReportsCollapsed = incidents.reduce(
    (total, incident) => total + Math.max(incident.reportCount - 1, 0),
    0,
  );
  const clicksSaved = duplicateReportsCollapsed * 2;
  const backlogTrend = incidents.length > 0 ? 'Holding steady' : 'No data';

  return (
    <section className="page-stack" aria-labelledby="metrics-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Impact placeholders</p>
          <h2 id="metrics-title">Moderator time signals</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          label="Duplicate Reports Collapsed"
          meta="Mock estimate from related reports"
          value={String(duplicateReportsCollapsed)}
        />
        <DashboardCard
          label="Estimated Clicks Saved"
          meta="Placeholder multiplier for demo review"
          value={String(clicksSaved)}
        />
        <DashboardCard
          label="Backlog Age Trend"
          meta="Ready for Sprint 1 visual pass"
          value={backlogTrend}
        />
      </div>

      <div className="trend-line" aria-label="Placeholder backlog trend">
        <span />
        <span />
        <span />
        <span />
      </div>
    </section>
  );
};
