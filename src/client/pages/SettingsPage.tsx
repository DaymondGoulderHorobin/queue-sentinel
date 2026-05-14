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
    description: 'Keep mock data isolated from real moderator workflows.',
  },
];

export const SettingsPage = () => {
  return (
    <section className="page-stack" aria-labelledby="settings-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Future configuration</p>
          <h2 id="settings-title">Settings placeholders</h2>
        </div>
      </div>

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
