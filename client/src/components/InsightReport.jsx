const modeLabel = { standard: 'Standard Insight', smart: 'Smart Insight' };

export default function InsightReport({ report, modeUsed, warning, onNextAction }) {
  if (!report) return null;
  return (
    <section className="card insight-card accent-emerald">
      <div className="section-title">
        <h2>Insight Report</h2>
        <span className="badge success">{modeLabel[modeUsed] || modeUsed}</span>
      </div>
      {warning && <div className="notice warning">{warning}</div>}
      <div className="report-section">
        <h3>Summary</h3>
        <p className="summary-box">{report.summary}</p>
      </div>
      <ReportList title="Key Findings" items={report.keyFindings} numbered />
      <ReportList title="Recommended Next Steps" items={report.recommendedNextSteps} />
      <NextActions actions={report.recommendedNextActions} onNextAction={onNextAction} />
      <ReportList title="Limitations" items={report.limitations} muted />
    </section>
  );
}

function ReportList({ title, items, numbered, muted }) {
  const ListTag = numbered ? 'ol' : 'ul';
  return (
    <div className={muted ? 'report-section muted-box' : 'report-section'}>
      <h3>{title}</h3>
      <ListTag>{(items || []).map((item, index) => <li key={index}>{item}</li>)}</ListTag>
    </div>
  );
}

function NextActions({ actions, onNextAction }) {
  if (!actions?.length) return null;
  const validGoals = ['Overall Summary', 'Compare Categories', 'Find Relationships', 'Detect Anomalies'];
  return (
    <div className="report-section">
      <h3>Recommended Next Actions</h3>
      <div className="next-action-list">
        {actions.map((action, index) => {
          const isValid = action && validGoals.includes(action.goal);
          return (
          <button
            className={isValid ? 'next-action' : 'next-action disabled'}
            key={`${action.goal}-${action.label}-${index}`}
            type="button"
            disabled={!isValid}
            onClick={() => isValid && onNextAction?.(action)}
          >
            <strong>{action?.goal || 'Unsupported action'}</strong>
            <span>{action?.label || 'This recommendation is not available.'}</span>
          </button>
          );
        })}
      </div>
    </div>
  );
}
