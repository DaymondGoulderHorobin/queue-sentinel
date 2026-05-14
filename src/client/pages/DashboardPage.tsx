import { MetricCard } from '../components/MetricCard';
import { SignalPill } from '../components/SignalPill';
import { StatusBadge } from '../components/StatusBadge';
import { APP_NAME, SPRINT_LABEL } from '../../shared/constants';
import type { ApiSource, ScoringPreviewResponse } from '../../shared/apiTypes';
import type { QueueIncident } from '../../shared/types';
import {
  getPriorityDistribution,
  getRecommendedReviewFocus,
  getScoringWorkbenchMetrics,
  getTopScoredIncident,
  getTopPriorityIncident,
  getWorkbenchMetrics,
} from '../../shared/workbench';

interface DashboardPageProps {
  dataStatus: 'loading' | ApiSource;
  errorMessage: string | null;
  incidents: QueueIncident[];
  isLoading: boolean;
  isMutating: boolean;
  onInspectIncident: (incidentId: string) => void;
  onRecomputeScoring: () => void;
  onRefresh: () => void;
  scoringPreview: ScoringPreviewResponse;
}

export const DashboardPage = ({
  dataStatus,
  errorMessage,
  incidents,
  isLoading,
  isMutating,
  onInspectIncident,
  onRecomputeScoring,
  onRefresh,
  scoringPreview,
}: DashboardPageProps) => {
  const metrics = getWorkbenchMetrics(incidents);
  const scoringMetrics = getScoringWorkbenchMetrics(incidents);
  const distribution = getPriorityDistribution(incidents);
  const topIncident = getTopScoredIncident(incidents) ?? getTopPriorityIncident(incidents);
  const maxDistributionCount = Math.max(
    ...distribution.map((item) => item.count),
    1,
  );
  const dataLabel =
    dataStatus === 'redis'
      ? 'Redis-backed data'
      : dataStatus === 'memory'
        ? 'Memory store data'
        : dataStatus === 'fallback'
          ? 'Fallback demo data'
          : 'Loading data';

  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Deterministic scoring active</p>
          <h2 id="dashboard-title">{APP_NAME}</h2>
          <p>
            Synthetic demo signals are clustered and scored with an explainable
            deterministic model for faster human moderator triage.
          </p>
          <div className="hero-badges">
            <StatusBadge tone="build">{SPRINT_LABEL}</StatusBadge>
            <StatusBadge tone={dataStatus === 'fallback' ? 'open' : 'build'}>
              {dataLabel}
            </StatusBadge>
            <StatusBadge tone="build">{scoringPreview.modelVersion}</StatusBadge>
          </div>
        </div>
        <div className="review-focus">
          <p className="eyebrow">Recommended review focus</p>
          <strong>{getRecommendedReviewFocus(incidents)}</strong>
          <div className="demo-actions">
            <button
              className="secondary-action"
              disabled={isLoading}
              onClick={onRefresh}
              type="button"
            >
              {isLoading ? 'Refreshing...' : 'Refresh incidents'}
            </button>
            <button
              className="secondary-action"
              disabled={isMutating}
              onClick={onRecomputeScoring}
              type="button"
            >
              {isMutating ? 'Recomputing...' : 'Recompute scoring'}
            </button>
          </div>
        </div>
      </div>

      {errorMessage ? <div className="notice-panel">{errorMessage}</div> : null}

      <div className="dashboard-grid dashboard-grid--six">
        <MetricCard
          label="Signals Processed"
          meta="Safe synthetic queue signals"
          value={String(scoringPreview.signalsProcessed)}
        />
        <MetricCard
          label="Clusters Formed"
          meta="Deterministic incident groups"
          tone="urgent"
          value={String(scoringPreview.clustersFormed)}
        />
        <MetricCard
          label="Average Score"
          meta="Current scored incidents"
          value={String(scoringPreview.averageScore)}
        />
        <MetricCard
          label="Signals Collapsed"
          meta="Signals beyond final clusters"
          value={String(scoringPreview.duplicateSignalsCollapsed)}
        />
        <MetricCard
          label="High Priority Share"
          meta="Critical or high scored cases"
          tone="success"
          value={`${scoringMetrics.highPriorityShare}%`}
        />
        <MetricCard
          label="Open Incidents"
          meta="Open or actively reviewing"
          value={String(metrics.openIncidents)}
        />
      </div>

      <div className="dashboard-lanes">
        {topIncident ? (
          <article className="top-incident-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Top scored incident</p>
                <h3>{topIncident.title}</h3>
              </div>
              <StatusBadge tone={topIncident.priority}>
                {topIncident.priority}
              </StatusBadge>
            </div>

            <div className="metric-strip metric-strip--wide">
              <span>
                <strong>{topIncident.priorityScore?.score ?? '--'}</strong>
                score
              </span>
              <span>
                <strong>{topIncident.clusterSummary?.signalCount ?? '--'}</strong>
                signals
              </span>
              <span>
                <strong>{topIncident.clusterSummary?.uniqueItemCount ?? '--'}</strong>
                items
              </span>
            </div>

            <p>{topIncident.recommendedReviewAction}</p>
            <div className="signal-row">
              <SignalPill tone="strong">{topIncident.suspectedRuleArea}</SignalPill>
              {topIncident.priorityScore?.factors[0] ? (
                <SignalPill>{topIncident.priorityScore.factors[0].label}</SignalPill>
              ) : null}
              {(topIncident.tags ?? []).slice(0, 3).map((tag) => (
                <SignalPill key={tag}>{tag}</SignalPill>
              ))}
            </div>
            <button
              className="primary-action"
              onClick={() => onInspectIncident(topIncident.id)}
              type="button"
            >
              Inspect case card
            </button>
          </article>
        ) : null}

        <article className="distribution-panel">
          <p className="eyebrow">Priority distribution</p>
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
      </div>
    </section>
  );
};
