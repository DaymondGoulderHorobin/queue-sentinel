import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import type { QueueIncident } from '../../shared/types';

interface DashboardPageProps {
  dataStatus: 'loading' | 'demo' | 'api';
  incidents: QueueIncident[];
}

export const DashboardPage = ({ dataStatus, incidents }: DashboardPageProps) => {
  const openIncidents = incidents.filter(
    (incident) =>
      incident.status === 'open' || incident.status === 'reviewing',
  );
  const waveCandidates = incidents.filter(
    (incident) => incident.relatedItemCount >= 5,
  );
  const averageQueueAge =
    incidents.length === 0
      ? 0
      : Math.round(
          incidents.reduce(
            (total, incident) => total + incident.queueAgeMinutes,
            0,
          ) / incidents.length,
        );

  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Live shell</p>
          <h2 id="dashboard-title">Queue overview</h2>
        </div>
        <StatusBadge tone={dataStatus === 'api' ? 'build' : 'open'}>
          {dataStatus === 'api' ? 'API demo data' : 'Local demo data'}
        </StatusBadge>
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          label="Needs Review"
          meta="Open or reviewing incident placeholders"
          value={String(openIncidents.length)}
        />
        <DashboardCard
          label="Likely Waves"
          meta="Potential duplicate-report clusters"
          value={String(waveCandidates.length)}
        />
        <DashboardCard
          label="Average Queue Age"
          meta="Mock queue pressure signal"
          value={`${averageQueueAge}m`}
        />
        <DashboardCard
          label="Resolved This Session"
          meta="Disabled until real moderator workflow exists"
          value="0"
        />
      </div>

      <div className="workbench-panel">
        <div>
          <p className="eyebrow">Moderator workflow</p>
          <h3>Rank, inspect, then decide</h3>
          <p>
            Sprint 0 proves the workbench shape without clustering, Redis, or
            enforcement. Later sprints can replace this mock layer while keeping
            the same review-first experience.
          </p>
        </div>
        <div className="signal-strip" aria-label="Mock queue signal chart">
          <span style={{ height: '36%' }} />
          <span style={{ height: '58%' }} />
          <span style={{ height: '44%' }} />
          <span style={{ height: '74%' }} />
          <span style={{ height: '64%' }} />
          <span style={{ height: '86%' }} />
        </div>
      </div>
    </section>
  );
};
