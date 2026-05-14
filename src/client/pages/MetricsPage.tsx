import { MetricCard } from '../components/MetricCard';
import type { QueueIncident } from '../../shared/types';
import {
  getPriorityDistribution,
  getWorkbenchMetrics,
} from '../../shared/workbench';

interface MetricsPageProps {
  incidents: QueueIncident[];
}

export const MetricsPage = ({ incidents }: MetricsPageProps) => {
  const metrics = getWorkbenchMetrics(incidents);
  const distribution = getPriorityDistribution(incidents);
  const maxDistributionCount = Math.max(
    ...distribution.map((item) => item.count),
    1,
  );

  return (
    <section className="page-stack" aria-labelledby="metrics-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Demo sprint metrics</p>
          <h2 id="metrics-title">Mock impact signals</h2>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--six">
        <MetricCard
          label="Duplicate Reports Collapsed"
          meta="Mock estimate from grouped reports"
          value={String(metrics.duplicateReportsCollapsed)}
        />
        <MetricCard
          label="Total Related Queue Items"
          meta="Grouped incident context"
          value={String(metrics.totalRelatedItems)}
        />
        <MetricCard
          label="Average Queue Age"
          meta="Demo backlog signal"
          value={`${metrics.averageQueueAgeMinutes}m`}
        />
        <MetricCard
          label="High Priority Count"
          meta="Critical and high cases"
          tone="urgent"
          value={String(metrics.highPriorityIncidents)}
        />
        <MetricCard
          label="Estimated Clicks Saved"
          meta="Demo multiplier only"
          tone="success"
          value={String(metrics.estimatedClicksSaved)}
        />
        <MetricCard
          label="Rule Areas Surfaced"
          meta="Distinct mock categories"
          value={String(metrics.ruleAreasSurfaced)}
        />
      </div>

      <article className="distribution-panel distribution-panel--wide">
        <p className="eyebrow">Incidents by priority</p>
        <div className="distribution-list">
          {distribution.map((item) => (
            <div className="distribution-row" key={item.priority}>
              <span>{item.priority}</span>
              <div
                aria-label={`${item.priority} priority incidents: ${item.count}`}
                className="distribution-track"
              >
                <span
                  style={{
                    width: `${Math.max(
                      8,
                      (item.count / maxDistributionCount) * 100,
                    )}%`,
                  }}
                />
              </div>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};
