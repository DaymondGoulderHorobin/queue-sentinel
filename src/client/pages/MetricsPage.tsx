import { MetricCard } from '../components/MetricCard';
import type {
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../../shared/apiTypes';
import type { QueueIncident } from '../../shared/types';
import { getPriorityDistribution } from '../../shared/workbench';

interface MetricsPageProps {
  incidents: QueueIncident[];
  ingestionStatus: IngestionStatusResponse;
  scoringPreview: ScoringPreviewResponse;
}

export const MetricsPage = ({
  incidents,
  ingestionStatus,
  scoringPreview,
}: MetricsPageProps) => {
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
          meta={scoringPreview.modelVersion}
          value={String(scoringPreview.signalsProcessed)}
        />
        <MetricCard
          label="Accepted Playtest"
          meta={ingestionStatus.config.mode}
          value={String(ingestionStatus.lastRun?.acceptedSignals ?? 0)}
        />
        <MetricCard
          label="Rejected Playtest"
          meta="Read-only guardrails"
          value={String(ingestionStatus.lastRun?.rejectedSignals ?? 0)}
        />
        <MetricCard
          label="Clusters Formed"
          meta="Final incident groups"
          value={String(scoringPreview.clustersFormed)}
        />
        <MetricCard
          label="Average Score"
          meta="Across scored incidents"
          value={String(scoringPreview.averageScore)}
        />
        <MetricCard
          label="Signals Collapsed"
          meta="Beyond final clusters"
          tone="success"
          value={String(scoringPreview.duplicateSignalsCollapsed)}
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
