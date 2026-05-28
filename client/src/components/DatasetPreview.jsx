export default function DatasetPreview({ profile }) {
  if (!profile) return null;
  const rows = profile.sampleRows || [];

  return (
    <section className="card">
      <div className="section-title">
        <h2>Dataset Preview</h2>
        <span className="badge">{profile.rowCount} rows · {profile.columnCount} columns</span>
      </div>
      <div className="meta-grid">
        <div><strong>Numeric</strong><span>{profile.numericColumns.join(', ') || 'None'}</span></div>
        <div><strong>Categorical</strong><span>{profile.categoricalColumns.join(', ') || 'None'}</span></div>
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
