import { useState } from 'react';
import { sampleDatasets } from '../agent/sampleData.js';

export default function FileUploader({ onFileSelected, onSampleSelected, datasetName }) {
  const [fileName, setFileName] = useState('');

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setFileName(file?.name || '');
    onFileSelected(file);
  }

  function handleSampleChange(event) {
    setFileName('');
    onSampleSelected(event.target.value);
  }

  return (
    <section className="card control-card accent-blue">
      <div>
        <h2>Data Source</h2>
        <p className="muted">Use a CSV with headers or load a built-in dataset.</p>
      </div>
      <label className="upload-dropzone">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="sr-only-file"
        />
        <span className="upload-icon">CSV</span>
        <span className="upload-title">Choose CSV File</span>
        <span className="upload-subtitle">{fileName || 'No file selected'}</span>
        <span className="upload-helper">CSV files with headers are recommended.</span>
      </label>
      <select defaultValue="" onChange={handleSampleChange}>
        <option value="" disabled>Load sample dataset</option>
        {sampleDatasets.map((sample) => (
          <option key={sample.id} value={sample.id}>{sample.name}</option>
        ))}
      </select>
      {datasetName && <span className="badge success">{datasetName}</span>}
    </section>
  );
}
