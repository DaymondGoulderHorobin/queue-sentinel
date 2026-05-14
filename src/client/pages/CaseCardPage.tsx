import { StatusBadge } from '../components/StatusBadge';
import { PRIMARY_DEMO_INCIDENT } from '../../shared/demoData';
import type { QueueIncident } from '../../shared/types';

interface CaseCardPageProps {
  incidents: QueueIncident[];
}

export const CaseCardPage = ({ incidents }: CaseCardPageProps) => {
  const incident = incidents[0] ?? PRIMARY_DEMO_INCIDENT;

  return (
    <section className="page-stack" aria-labelledby="case-card-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Case card</p>
          <h2 id="case-card-title">{incident.title}</h2>
        </div>
        <StatusBadge tone={incident.priority}>{incident.priority}</StatusBadge>
      </div>

      <article className="case-card">
        <div className="case-card__summary">
          <div>
            <p className="eyebrow">User context</p>
            <p>{incident.userContextSummary}</p>
          </div>
          <div>
            <p className="eyebrow">Related items</p>
            <strong>{incident.relatedItemCount}</strong>
          </div>
          <div>
            <p className="eyebrow">Suspected rule area</p>
            <p>{incident.suspectedRuleArea}</p>
          </div>
        </div>

        <div className="rationale-box">
          <p className="eyebrow">Rationale draft</p>
          <p>{incident.rationaleDraft}</p>
        </div>

        <div>
          <p className="eyebrow">Why surfaced</p>
          <ul className="reason-list">
            {incident.whySurfaced.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="disabled-actions" aria-label="Disabled moderator actions">
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
      </article>
    </section>
  );
};
