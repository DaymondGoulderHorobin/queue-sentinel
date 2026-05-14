import { SCORED_DEMO_INCIDENTS } from './incidentMaterializer';
import type { IncidentStore } from './incidentStore';

export const seedDemoQueue = async (
  store: IncidentStore,
  options?: { overwrite?: boolean },
) => {
  const result = await store.seedDemoIncidents(options);
  const incidents = await store.listIncidents();

  return {
    result,
    incidents: incidents.length > 0 ? [...incidents] : [...SCORED_DEMO_INCIDENTS],
  };
};

export const resetDemoQueue = async (store: IncidentStore) => {
  const result = await store.resetDemoIncidents();
  const incidents = await store.listIncidents();

  return {
    result,
    incidents: [...incidents],
  };
};
