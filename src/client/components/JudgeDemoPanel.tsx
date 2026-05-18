import { StatusBadge } from './StatusBadge';
import { DEFAULT_PLAYTEST_FIXTURE_PACK_ID } from '../../shared/playtestFixturePacks';
import {
  buildDemoFlowSteps,
  type DemoFlowStep,
  type DemoFlowStepId,
  type DemoFlowStepState,
} from '../../shared/demoFlow';
import type {
  ApiSource,
  DiagnosticsResponse,
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../../shared/apiTypes';
import type { AuditLogEntry, QueueIncident } from '../../shared/types';

interface JudgeDemoPanelProps {
  auditEntries: AuditLogEntry[];
  dataStatus: 'loading' | ApiSource;
  diagnostics: DiagnosticsResponse;
  incidents: QueueIncident[];
  ingestionStatus: IngestionStatusResponse;
  isMutating: boolean;
  onInspectIncident: (incidentId: string) => void;
  onPreviewIngestion: (fixturePackId?: string) => void;
  onRecomputeScoring: () => void;
  onRefreshDiagnostics: () => void;
  onResetPlaytest: () => void;
  onSeedPlaytest: (fixturePackId?: string) => void;
  scoringPreview: ScoringPreviewResponse;
  topIncidentId?: string | undefined;
}

const stateTone = (state: DemoFlowStepState) => {
  if (state === 'complete') {
    return 'build';
  }

  if (state === 'ready') {
    return 'medium';
  }

  return 'open';
};

const stateLabel = (state: DemoFlowStepState) => {
  if (state === 'complete') {
    return 'Complete';
  }

  if (state === 'ready') {
    return 'Next action';
  }

  if (state === 'fallback') {
    return 'Fallback';
  }

  return 'Blocked';
};

export const JudgeDemoPanel = ({
  auditEntries,
  dataStatus,
  diagnostics,
  incidents,
  ingestionStatus,
  isMutating,
  onInspectIncident,
  onPreviewIngestion,
  onRecomputeScoring,
  onRefreshDiagnostics,
  onResetPlaytest,
  onSeedPlaytest,
  scoringPreview,
  topIncidentId,
}: JudgeDemoPanelProps) => {
  const steps = buildDemoFlowSteps({
    auditEntries,
    dataStatus,
    diagnostics,
    incidents,
    ingestionStatus,
    scoringPreview,
  });

  const runStepAction = (stepId: DemoFlowStepId) => {
    switch (stepId) {
      case 'refresh-diagnostics':
        onRefreshDiagnostics();
        break;
      case 'preview-fixture':
        onPreviewIngestion(DEFAULT_PLAYTEST_FIXTURE_PACK_ID);
        break;
      case 'seed-playtest':
        onSeedPlaytest(DEFAULT_PLAYTEST_FIXTURE_PACK_ID);
        break;
      case 'recompute-scoring':
        onRecomputeScoring();
        break;
      case 'inspect-incident':
        if (topIncidentId) {
          onInspectIncident(topIncidentId);
        }
        break;
      case 'reset-playtest':
        onResetPlaytest();
        break;
      default:
        break;
    }
  };

  const canRunAction = (step: DemoFlowStep) =>
    Boolean(step.actionLabel) &&
    (step.state === 'ready' ||
      step.id === 'refresh-diagnostics' ||
      (step.id === 'inspect-incident' && Boolean(topIncidentId)));

  return (
    <article className="judge-demo-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Judge demo mode</p>
          <h3>One-minute private playtest story</h3>
          <p>
            Walk through diagnostics, fixture preview, authorized seeding,
            deterministic scoring, case review, audit evidence, and reset.
            Scores are triage context only, never enforcement decisions.
          </p>
        </div>
        <StatusBadge tone={diagnostics.authorization.mutationsAllowed ? 'build' : 'open'}>
          {diagnostics.authorization.mutationsAllowed
            ? 'Authorized'
            : 'Read-only safe'}
        </StatusBadge>
      </div>

      <div className="demo-flow-list">
        {steps.map((step, index) => (
          <div className="demo-flow-step" key={step.id}>
            <div className="demo-flow-step__index">{index + 1}</div>
            <div>
              <div className="demo-flow-step__heading">
                <h4>{step.title}</h4>
                <StatusBadge tone={stateTone(step.state)}>
                  {stateLabel(step.state)}
                </StatusBadge>
              </div>
              <p>{step.description}</p>
              {step.actionLabel ? (
                <button
                  className="secondary-action"
                  disabled={isMutating || !canRunAction(step)}
                  onClick={() => runStepAction(step.id)}
                  type="button"
                >
                  {step.actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};
