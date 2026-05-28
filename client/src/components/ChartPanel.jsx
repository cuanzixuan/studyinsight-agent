import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { topValueCounts } from '../utils/stats.js';

export default function ChartPanel({ goal, profile, results, data }) {
  if (!goal || !results || results.error) {
    return (
      <ChartShell profile={profile}>
        <EmptyChartState message="No chart is available for the current analysis." />
      </ChartShell>
    );
  }

  let chart = null;
  if (goal === 'Overall Summary') {
    const missingChartData = missingValueChartData(results);
    const category = results.selectedCategoricalColumn;
    const numeric = results.selectedNumericColumn;
    const rows = Array.isArray(data) ? data : [];
    const chartData = category
      ? topValueCounts(rows, category).map((item) => ({ name: item.value, value: item.count }))
      : rows.slice(0, 20).map((row, index) => ({ name: index + 1, value: Number(row[numeric]) || 0 }));

    if (missingChartData.length) {
      chart = <BasicBar data={missingChartData} name="Missing Count" valueKey="missingCount" />;
    } else if (!chartData.length || (!category && !numeric)) {
      chart = <EmptyChartState message="No summary chart is available for this dataset." />;
    } else {
      chart = <BasicBar data={chartData} name={category || numeric} />;
    }
  }

  if (goal === 'Compare Categories') {
    const groupedMeans = Array.isArray(results.groupedMeans) ? results.groupedMeans : [];
    if (!groupedMeans.length) {
      chart = <EmptyChartState message="No grouped category data is available for this chart." />;
    } else {
      chart = <BasicBar data={groupedMeans.map((item) => ({ name: item.category, value: item.mean }))} name={results.numericColumn} />;
    }
  }

  if (goal === 'Find Relationships') {
    const scatterData = Array.isArray(results.scatterData) ? results.scatterData : [];
    const strongestPair = Array.isArray(results.strongestPair) ? results.strongestPair : [];
    if (!scatterData.length || strongestPair.length < 2) {
      chart = <EmptyChartState message="No relationship chart is available. Please run the analysis again." />;
    } else {
      chart = (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 20, right: 24, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name={strongestPair[0]} />
            <YAxis dataKey="y" name={strongestPair[1]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterData} fill="#2563eb" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
  }

  if (goal === 'Detect Anomalies') {
    const anomalyRows = Array.isArray(results.anomalyRows) ? results.anomalyRows : [];
    const hasCounts = Number.isFinite(results.normalCount) && Number.isFinite(results.anomalyCount);
    if (!hasCounts) {
      chart = <EmptyChartState message="No anomaly chart is available for this analysis." />;
    } else {
      chart = (
        <>
          <BasicBar data={[{ name: 'Normal', value: results.normalCount }, { name: 'Anomaly', value: results.anomalyCount }]} name="Rows" />
          {anomalyRows.length > 0 && (
            <div className="table-wrap compact">
              <table>
                <thead>
                  <tr>{Object.keys(anomalyRows[0]).map((column) => <th key={column}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {anomalyRows.map((row, index) => (
                    <tr key={index}>{Object.keys(anomalyRows[0]).map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );
    }
  }

  if (!chart) {
    chart = <EmptyChartState message="Unsupported chart type." />;
  }

  return (
    <ChartShell profile={profile}>
      {chart}
    </ChartShell>
  );
}

function missingValueChartData(results) {
  const counts = results?.missingValueSummary || {};
  return Object.entries(counts)
    .filter(([, count]) => Number(count) > 0)
    .map(([column, count]) => ({ name: column, column, missingCount: Number(count) || 0 }))
    .sort((a, b) => b.missingCount - a.missingCount);
}

function BasicBar({ data, name, valueKey = 'value' }) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={safeData} margin={{ top: 20, right: 24, bottom: 40, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={valueKey} name={name}>
          {safeData.map((entry, index) => <Cell key={entry.name} fill={index % 2 ? '#0f766e' : '#2563eb'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartShell({ profile, children }) {
  return (
    <section className="card chart-card">
      <div className="section-title">
        <div>
          <h2>Visualization</h2>
          <p className="section-subtitle">A responsive chart generated from the selected analysis result.</p>
        </div>
        <span className="badge">{profile?.rowCount || 0} rows analyzed</span>
      </div>
      <div className="chart-frame">{children}</div>
    </section>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="empty-state small-empty">
      <strong>No chart available</strong>
      <p>{message}</p>
    </div>
  );
}
