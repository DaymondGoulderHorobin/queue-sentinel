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
  const topFactor = incident.priorityScore?.factors
    .filter((factor) => factor.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)[0];

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

      <div className="signal-row">
        <SignalPill tone={signalTone(incident.signalStrength)}>
          {incident.signalStrength ?? 'tracked'} signal
        </SignalPill>
        <SignalPill>confidence {incident.confidenceLabel ?? 'medium'}</SignalPill>
        {topFactor ? (
          <SignalPill>
            {topFactor.label} +{topFactor.contribution}
          </SignalPill>
        ) : null}
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
