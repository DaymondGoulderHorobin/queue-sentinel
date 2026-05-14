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
    title: 'Escalation settings',
    description: 'Prepare handoff labels without enabling enforcement.',
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
  isMutating: boolean;
  onRefresh: () => void;
  onResetDemo: () => void;
  onSeedDemo: () => void;
}

export const SettingsPage = ({
  dataStatus,
  errorMessage,
  incidentCount,
  isMutating,
  onRefresh,
  onResetDemo,
  onSeedDemo,
}: SettingsPageProps) => {
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
