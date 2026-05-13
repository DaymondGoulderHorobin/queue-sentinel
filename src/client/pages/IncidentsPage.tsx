import { StatusBadge } from '../components/StatusBadge';
import type { IncidentPriority, QueueIncident } from '../../shared/types';

interface IncidentsPageProps {
  incidents: QueueIncident[];
}

const priorityTone = (priority: IncidentPriority) => {
  return priority;
};

export const IncidentsPage = ({ incidents }: IncidentsPageProps) => {
  return (
    <section className="page-stack" aria-labelledby="incidents-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Incident queue</p>
          <h2 id="incidents-title">Mock incidents</h2>
        </div>
      </div>

      <div className="incident-list">
        {incidents.map((incident) => (
          <article className="incident-row" key={incident.id}>
            <div className="incident-row__main">
              <div className="incident-row__header">
                <StatusBadge tone={priorityTone(incident.priority)}>
                  {incident.priority}
                </StatusBadge>
                <span>{incident.itemType}</span>
                <span>{incident.status}</span>
              </div>
              <h3>{incident.title}</h3>
              <p>{incident.whySurfaced[0]}</p>
            </div>
            <div className="incident-row__metrics">
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
          </article>
        ))}
      </div>
    </section>
  );
};
