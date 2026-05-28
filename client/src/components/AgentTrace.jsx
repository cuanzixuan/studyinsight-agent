export default function AgentTrace({ trace }) {
  if (!trace?.length) return null;

  return (
    <section className="card accent-amber">
      <div className="section-title">
        <h2>Agent Trace</h2>
        <span className="badge success">action-observation log</span>
      </div>
      <div className="trace-list">
        {trace.map((item, index) => (
          <article className="trace-item" key={`${item.step}-${index}`}>
            <span className="trace-index">{index + 1}</span>
            <div>
              <h3>{item.step}</h3>
              <dl>
                <div>
                  <dt>Action</dt>
                  <dd>{item.action}</dd>
                </div>
                <div>
                  <dt>Tool</dt>
                  <dd>{item.tool}</dd>
                </div>
                <div>
                  <dt>Observation</dt>
                  <dd>{item.observation}</dd>
                </div>
                <div>
                  <dt>Reason</dt>
                  <dd>{item.reason}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
