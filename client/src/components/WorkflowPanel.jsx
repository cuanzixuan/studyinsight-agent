const steps = [
  'Dataset loaded',
  'Schema profiled',
  'Analysis goal interpreted',
  'Agent plan generated',
  'Data tools executed',
  'Chart generated',
  'Insight report generated'
];

export default function WorkflowPanel({ completed }) {
  return (
    <section className="card">
      <div className="section-title">
        <h2>Agent Workflow</h2>
        <span className="badge">{completed ? 'complete' : 'waiting'}</span>
      </div>
      <div className="workflow-grid">
        {steps.map((step) => (
          <div className="workflow-step" key={step}>
            <span className={completed ? 'check on' : 'check'}>{completed ? '✓' : '•'}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
