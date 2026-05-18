// Server-side import boundary for scoring materialization. Keep server code
// importing through this module so future persistence-specific shaping can live
// here without touching shared scoring logic.
export {
  buildDemoScoringPreview,
  materializeClusteredIncidents,
  SCORED_DEMO_INCIDENTS,
} from '../../shared/scoringEngine';
