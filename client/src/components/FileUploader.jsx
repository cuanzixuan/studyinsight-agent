import { sampleDatasets } from '../agent/sampleData.js';

export default function FileUploader({ onFileSelected, onSampleSelected, datasetName }) {
  return (
    <section className="card control-card">
      <div>
        <h2>Data Source</h2>
        <p className="muted">Use a CSV with headers or load a built-in dataset.</p>
      </div>
      <label className="file-input">
        <span>Upload CSV</span>
        <input type="file" accept=".csv,text/csv" onChange={(event) => onFileSelected(event.target.files?.[0])} />
      </label>
      <select defaultValue="" onChange={(event) => onSampleSelected(event.target.value)}>
        <option value="" disabled>Load sample dataset</option>
        {sampleDatasets.map((sample) => (
          <option key={sample.id} value={sample.id}>{sample.name}</option>
        ))}
      </select>
      {datasetName && <span className="badge success">{datasetName}</span>}
    </section>
  );
}
