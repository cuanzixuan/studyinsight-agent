export default function AgentPlan({ plan }) {
  if (!plan?.length) return null;
  return (
    <section className="card">
      <div className="section-title">
        <h2>Agent Plan</h2>
        <span className="badge success">{plan.length} steps</span>
      </div>
      <div className="plan-list">
        {plan.map((item, index) => (
          <article className="plan-item" key={`${item.step}-${index}`}>
            <span className="step-number">{index + 1}</span>
            <div>
              <h3>{item.step}</h3>
              <p>{item.description}</p>
              <span className="badge">{item.tool}</span>
            </div>
            <span className="badge success">{item.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
