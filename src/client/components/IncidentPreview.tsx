import { SignalPill } from './SignalPill';
import { StatusBadge } from './StatusBadge';
import type { QueueIncident } from '../../shared/types';

interface IncidentPreviewProps {
  incident: QueueIncident;
  onOpenCaseCard: (incidentId: string) => void;
}

export const IncidentPreview = ({
  incident,
  onOpenCaseCard,
}: IncidentPreviewProps) => {
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
          <strong>{incident.reportCount}</strong>
          reports
        </span>
        <span>
          <strong>{incident.queueAgeMinutes}m</strong>
          queue age
        </span>
        <span>
          <strong>{incident.relatedItemCount}</strong>
          related
        </span>
      </div>

      <div className="preview-section">
        <p className="eyebrow">Signals</p>
        <div className="signal-row">
          {incident.whySurfaced.slice(0, 3).map((reason) => (
            <SignalPill key={reason}>{reason}</SignalPill>
          ))}
        </div>
      </div>

      <div className="preview-section">
        <p className="eyebrow">Rationale aid</p>
        <p>{incident.rationaleDraft}</p>
      </div>

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
