import { DEMO_INCIDENTS } from '../../shared/demoData';
import type { IncidentStatus, QueueIncident } from '../types/incident';

export interface IncidentStore {
  getIncident: (id: string) => Promise<QueueIncident | null>;
  listIncidents: () => Promise<readonly QueueIncident[]>;
  updateIncidentStatus: (
    id: string,
    status: IncidentStatus,
  ) => Promise<QueueIncident | null>;
}

export const incidentStore: IncidentStore = {
  async getIncident(id) {
    return DEMO_INCIDENTS.find((incident) => incident.id === id) ?? null;
  },

  async listIncidents() {
    return DEMO_INCIDENTS;
  },

  async updateIncidentStatus(id, status) {
    const incident = DEMO_INCIDENTS.find((candidate) => candidate.id === id);

    if (!incident) {
      return null;
    }

    return {
      ...incident,
      status,
      updatedAt: new Date().toISOString(),
    };
  },
};
