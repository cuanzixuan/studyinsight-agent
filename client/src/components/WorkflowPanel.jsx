const steps = [
  ['Dataset Loaded', 'The source data is available to the agent.'],
  ['Schema Profiled', 'Rows, columns, types, and missing values are observed.'],
  ['Goal Interpreted', 'The selected analysis goal is mapped to a strategy.'],
  ['Agent Plan Generated', 'The agent selects ordered tools and reasons.'],
  ['Tools Executed', 'Deterministic statistics are computed from the data.'],
  ['Chart Generated', 'A goal-specific visualization is prepared.'],
  ['Insight Report Generated', 'Findings, next steps, and limits are summarized.']
];

export default function WorkflowPanel({ completed, warning, running }) {
  const status = completed ? 'completed' : running ? 'active' : 'waiting';

  return (
    <section className="card accent-workflow">
      <div className="section-title">
        <div>
          <h2>Agent Workflow</h2>
          <p className="section-subtitle">A visible run path from dataset observation to final report.</p>
        </div>
        <div className="title-badges">
          {warning && <span className="badge warning">fallback used</span>}
          <span className={`badge ${status}`}>{status}</span>
        </div>
      </div>
      <div className="workflow-grid">
        {steps.map(([step, description], index) => (
          <div className={`workflow-step ${status}`} key={step}>
            <span className="workflow-number">{index + 1}</span>
            <div>
              <div className="workflow-step-header">
                <strong>{step}</strong>
                <span className={`status-pill ${status}`}>{status}</span>
              </div>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
