export default function AdaptiveDecision({ decision }) {
  if (!decision) return null;

  const warnings = Array.isArray(decision.warnings) ? decision.warnings : [];
  const insertedTools = Array.isArray(decision.insertedTools) ? decision.insertedTools : [];

  return (
    <section className={`card adaptive-decision-card ${decision.fallbackUsed ? 'accent-amber' : 'accent-blue'}`}>
      <div className="section-title">
        <div>
          <h2>Adaptive Decision</h2>
          <p className="section-subtitle">How the agent adjusted the run based on dataset observations.</p>
        </div>
        <span className={decision.fallbackUsed ? 'fallback-badge warning' : 'fallback-badge success'}>
          Fallback Used: {decision.fallbackUsed ? 'Yes' : 'No'}
        </span>
      </div>

      <div className="adaptive-grid">
        <div className="decision-field">
          <span>Original Goal</span>
          <strong>{decision.originalGoal}</strong>
        </div>
        <div className="decision-field">
          <span>Executed Goal</span>
          <strong>{decision.executedGoal}</strong>
        </div>
        <div className="decision-field wide">
          <span>Reason</span>
          <strong>{decision.reason}</strong>
        </div>
      </div>

      <div className="decision-section">
        <h3>Dataset Warnings</h3>
        {warnings.length ? (
          <ul className="warning-list">
            {warnings.map((warning, index) => <li key={index}>{warning}</li>)}
          </ul>
        ) : (
          <p className="muted">No dataset warnings detected.</p>
        )}
      </div>

      <div className="decision-section">
        <h3>Dynamically Inserted Tools</h3>
        {insertedTools.length ? (
          <div className="tool-chip-list">
            {insertedTools.map((tool, index) => <span className="tool-chip" key={`${tool}-${index}`}>{tool}</span>)}
          </div>
        ) : (
          <p className="muted">No additional adaptive tools were required.</p>
        )}
      </div>
    </section>
  );
}
