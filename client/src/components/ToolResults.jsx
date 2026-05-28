function format(value) {
  if (Array.isArray(value)) return `${value.length} rows`;
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

export default function ToolResults({ goal, results }) {
  if (!results) return null;
  if (results.error) {
    return (
      <section className="card">
        <h2>Tool Execution Results</h2>
        <div className="notice warning">{results.message}</div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-title">
        <div>
          <h2>Tool Execution Results</h2>
          <p className="section-subtitle">Computed outputs from deterministic analysis tools.</p>
        </div>
        <span className="badge">{goal}</span>
      </div>
      {goal === 'Overall Summary' && (
        <>
          <div className="metric-grid">
            <div><strong>{results.rowCount}</strong><span>Rows</span></div>
            <div><strong>{results.columnCount}</strong><span>Columns</span></div>
            <div><strong>{results.numericSummaries.length}</strong><span>Numeric summaries</span></div>
          </div>
          <MiniTable rows={results.numericSummaries.slice(0, 6)} />
        </>
      )}
      {goal === 'Compare Categories' && (
        <>
          <div className="metric-grid">
            <div><strong>{results.categoryColumn}</strong><span>Category</span></div>
            <div><strong>{results.numericColumn}</strong><span>Metric</span></div>
            <div><strong>{results.highestGroup?.category}</strong><span>Highest group ({results.highestGroup?.mean})</span></div>
            <div><strong>{results.lowestGroup?.category}</strong><span>Lowest group ({results.lowestGroup?.mean})</span></div>
          </div>
          <MiniTable rows={results.groupedMeans} />
        </>
      )}
      {goal === 'Find Relationships' && (
        <>
          <div className="metric-grid">
            <div><strong>{results.strongestPair.join(' + ')}</strong><span>Strongest pair</span></div>
            <div><strong>{results.correlationValue}</strong><span>Correlation</span></div>
            <div><strong>{results.correlationValue >= 0 ? 'Positive' : 'Negative'}</strong><span>Relationship direction</span></div>
            <div><strong>{results.allCorrelations.length}</strong><span>Pairs tested</span></div>
          </div>
          <MiniTable rows={results.allCorrelations.slice(0, 8)} />
        </>
      )}
      {goal === 'Detect Anomalies' && (
        <>
          <div className="metric-grid">
            <div><strong>{results.numericColumn}</strong><span>Column</span></div>
            <div><strong>{results.anomalyCount}</strong><span>Anomalies</span></div>
            <div><strong>{results.lowerBound} to {results.upperBound}</strong><span>IQR bounds</span></div>
          </div>
          <MiniTable rows={[{
            q1: results.q1,
            q3: results.q3,
            iqr: results.iqr,
            normalCount: results.normalCount,
            anomalyCount: results.anomalyCount
          }]} />
        </>
      )}
    </section>
  );
}

function MiniTable({ rows }) {
  if (!rows?.length) return <p className="muted">No rows to display.</p>;
  const columns = Object.keys(rows[0]);
  return (
    <div className="table-wrap compact">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>{columns.map((column) => <td key={column}>{format(row[column])}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
