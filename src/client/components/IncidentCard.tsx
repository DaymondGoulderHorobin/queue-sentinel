import { SignalPill } from './SignalPill';
import { StatusBadge } from './StatusBadge';
import type { QueueIncident } from '../../shared/types';

interface IncidentCardProps {
  incident: QueueIncident;
  isSelected: boolean;
  onOpenCaseCard: (incidentId: string) => void;
  onSelect: (incidentId: string) => void;
}

const signalTone = (signalStrength: QueueIncident['signalStrength']) => {
  if (signalStrength === 'high') {
    return 'strong';
  }

  return signalStrength ?? 'neutral';
};

export const IncidentCard = ({
  incident,
  isSelected,
  onOpenCaseCard,
  onSelect,
}: IncidentCardProps) => {
  return (
    <article
      className={`incident-card ${isSelected ? 'incident-card--selected' : ''}`}
    >
      <button
        aria-pressed={isSelected}
        className="incident-card__select"
        onClick={() => onSelect(incident.id)}
        type="button"
      >
        <span className="incident-card__meta">
          <StatusBadge tone={incident.priority}>{incident.priority}</StatusBadge>
          <StatusBadge tone={incident.status}>{incident.status}</StatusBadge>
          <span>{incident.itemType}</span>
        </span>
        <span className="incident-card__title">{incident.title}</span>
        <span className="incident-card__rule">{incident.suspectedRuleArea}</span>
        <span className="incident-card__reason">{incident.whySurfaced[0]}</span>
      </button>

      <div className="metric-strip" aria-label={`${incident.title} metrics`}>
        <span>
          <strong>{incident.reportCount}</strong>
          reports
        </span>
        <span>
          <strong>{incident.queueAgeMinutes}m</strong>
          age
        </span>
        <span>
          <strong>{incident.relatedItemCount}</strong>
          related
        </span>
      </div>

      <div className="signal-row">
        <SignalPill tone={signalTone(incident.signalStrength)}>
          {incident.signalStrength ?? 'tracked'} signal
        </SignalPill>
        <SignalPill>confidence {incident.confidenceLabel ?? 'medium'}</SignalPill>
        {(incident.tags ?? []).slice(0, 3).map((tag) => (
          <SignalPill key={tag}>{tag}</SignalPill>
        ))}
      </div>

      <button
        className="secondary-action"
        onClick={() => onOpenCaseCard(incident.id)}
        type="button"
      >
        Open case card
      </button>
    </article>
  );
};
