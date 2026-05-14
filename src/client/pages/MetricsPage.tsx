import { MetricCard } from '../components/MetricCard';
import type { QueueIncident } from '../../shared/types';
import {
  getPriorityDistribution,
  getScoringWorkbenchMetrics,
  getWorkbenchMetrics,
} from '../../shared/workbench';

interface MetricsPageProps {
  incidents: QueueIncident[];
}

export const MetricsPage = ({ incidents }: MetricsPageProps) => {
  const metrics = getWorkbenchMetrics(incidents);
  const scoringMetrics = getScoringWorkbenchMetrics(incidents);
  const distribution = getPriorityDistribution(incidents);
  const maxDistributionCount = Math.max(
    ...distribution.map((item) => item.count),
    1,
  );

  return (
    <section className="page-stack" aria-labelledby="metrics-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Deterministic scoring metrics</p>
          <h2 id="metrics-title">Clustering and scoring impact</h2>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--six">
        <MetricCard
          label="Signals Processed"
          meta={scoringMetrics.modelVersion}
          value={String(scoringMetrics.signalsProcessed)}
        />
        <MetricCard
          label="Clusters Formed"
          meta="Final incident groups"
          value={String(scoringMetrics.clustersFormed)}
        />
        <MetricCard
          label="Average Score"
          meta="Across scored incidents"
          value={String(scoringMetrics.averageScore)}
        />
        <MetricCard
          label="Critical or High"
          meta="Scored priority share"
          tone="urgent"
          value={`${scoringMetrics.highPriorityShare}%`}
        />
        <MetricCard
          label="Signals Collapsed"
          meta="Beyond final clusters"
          tone="success"
          value={String(scoringMetrics.duplicateSignalsCollapsed)}
        />
        <MetricCard
          label="Rule Areas Surfaced"
          meta="Distinct demo categories"
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
