const modes = [
  { id: 'standard', name: 'Standard Insight', helper: 'Fast and reproducible local summary.' },
  { id: 'smart', name: 'Smart Insight', helper: 'AI-enhanced summary using an optional LLM API.' }
];

export default function InsightModeSelector({ mode, onModeChange }) {
  return (
    <section className="card control-card accent-emerald">
      <div>
        <h2>Insight Mode</h2>
        <p className="muted">Standard mode works without any API key.</p>
      </div>
      <div className="mode-grid">
        {modes.map((item) => (
          <button
            key={item.id}
            className={`mode-card ${mode === item.id ? 'selected' : ''}`}
            type="button"
            onClick={() => onModeChange(item.id)}
          >
            <strong>{item.name}</strong>
            <span>{item.helper}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
