import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import FileUploader from './components/FileUploader.jsx';
import GoalSelector from './components/GoalSelector.jsx';
import InsightModeSelector from './components/InsightModeSelector.jsx';
import WorkflowPanel from './components/WorkflowPanel.jsx';
import DatasetPreview from './components/DatasetPreview.jsx';
import AgentPlan from './components/AgentPlan.jsx';
import ToolResults from './components/ToolResults.jsx';
import ChartPanel from './components/ChartPanel.jsx';
import InsightReport from './components/InsightReport.jsx';
import { sampleDatasets } from './agent/sampleData.js';
import { profileDataset } from './agent/profiler.js';
import { createAnalysisPlan } from './agent/planner.js';
import { executeAnalysis } from './agent/executor.js';
import { generateStandardInsights } from './agent/insightGenerator.js';
import { parseCsvFile } from './utils/csvParser.js';
import { generateSmartInsights } from './utils/apiClient.js';

export default function App() {
  const [data, setData] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const [goal, setGoal] = useState('Overall Summary');
  const [targetColumn, setTargetColumn] = useState('');
  const [mode, setMode] = useState('standard');
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);
  const [results, setResults] = useState(null);
  const [report, setReport] = useState(null);
  const [modeUsed, setModeUsed] = useState('standard');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const columns = useMemo(() => Array.from(data.reduce((set, row) => {
    Object.keys(row || {}).forEach((column) => set.add(column));
    return set;
  }, new Set())), [data]);

  async function handleFileSelected(file) {
    if (!file) return;
    setError('');
    try {
      const rows = await parseCsvFile(file);
      setData(rows);
      setDatasetName(file.name);
      setTargetColumn('');
      resetOutputs();
    } catch (err) {
      setError(err.message || 'Could not parse the CSV file.');
    }
  }

  function handleSampleSelected(sampleId) {
    const sample = sampleDatasets.find((item) => item.id === sampleId);
    if (!sample) return;
    setData(sample.data);
    setDatasetName(sample.name);
    setTargetColumn('');
    setError('');
    resetOutputs();
  }

  function resetOutputs() {
    setProfile(null);
    setPlan([]);
    setResults(null);
    setReport(null);
    setWarning('');
  }

  async function runAgent() {
    setError('');
    setWarning('');
    if (!data.length) {
      setError('Load a sample dataset or upload a CSV before running the analysis agent.');
      return;
    }

    setIsRunning(true);
    try {
      const nextProfile = profileDataset(data);
      const nextPlan = createAnalysisPlan(nextProfile, goal, targetColumn);
      const nextResults = executeAnalysis(data, nextProfile, goal, targetColumn);
      let nextReport;
      let nextModeUsed = mode;

      if (mode === 'smart') {
        try {
          nextReport = await generateSmartInsights({ goal, profile: nextProfile, plan: nextPlan, results: nextResults });
        } catch {
          nextReport = generateStandardInsights(nextProfile, nextPlan, nextResults, goal);
          nextModeUsed = 'standard';
          setWarning('Smart Insight is unavailable, so the app used Standard Insight instead.');
        }
      } else {
        nextReport = generateStandardInsights(nextProfile, nextPlan, nextResults, goal);
      }

      setProfile(nextProfile);
      setPlan(nextPlan);
      setResults(nextResults);
      setReport(nextReport);
      setModeUsed(nextModeUsed);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main>
      <Header />
      <div className="layout">
        <div className="controls">
          <FileUploader onFileSelected={handleFileSelected} onSampleSelected={handleSampleSelected} datasetName={datasetName} />
          <GoalSelector
            goal={goal}
            onGoalChange={setGoal}
            targetColumn={targetColumn}
            onTargetColumnChange={setTargetColumn}
            columns={columns}
          />
          <InsightModeSelector mode={mode} onModeChange={setMode} />
          <button className="run-button" type="button" onClick={runAgent} disabled={isRunning}>
            {isRunning ? 'Running Agent...' : 'Run Analysis Agent'}
          </button>
          {error && <div className="notice warning">{error}</div>}
        </div>
        <div className="outputs">
          <DatasetPreview profile={profile} />
          <WorkflowPanel completed={Boolean(report)} />
          <AgentPlan plan={plan} />
          <ToolResults goal={goal} results={results} />
          <ChartPanel goal={goal} profile={profile} results={results} data={data} />
          <InsightReport report={report} modeUsed={modeUsed} warning={warning} />
        </div>
      </div>
    </main>
  );
}
