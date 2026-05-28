export default function DatasetPreview({ profile }) {
  if (!profile) return null;
  const rows = profile.sampleRows || [];

  return (
    <section className="card">
      <div className="section-title">
        <div>
          <h2>Dataset Preview</h2>
          <p className="section-subtitle">First five rows plus detected schema information.</p>
        </div>
        <span className="badge">{profile.rowCount} rows / {profile.columnCount} columns</span>
      </div>
      <div className="meta-grid">
        <div><strong>{profile.rowCount}</strong><span>Rows</span></div>
        <div><strong>{profile.columnCount}</strong><span>Columns</span></div>
        <div><strong>{profile.numericColumns.length}</strong><span>Numeric: {profile.numericColumns.join(', ') || 'None'}</span></div>
        <div><strong>{profile.categoricalColumns.length}</strong><span>Categorical: {profile.categoricalColumns.join(', ') || 'None'}</span></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{profile.columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {profile.columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
