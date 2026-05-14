import { MetricCard } from '../components/MetricCard';
import { SignalPill } from '../components/SignalPill';
import { StatusBadge } from '../components/StatusBadge';
import { PRIMARY_DEMO_INCIDENT } from '../../shared/demoData';
import type { IncidentStatus, QueueIncident } from '../../shared/types';

interface CaseCardPageProps {
  incident: QueueIncident | undefined;
  isMutating: boolean;
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
}

export const CaseCardPage = ({
  incident,
  isMutating,
  onUpdateStatus,
}: CaseCardPageProps) => {
  const selectedIncident = incident ?? PRIMARY_DEMO_INCIDENT;
  const timeline = selectedIncident.timeline ?? [];

  return (
    <section className="page-stack" aria-labelledby="case-card-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Case card</p>
          <h2 id="case-card-title">{selectedIncident.title}</h2>
        </div>
        <div className="case-heading-badges">
          <StatusBadge tone={selectedIncident.priority}>
            {selectedIncident.priority}
          </StatusBadge>
          <StatusBadge tone={selectedIncident.status}>
            {selectedIncident.status}
          </StatusBadge>
        </div>
      </div>

      <article className="case-card case-card--polished">
        <div className="case-summary-grid">
          <MetricCard
            label="Reports"
            meta="Demo queue reports"
            value={String(selectedIncident.reportCount)}
          />
          <MetricCard
            label="Queue Age"
            meta="Time since first seen"
            value={`${selectedIncident.queueAgeMinutes}m`}
          />
          <MetricCard
            label="Related Items"
            meta="Grouped context"
            value={String(selectedIncident.relatedItemCount)}
          />
          <MetricCard
            label="Confidence"
            meta="Demo signal label"
            value={selectedIncident.confidenceLabel ?? 'medium'}
          />
        </div>

        <div className="case-two-column">
          <div className="case-section">
            <p className="eyebrow">Suspected rule area</p>
            <h3>{selectedIncident.suspectedRuleArea}</h3>
            <p>{selectedIncident.userContextSummary}</p>
            <div className="signal-row">
              {(selectedIncident.tags ?? []).map((tag) => (
                <SignalPill key={tag}>{tag}</SignalPill>
              ))}
            </div>
          </div>

          <div className="case-section rationale-box">
            <p className="eyebrow">Rationale draft</p>
            <p>{selectedIncident.rationaleDraft}</p>
            <small>
              Review aid only. Queue Sentinel is not making an enforcement
              decision in Sprint 2.
            </small>
          </div>
        </div>

        <div className="case-section">
          <p className="eyebrow">Why surfaced</p>
          <div className="signal-card-grid">
            {selectedIncident.whySurfaced.map((reason) => (
              <div className="signal-card" key={reason}>
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="case-section">
          <p className="eyebrow">Timeline</p>
          <ol className="timeline-list">
            {timeline.map((event) => (
              <li key={event.id}>
                <time dateTime={event.occurredAt}>
                  {new Intl.DateTimeFormat('en', {
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(event.occurredAt))}
                </time>
                <div>
                  <strong>{event.label}</strong>
                  <p>{event.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="action-safety-panel">
          <div>
            <p className="eyebrow">Safety boundary</p>
            <strong>Moderation actions are intentionally disabled.</strong>
            <p>
              Sprint 2 updates Queue Sentinel status only. No approve, remove,
              lock, ban, Reddit escalation, or trigger path is active.
            </p>
            <label className="status-control status-control--compact">
              Internal status only
              <select
                disabled={isMutating}
                onChange={(event) =>
                  onUpdateStatus(
                    selectedIncident.id,
                    event.target.value as IncidentStatus,
                  )
                }
                value={selectedIncident.status}
              >
                <option value="open">Open</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </label>
          </div>
          <div
            className="disabled-actions"
            aria-label="Disabled moderator actions"
          >
            <button disabled type="button">
              Approve
            </button>
            <button disabled type="button">
              Remove
            </button>
            <button disabled type="button">
              Lock
            </button>
            <button disabled type="button">
              Escalate
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};
