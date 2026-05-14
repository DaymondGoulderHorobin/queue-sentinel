import type { AppTab } from './types';

export const APP_NAME = 'Queue Sentinel';

export const APP_TAGLINE =
  'A moderation workbench for turning noisy queues into explainable incident cards.';

export const SPRINT_LABEL = 'Sprint 1 Build';

export const APP_TABS: AppTab[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'case-card', label: 'Case Card' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'settings', label: 'Settings' },
];
