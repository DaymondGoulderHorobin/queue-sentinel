import { MetricCard } from '../components/MetricCard';
import { SignalPill } from '../components/SignalPill';
import { StatusBadge } from '../components/StatusBadge';
import { APP_NAME, SPRINT_LABEL } from '../../shared/constants';
import type { QueueIncident } from '../../shared/types';
import {
  getPriorityDistribution,
  getRecommendedReviewFocus,
  getTopPriorityIncident,
  getWorkbenchMetrics,
} from '../../shared/workbench';

interface DashboardPageProps {
  dataStatus: 'loading' | 'demo' | 'api';
  incidents: QueueIncident[];
  onInspectIncident: (incidentId: string) => void;
}

export const DashboardPage = ({
  dataStatus,
  incidents,
  onInspectIncident,
}: DashboardPageProps) => {
  const metrics = getWorkbenchMetrics(incidents);
  const distribution = getPriorityDistribution(incidents);
  const topIncident = getTopPriorityIncident(incidents);
  const maxDistributionCount = Math.max(
    ...distribution.map((item) => item.count),
    1,
  );
  const dataLabel = dataStatus === 'api' ? 'API demo data' : 'Local demo data';

  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Core queue workbench</p>
          <h2 id="dashboard-title">{APP_NAME}</h2>
          <p>
            Ranked mock incidents, queue pressure signals, and case-card context
            for faster human moderator triage.
          </p>
          <div className="hero-badges">
            <StatusBadge tone="build">{SPRINT_LABEL}</StatusBadge>
            <StatusBadge tone={dataStatus === 'api' ? 'build' : 'open'}>
              {dataLabel}
            </StatusBadge>
          </div>
        </div>
        <div className="review-focus">
          <p className="eyebrow">Recommended review focus</p>
          <strong>{getRecommendedReviewFocus(incidents)}</strong>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--six">
        <MetricCard
          label="Open Incidents"
          meta="Open or actively reviewing"
          value={String(metrics.openIncidents)}
        />
        <MetricCard
          label="Critical or High"
          meta="Highest-pressure cases"
          tone="urgent"
          value={String(metrics.highPriorityIncidents)}
        />
        <MetricCard
          label="Related Reports"
          meta="Grouped queue context"
          value={String(metrics.totalRelatedItems)}
        />
        <MetricCard
          label="Average Queue Age"
          meta="Mock backlog pressure"
          value={`${metrics.averageQueueAgeMinutes}m`}
        />
        <MetricCard
          label="Estimated Clicks Saved"
          meta="Demo estimate only"
          tone="success"
          value={String(metrics.estimatedClicksSaved)}
        />
        <MetricCard
          label="Resolved This Session"
          meta="Mock resolved incidents"
          value={String(metrics.resolvedThisSession)}
        />
      </div>

      <div className="dashboard-lanes">
        {topIncident ? (
          <article className="top-incident-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Top priority incident</p>
                <h3>{topIncident.title}</h3>
              </div>
              <StatusBadge tone={topIncident.priority}>
                {topIncident.priority}
              </StatusBadge>
            </div>

            <div className="metric-strip metric-strip--wide">
              <span>
                <strong>{topIncident.reportCount}</strong>
                reports
              </span>
              <span>
                <strong>{topIncident.queueAgeMinutes}m</strong>
                queue age
              </span>
              <span>
                <strong>{topIncident.relatedItemCount}</strong>
                related
              </span>
            </div>

            <p>{topIncident.recommendedReviewAction}</p>
            <div className="signal-row">
              <SignalPill tone="strong">{topIncident.suspectedRuleArea}</SignalPill>
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
