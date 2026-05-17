import type {
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../../shared/apiTypes';

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
  dataStatus: string;
  errorMessage: string | null;
  incidentCount: number;
  ingestionStatus: IngestionStatusResponse;
  isMutating: boolean;
  onPreviewIngestion: () => void;
  onRefresh: () => void;
  onRefreshIngestion: () => void;
  onRecomputeScoring: () => void;
  onResetDemo: () => void;
  onResetPlaytest: () => void;
  onSeedDemo: () => void;
  onSeedPlaytest: () => void;
  scoringPreview: ScoringPreviewResponse;
}

export const SettingsPage = ({
  dataStatus,
  errorMessage,
  incidentCount,
  ingestionStatus,
  isMutating,
  onPreviewIngestion,
  onRefresh,
  onRefreshIngestion,
  onRecomputeScoring,
  onResetDemo,
  onResetPlaytest,
  onSeedDemo,
  onSeedPlaytest,
  scoringPreview,
}: SettingsPageProps) => {
  const playtestReady =
    ingestionStatus.config.enabled &&
    ingestionStatus.config.mode === 'playtest-readonly';
  const allowedSubreddits =
    ingestionStatus.config.allowedSubredditNames.join(', ') || 'None';
  const lastRun = ingestionStatus.lastRun;

  return (
    <section className="page-stack" aria-labelledby="settings-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Future configuration</p>
          <h2 id="settings-title">Settings placeholders</h2>
        </div>
      </div>

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
        {errorMessage ? <div className="notice-panel">{errorMessage}</div> : null}
        <div className="demo-actions">
          <button disabled={isMutating} onClick={onRefresh} type="button">
            Refresh
          </button>
          <button disabled={isMutating} onClick={onSeedDemo} type="button">
            Seed demo
          </button>
          <button disabled={isMutating} onClick={onResetDemo} type="button">
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
            Allowed <strong>{allowedSubreddits}</strong>
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
            Last run{' '}
            <strong>
              {lastRun ? new Date(lastRun.finishedAt).toLocaleTimeString() : 'None'}
            </strong>
          </span>
        </div>
        <div className="demo-actions">
          <button disabled={isMutating} onClick={onRefreshIngestion} type="button">
            Refresh status
          </button>
          <button
            disabled={isMutating || !playtestReady}
            onClick={onPreviewIngestion}
            type="button"
          >
            Preview ingestion
          </button>
          <button
            disabled={isMutating || !playtestReady}
            onClick={onSeedPlaytest}
            type="button"
          >
            Seed playtest signals
          </button>
          <button
            disabled={isMutating || !playtestReady}
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
          <button disabled={isMutating} onClick={onRecomputeScoring} type="button">
            {isMutating ? 'Recomputing...' : 'Recompute scored incidents'}
          </button>
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
