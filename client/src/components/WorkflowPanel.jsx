const steps = [
  ['Dataset Loaded', 'The source data is available to the agent.'],
  ['Schema Profiled', 'Rows, columns, types, and missing values are observed.'],
  ['Dataset State Evaluated', 'The controller checks missingness, column types, and feasible tools.'],
  ['Adaptive Decision Made', 'Waiting for analysis.'],
  ['Agent Plan Generated', 'The agent selects ordered tools and reasons.'],
  ['Tools Executed', 'Deterministic statistics are computed from the data.'],
  ['Insight Report Generated', 'Findings, next steps, and limits are summarized.']
];

export default function WorkflowPanel({ completed, warning, running, adaptiveDecision }) {
  const status = completed ? 'completed' : running ? 'active' : 'waiting';
  const adaptiveDescription = getAdaptiveDescription(adaptiveDecision);

  return (
    <section className="card accent-workflow">
      <div className="section-title">
        <div>
          <h2>Agent Workflow</h2>
          <p className="section-subtitle">A visible run path from dataset observation to final report.</p>
        </div>
        <div className="title-badges">
          {(warning || adaptiveDecision?.fallbackUsed) && <span className="badge warning">fallback used</span>}
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
              <p>{step === 'Adaptive Decision Made' ? adaptiveDescription : description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getAdaptiveDescription(decision) {
  if (!decision) return 'Waiting for analysis.';
  if (decision.fallbackUsed) return `Fallback to ${decision.executedGoal}.`;
  if (decision.insertedTools?.length) return 'Inserted adaptive tools.';
  return 'Selected goal is feasible.';
}
