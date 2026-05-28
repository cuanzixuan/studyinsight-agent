const modeLabel = { standard: 'Standard Insight', smart: 'Smart Insight' };

export default function InsightReport({ report, modeUsed, warning }) {
  if (!report) return null;
  return (
    <section className="card insight-card">
      <div className="section-title">
        <h2>Insight Report</h2>
        <span className="badge success">{modeLabel[modeUsed] || modeUsed}</span>
      </div>
      {warning && <div className="notice warning">{warning}</div>}
      <div className="report-section">
        <h3>Summary</h3>
        <p>{report.summary}</p>
      </div>
      <ReportList title="Key Findings" items={report.keyFindings} />
      <ReportList title="Recommended Next Steps" items={report.recommendedNextSteps} />
      <ReportList title="Limitations" items={report.limitations} />
    </section>
  );
}

function ReportList({ title, items }) {
  return (
    <div className="report-section">
      <h3>{title}</h3>
      <ul>{(items || []).map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div>
  );
}
