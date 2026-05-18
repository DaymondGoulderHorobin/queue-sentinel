import { useState } from 'react';

import { StatusBadge } from '../components/StatusBadge';
import type {
  DiagnosticsResponse,
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../../shared/apiTypes';
import { DEFAULT_PLAYTEST_FIXTURE_PACK_ID } from '../../shared/playtestFixturePacks';
import type { AuditLogEntry } from '../../shared/types';

const settingsSections = [
  {
    title: 'Rule mapping',
    description: 'Connect subreddit report reasons to incident categories.',
  },
  {
    title: 'Scoring weights',
    description: 'Tune report volume, age, and related-item influence.',
  },
  {
    title: 'Review routing',
    description: 'Prepare internal labels without external handoff.',
  },
  {
    title: 'Demo mode',
    description: 'Keep demo data isolated from real moderator workflows.',
  },
];

interface SettingsPageProps {
  auditEntries: AuditLogEntry[];
  dataStatus: string;
  diagnostics: DiagnosticsResponse;
  errorMessage: string | null;
  incidentCount: number;
  ingestionStatus: IngestionStatusResponse;
  isMutating: boolean;
  onPreviewIngestion: (fixturePackId?: string) => void;
  onRefresh: () => void;
  onRefreshDiagnostics: () => void;
  onRefreshIngestion: () => void;
  onRecomputeScoring: () => void;
  onResetDemo: () => void;
  onResetPlaytest: () => void;
  onSeedDemo: () => void;
  onSeedPlaytest: (fixturePackId?: string) => void;
  scoringPreview: ScoringPreviewResponse;
}

const formatTime = (timestamp: string | null | undefined) => {
  return timestamp ? new Date(timestamp).toLocaleTimeString() : 'None';
};

const operationLabel = (entry: AuditLogEntry) => {
  return entry.operation.replaceAll('.', ' ');
};

export const SettingsPage = ({
  auditEntries,
  dataStatus,
  diagnostics,
  errorMessage,
  incidentCount,
  ingestionStatus,
  isMutating,
  onPreviewIngestion,
  onRefresh,
  onRefreshDiagnostics,
  onRefreshIngestion,
  onRecomputeScoring,
  onResetDemo,
  onResetPlaytest,
  onSeedDemo,
  onSeedPlaytest,
  scoringPreview,
}: SettingsPageProps) => {
  const [selectedFixturePackId, setSelectedFixturePackId] = useState(
    DEFAULT_PLAYTEST_FIXTURE_PACK_ID,
  );
  const playtestReady =
    ingestionStatus.config.enabled &&
    ingestionStatus.config.mode === 'playtest-readonly';
  const mutationsAllowed = diagnostics.authorization.mutationsAllowed;
  const playtestMutationReady = playtestReady && mutationsAllowed;
  const allowedSubreddits =
    ingestionStatus.config.allowedSubredditNames.join(', ') || 'None';
  const lastRun = ingestionStatus.lastRun;
  const fixturePacks = diagnostics.ingestion.availableFixturePacks;
  const selectedFixturePack =
    fixturePacks.find((pack) => pack.id === selectedFixturePackId) ??
    fixturePacks[0];
  const activeFixturePackId =
    selectedFixturePack?.id ?? DEFAULT_PLAYTEST_FIXTURE_PACK_ID;
  const recentAuditEntries = auditEntries.slice(0, 5);
  const ingestionNotice = !playtestReady
    ? 'Read-only ingestion is disabled. Set QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true and allowlist a private test subreddit before seeding metadata.'
    : !mutationsAllowed
      ? `${diagnostics.authorization.message} Mutation routes are intentionally blocked until a moderator context or explicit local bypass is available.`
      : ingestionStatus.signalCount === 0
        ? 'No playtest signals are stored yet. Preview a fixture pack first, then seed it when authorized.'
        : null;
  const storeNotice =
    dataStatus === 'fallback' || diagnostics.source === 'fallback'
      ? 'Browser fallback mode is active. UI metrics are synthetic; Redis, authorization checks, and audit writes are unavailable.'
      : diagnostics.stores.incidentStoreMode === 'memory'
        ? 'Memory store mode is active. This is safe for local demos but does not persist across server restarts.'
        : null;
  const productionSafeDefault =
    !ingestionStatus.config.enabled && !diagnostics.authorization.mutationsAllowed;
  const readinessModes = [
    {
      description:
        'Synthetic incidents, Judge Demo Mode, and browser-shell review remain available without touching Reddit moderation state.',
      label: 'Demo Mode',
      status: 'Ready',
      tone: 'build' as const,
    },
    {
      description: playtestMutationReady
        ? 'Allowlisted read-only metadata can be seeded, recomputed, audited, and reset in the private playtest.'
        : playtestReady
          ? 'Read-only ingestion is configured, but mutation controls still require moderator authorization or explicit local bypass.'
          : 'Read-only ingestion is disabled until the playtest flag and private subreddit allowlist are configured.',
      label: 'Private Playtest Mode',
      status: playtestMutationReady ? 'Ready' : playtestReady ? 'Guarded' : 'Disabled',
      tone: playtestMutationReady ? ('build' as const) : ('open' as const),
    },
    {
      description:
        'Fresh runs keep ingestion disabled by default and block sensitive mutations unless authorization is available.',
      label: 'Production-Safe Default Mode',
      status: productionSafeDefault ? 'Safe' : 'Review',
      tone: productionSafeDefault ? ('build' as const) : ('medium' as const),
    },
    {
      description:
        dataStatus === 'fallback' || diagnostics.source === 'fallback'
          ? 'Synthetic local data is visible; Redis, authorization, audit writes, and playtest mutations are unavailable.'
          : 'Server API diagnostics are available, so fallback data is not being used for this view.',
      label: 'Browser Fallback',
      status:
        dataStatus === 'fallback' || diagnostics.source === 'fallback'
          ? 'Active'
          : 'Inactive',
      tone:
        dataStatus === 'fallback' || diagnostics.source === 'fallback'
          ? ('medium' as const)
          : ('build' as const),
    },
    {
      description: mutationsAllowed
        ? 'Moderator authorization or explicit local bypass is available for Queue Sentinel mutations.'
        : 'Mutation routes are blocked; read-only status, diagnostics, previews, lists, and details remain safe to review.',
      label: 'Authorization',
      status: mutationsAllowed ? 'Authorized' : 'Guarded',
      tone: mutationsAllowed ? ('build' as const) : ('open' as const),
    },
  ];

  return (
    <section className="page-stack" aria-labelledby="settings-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Private playtest controls</p>
          <h2 id="settings-title">Settings and diagnostics</h2>
        </div>
      </div>

      <article className="demo-panel readiness-panel">
        <div>
          <p className="eyebrow">Submission readiness</p>
          <h3>Operating modes</h3>
          <p>
            Queue Sentinel is packaged for demo, private playtest, and
            production-safe review. Scores remain triage context only, and
            Reddit-facing moderation actions stay disabled.
          </p>
        </div>
        <div className="readiness-grid">
          {readinessModes.map((mode) => (
            <div className="readiness-card" key={mode.label}>
              <div className="readiness-card__heading">
                <strong>{mode.label}</strong>
                <StatusBadge tone={mode.tone}>{mode.status}</StatusBadge>
              </div>
              <p>{mode.description}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="demo-panel">
        <div>
          <p className="eyebrow">Authorization and diagnostics</p>
          <h3>Runtime readiness</h3>
          <p>
            Sensitive Queue Sentinel mutations require moderator authorization
            or the explicit local test bypass. Read-only status, preview, list,
            and detail routes remain open.
          </p>
        </div>
        <div className="demo-panel__meta">
          <span>
            Runtime <strong>{diagnostics.runtimeMode}</strong>
          </span>
          <span>
            Incident store <strong>{diagnostics.stores.incidentStoreMode}</strong>
          </span>
          <span>
            Signal store <strong>{diagnostics.stores.signalStoreMode}</strong>
          </span>
          <span>
            Audit store <strong>{diagnostics.stores.auditStoreMode}</strong>
          </span>
          <span>
            Authorization <strong>{diagnostics.authorization.mode}</strong>
          </span>
          <span>
            Mutations{' '}
            <strong>{mutationsAllowed ? 'authorized' : 'not authorized'}</strong>
          </span>
          <span>
            Last scoring{' '}
            <strong>{formatTime(diagnostics.scoring.lastRecomputeAt)}</strong>
          </span>
          <span>
            Audit entries <strong>{diagnostics.audit.entryCount}</strong>
          </span>
        </div>
        {diagnostics.fallbackWarning ? (
          <div className="notice-panel">{diagnostics.fallbackWarning}</div>
        ) : null}
        {!diagnostics.authorization.mutationsAllowed ? (
          <div className="notice-panel">
            Authorization unavailable means mutation routes are blocked by
            design. Read-only status, diagnostics, previews, lists, and detail
            routes can still be reviewed safely.
          </div>
        ) : null}
        <div className="demo-actions">
          <button disabled={isMutating} onClick={onRefreshDiagnostics} type="button">
            Refresh diagnostics
          </button>
        </div>
      </article>

      <article className="demo-panel">
        <div>
          <p className="eyebrow">Demo persistence controls</p>
          <h3>Seed and reset safe demo incidents</h3>
          <p>
            These controls update Queue Sentinel incident state only. They do not
            ingest live Reddit reports or perform moderation actions.
          </p>
        </div>
        <div className="demo-panel__meta">
          <span>
            Store mode <strong>{dataStatus}</strong>
          </span>
          <span>
            Incidents <strong>{incidentCount}</strong>
          </span>
        </div>
        {storeNotice ? <div className="notice-panel">{storeNotice}</div> : null}
        {errorMessage ? <div className="notice-panel">{errorMessage}</div> : null}
        <div className="demo-actions">
          <button disabled={isMutating} onClick={onRefresh} type="button">
            Refresh
          </button>
          <button
            disabled={isMutating || !mutationsAllowed}
            onClick={onSeedDemo}
            type="button"
          >
            Seed demo
          </button>
          <button
            disabled={isMutating || !mutationsAllowed}
            onClick={onResetDemo}
            type="button"
          >
            Reset demo
          </button>
        </div>
      </article>

      <article className="demo-panel">
        <div>
          <p className="eyebrow">Read-only ingestion controls</p>
          <h3>Playtest signal intake</h3>
          <p>
            Playtest intake accepts only metadata from an allowlisted private
            test subreddit and writes to the signal store, not moderation state.
          </p>
        </div>
        <div className="demo-panel__meta">
          <span>
            Mode <strong>{ingestionStatus.config.mode}</strong>
          </span>
          <span>
            Store <strong>{ingestionStatus.config.storeMode}</strong>
          </span>
          <span>
            Allowlist <strong>{allowedSubreddits}</strong>
          </span>
          <span>
            Signals <strong>{ingestionStatus.signalCount}</strong>
          </span>
          <span>
            Accepted <strong>{lastRun?.acceptedSignals ?? 0}</strong>
          </span>
          <span>
            Rejected <strong>{lastRun?.rejectedSignals ?? 0}</strong>
          </span>
          <span>
            Last run <strong>{formatTime(lastRun?.finishedAt)}</strong>
          </span>
        </div>
        <label className="fixture-picker">
          Fixture pack
          <select
            disabled={isMutating || fixturePacks.length === 0}
            onChange={(event) => setSelectedFixturePackId(event.target.value)}
            value={activeFixturePackId}
          >
            {fixturePacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.label} ({pack.itemCount})
              </option>
            ))}
          </select>
          <span>{selectedFixturePack?.description ?? 'No fixture pack loaded.'}</span>
        </label>
        {ingestionNotice ? (
          <div className="notice-panel">{ingestionNotice}</div>
        ) : null}
        <div className="demo-actions">
          <button disabled={isMutating} onClick={onRefreshIngestion} type="button">
            Refresh status
          </button>
          <button
            disabled={isMutating || !playtestReady}
            onClick={() => onPreviewIngestion(activeFixturePackId)}
            type="button"
          >
            Preview ingestion
          </button>
          <button
            disabled={isMutating || !playtestMutationReady}
            onClick={() => onSeedPlaytest(activeFixturePackId)}
            type="button"
          >
            Seed playtest signals
          </button>
          <button
            disabled={isMutating || !playtestMutationReady}
            onClick={onResetPlaytest}
            type="button"
          >
            Reset playtest signals
          </button>
        </div>
      </article>

      <article className="demo-panel">
        <div>
          <p className="eyebrow">Deterministic scoring controls</p>
          <h3>Recompute clustering and priority scores</h3>
          <p>
            This scores synthetic demo signals or accepted read-only playtest
            signals. It does not call AI, notify anyone, or perform moderation
            actions.
          </p>
        </div>
        <div className="demo-panel__meta">
          <span>
            Model <strong>{scoringPreview.modelVersion}</strong>
          </span>
          <span>
            Clusters <strong>{scoringPreview.clustersFormed}</strong>
          </span>
          <span>
            Source <strong>{scoringPreview.signalSource}</strong>
          </span>
        </div>
        <div className="demo-actions">
          <button
            disabled={isMutating || !mutationsAllowed}
            onClick={onRecomputeScoring}
            type="button"
          >
            {isMutating ? 'Recomputing...' : 'Recompute scored incidents'}
          </button>
        </div>
      </article>

      <article className="demo-panel">
        <div>
          <p className="eyebrow">Audit log</p>
          <h3>Recent safe operations</h3>
          <p>
            These are Queue Sentinel operation records, not Reddit moderation
            logs. They contain safe counts and route names only.
          </p>
        </div>
        <div className="audit-list">
          {recentAuditEntries.length > 0 ? (
            recentAuditEntries.map((entry) => (
              <div className="audit-row" key={entry.id}>
                <strong>{operationLabel(entry)}</strong>
                <span>{entry.outcome}</span>
                <time>{formatTime(entry.timestamp)}</time>
              </div>
            ))
          ) : (
            <p>No audit entries recorded yet.</p>
          )}
        </div>
      </article>

      <div className="settings-grid">
        {settingsSections.map((section) => (
          <article className="settings-item" key={section.title}>
            <div className="settings-toggle" aria-hidden="true" />
            <div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
