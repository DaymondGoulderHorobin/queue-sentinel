import { SignalPill } from './SignalPill';
import { StatusBadge } from './StatusBadge';
import type { IncidentStatus, QueueIncident } from '../../shared/types';

interface IncidentPreviewProps {
  incident: QueueIncident;
  isMutating: boolean;
  onOpenCaseCard: (incidentId: string) => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
}

export const IncidentPreview = ({
  incident,
  isMutating,
  onOpenCaseCard,
  onUpdateStatus,
}: IncidentPreviewProps) => {
  const topFactors = (incident.priorityScore?.factors ?? [])
    .filter((factor) => factor.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);

  return (
    <aside className="incident-preview" aria-label="Selected incident preview">
      <div className="preview-heading">
        <p className="eyebrow">Selected incident</p>
        <StatusBadge tone={incident.priority}>{incident.priority}</StatusBadge>
      </div>
      <h3>{incident.title}</h3>
      <p>{incident.recommendedReviewAction}</p>

      <div className="preview-stats">
        <span>
          <strong>{incident.priorityScore?.score ?? '--'}</strong>
          score
        </span>
        <span>
          <strong>{incident.clusterSummary?.signalCount ?? '--'}</strong>
          signals
        </span>
        <span>
          <strong>{incident.clusterSummary?.uniqueItemCount ?? '--'}</strong>
          items
        </span>
      </div>

      {incident.clusterSummary ? (
        <div className="preview-section">
          <p className="eyebrow">Cluster summary</p>
          <div className="signal-row">
            <SignalPill>{incident.clusterSummary.signalCount} signals</SignalPill>
            <SignalPill>{incident.clusterSummary.timeWindowMinutes}m window</SignalPill>
            {incident.clusterSummary.groupingKeys.slice(0, 2).map((key) => (
              <SignalPill key={key}>{key}</SignalPill>
            ))}
          </div>
        </div>
      ) : null}

      <div className="preview-section">
        <p className="eyebrow">Signals</p>
        <div className="signal-row">
          {incident.whySurfaced.slice(0, 3).map((reason) => (
            <SignalPill key={reason}>{reason}</SignalPill>
          ))}
        </div>
      </div>

      {topFactors.length > 0 ? (
        <div className="preview-section">
          <p className="eyebrow">Top score factors</p>
          <div className="score-factor-list">
            {topFactors.map((factor) => (
              <div className="score-factor" key={factor.key}>
                <strong>{factor.label}</strong>
                <span>+{factor.contribution}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="preview-section">
        <p className="eyebrow">Rationale aid</p>
        <p>{incident.rationaleDraft}</p>
      </div>

      <label className="status-control">
        Internal Queue Sentinel status
        <select
          disabled={isMutating}
          onChange={(event) =>
            onUpdateStatus(incident.id, event.target.value as IncidentStatus)
          }
          value={incident.status}
        >
          <option value="open">Open</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
      </label>

      <button
        className="primary-action"
        onClick={() => onOpenCaseCard(incident.id)}
        type="button"
      >
        Review full case card
      </button>
    </aside>
  );
};
