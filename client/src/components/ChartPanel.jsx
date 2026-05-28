import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { topValueCounts } from '../utils/stats.js';

export default function ChartPanel({ goal, profile, results, data }) {
  if (!results || results.error) return null;

  let chart = null;
  if (goal === 'Overall Summary') {
    const category = results.selectedCategoricalColumn;
    const numeric = results.selectedNumericColumn;
    const chartData = category
      ? topValueCounts(data, category).map((item) => ({ name: item.value, value: item.count }))
      : data.slice(0, 20).map((row, index) => ({ name: index + 1, value: Number(row[numeric]) || 0 }));
    chart = <BasicBar data={chartData} name={category || numeric} />;
  }

  if (goal === 'Compare Categories') {
    chart = <BasicBar data={results.groupedMeans.map((item) => ({ name: item.category, value: item.mean }))} name={results.numericColumn} />;
  }

  if (goal === 'Find Relationships') {
    chart = (
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 24, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name={results.strongestPair[0]} />
          <YAxis dataKey="y" name={results.strongestPair[1]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={results.scatterData} fill="#2563eb" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (goal === 'Detect Anomalies') {
    chart = (
      <>
        <BasicBar data={[{ name: 'Normal', value: results.normalCount }, { name: 'Anomaly', value: results.anomalyCount }]} name="Rows" />
        {results.anomalyRows.length > 0 && (
          <div className="table-wrap compact">
            <table>
              <thead>
                <tr>{Object.keys(results.anomalyRows[0]).map((column) => <th key={column}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {results.anomalyRows.map((row, index) => (
                  <tr key={index}>{Object.keys(results.anomalyRows[0]).map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Visualization</h2>
        <span className="badge">{profile?.rowCount || 0} rows analyzed</span>
      </div>
      {chart}
    </section>
  );
}

function BasicBar({ data, name }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 20, right: 24, bottom: 40, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" name={name}>
          {data.map((entry, index) => <Cell key={entry.name} fill={index % 2 ? '#0f766e' : '#2563eb'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
