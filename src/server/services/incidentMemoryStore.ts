import { SCORED_DEMO_INCIDENTS } from './incidentMaterializer';
import type {
  ApiSource,
  IncidentMetadataPatch,
  SeedDemoResult,
} from '../../shared/apiTypes';
import type { IncidentStatus, QueueIncident } from '../types/incident';
import type { IncidentStore } from './incidentStore';

const cloneIncident = (incident: QueueIncident): QueueIncident => ({
  ...incident,
  tags: incident.tags ? [...incident.tags] : undefined,
  whySurfaced: [...incident.whySurfaced],
  timeline: incident.timeline
    ? incident.timeline.map((event) => ({ ...event }))
    : undefined,
});

const applyMetadataPatch = (
  incident: QueueIncident,
  patch: IncidentMetadataPatch,
): QueueIncident => ({
  ...incident,
  ...patch,
  tags: patch.tags ? [...patch.tags] : incident.tags,
  timeline: patch.timeline
    ? patch.timeline.map((event) => ({ ...event }))
    : incident.timeline,
  updatedAt: new Date().toISOString(),
});

export const createIncidentMemoryStore = (
  initialIncidents: readonly QueueIncident[] = [],
  source: ApiSource = 'memory',
): IncidentStore => {
  const incidents = new Map<string, QueueIncident>();

  for (const incident of initialIncidents) {
    incidents.set(incident.id, cloneIncident(incident));
  }

  const seedDemoIncidents = async (options?: { overwrite?: boolean }) => {
    let overwritten = 0;

    for (const incident of SCORED_DEMO_INCIDENTS) {
      if (incidents.has(incident.id)) {
        overwritten += 1;
      }

      if (!incidents.has(incident.id) || options?.overwrite) {
        incidents.set(incident.id, cloneIncident(incident));
      }
    }

    return {
      source,
      count: SCORED_DEMO_INCIDENTS.length,
      overwritten,
    } satisfies SeedDemoResult;
  };

  return {
    mode: 'memory',

    async listIncidents() {
      return [...incidents.values()].map(cloneIncident);
    },

    async getIncident(id) {
      const incident = incidents.get(id);
      return incident ? cloneIncident(incident) : null;
    },

    async upsertIncident(incident) {
      const nextIncident = cloneIncident(incident);
      incidents.set(nextIncident.id, nextIncident);
      return cloneIncident(nextIncident);
    },

    async upsertIncidents(nextIncidents) {
      const storedIncidents = nextIncidents.map(cloneIncident);

      for (const incident of storedIncidents) {
        incidents.set(incident.id, incident);
      }

      return storedIncidents.map(cloneIncident);
    },

    async updateIncidentStatus(id, status: IncidentStatus) {
      const incident = incidents.get(id);

      if (!incident) {
        return null;
      }

      const updatedIncident = {
        ...incident,
        status,
        updatedAt: new Date().toISOString(),
      };
      incidents.set(id, updatedIncident);
      return cloneIncident(updatedIncident);
    },

    async updateIncidentMetadata(id, patch) {
      const incident = incidents.get(id);

      if (!incident) {
        return null;
      }

      const updatedIncident = applyMetadataPatch(incident, patch);
      incidents.set(id, updatedIncident);
      return cloneIncident(updatedIncident);
    },

    seedDemoIncidents,

    async resetDemoIncidents() {
      incidents.clear();
      return await seedDemoIncidents({ overwrite: true });
    },
  };
};
