import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import FileUploader from './components/FileUploader.jsx';
import GoalSelector from './components/GoalSelector.jsx';
import InsightModeSelector from './components/InsightModeSelector.jsx';
import WorkflowPanel from './components/WorkflowPanel.jsx';
import AdaptiveDecision from './components/AdaptiveDecision.jsx';
import DatasetPreview from './components/DatasetPreview.jsx';
import AgentTrace from './components/AgentTrace.jsx';
import AgentPlan from './components/AgentPlan.jsx';
import ToolResults from './components/ToolResults.jsx';
import ChartPanel from './components/ChartPanel.jsx';
import InsightReport from './components/InsightReport.jsx';
import { sampleDatasets } from './agent/sampleData.js';
import { profileDataset } from './agent/profiler.js';
import { executeAnalysis } from './agent/executor.js';
import { generateRecommendedNextActions, generateStandardInsights } from './agent/insightGenerator.js';
import { buildAdaptiveAgentTrace, createAdaptivePlan } from './agent/controller.js';
import { parseCsvFile } from './utils/csvParser.js';
import { generateSmartInsights } from './utils/apiClient.js';

const analysisGoals = ['Overall Summary', 'Compare Categories', 'Find Relationships', 'Detect Anomalies'];

export default function App() {
  const [data, setData] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const [goal, setGoal] = useState('Overall Summary');
  const [targetColumn, setTargetColumn] = useState('');
  const [mode, setMode] = useState('standard');
  const [profile, setProfile] = useState(null);
  const [executedGoal, setExecutedGoal] = useState(goal);
  const [datasetState, setDatasetState] = useState(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState(null);
  const [plan, setPlan] = useState([]);
  const [trace, setTrace] = useState([]);
  const [results, setResults] = useState(null);
  const [report, setReport] = useState(null);
  const [modeUsed, setModeUsed] = useState('standard');
  const [warning, setWarning] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
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
    setDatasetState(null);
    setAdaptiveDecision(null);
    setExecutedGoal(goal);
    setPlan([]);
    setTrace([]);
    setResults(null);
    setReport(null);
    setWarning('');
    setInfoMessage('');
  }

  async function runAgent() {
    setError('');
    setWarning('');
    setInfoMessage('');
    if (!data.length) {
      setError('Load a sample dataset or upload a CSV before running the analysis agent.');
      return;
    }

    setIsRunning(true);
    try {
      const nextProfile = profileDataset(data);
      const adaptive = createAdaptivePlan(nextProfile, goal, targetColumn);
      const {
        originalGoal,
        selectedGoal,
        fallbackUsed,
        reason,
        datasetState: nextDatasetState,
        plan: nextPlan
      } = adaptive;
      const nextDecision = {
        originalGoal,
        executedGoal: selectedGoal,
        fallbackUsed,
        reason,
        warnings: nextDatasetState.warnings || [],
        insertedTools: nextPlan.filter((step) => step.dynamic).map((step) => step.tool)
      };
      const nextResults = executeAnalysis(data, nextProfile, selectedGoal, targetColumn);
      let nextReport;
      let nextModeUsed = mode;

      if (mode === 'smart') {
        try {
          nextReport = await generateSmartInsights({
            goal: selectedGoal,
            originalGoal,
            profile: nextProfile,
            plan: nextPlan,
            results: nextResults,
            adaptiveDecision: nextDecision
          });
          nextReport = {
            ...nextReport,
            recommendedNextActions: generateRecommendedNextActions(selectedGoal, nextResults, nextProfile)
          };
        } catch {
          nextReport = generateStandardInsights(nextProfile, nextPlan, nextResults, selectedGoal);
          nextModeUsed = 'standard';
          setWarning('Smart Insight is unavailable, so the app used Standard Insight instead.');
        }
      } else {
        nextReport = generateStandardInsights(nextProfile, nextPlan, nextResults, selectedGoal);
      }

      setProfile(nextProfile);
      setDatasetState(nextDatasetState);
      setAdaptiveDecision(nextDecision);
      setExecutedGoal(selectedGoal);
      setPlan(nextPlan);
      setTrace(buildAdaptiveAgentTrace({
        originalGoal,
        selectedGoal,
        profile: nextProfile,
        datasetState: nextDatasetState,
        plan: nextPlan,
        results: nextResults,
        modeUsed: nextModeUsed
      }));
      setResults(nextResults);
      setReport(nextReport);
      setModeUsed(nextModeUsed);
      if (fallbackUsed) {
        setInfoMessage('The selected goal was not feasible for this dataset, so the agent ran Overall Summary instead.');
      }
    } finally {
      setIsRunning(false);
    }
  }

  function handleNextAction(action) {
    if (!action || !analysisGoals.includes(action.goal)) return;
    setGoal(action.goal);
    setTargetColumn(action.targetColumn || '');
    setExecutedGoal(action.goal);
    clearRunOutput('Recommended action selected. Click Run Analysis Agent to run the new analysis.');
  }

  function handleGoalChange(nextGoal) {
    setGoal(nextGoal);
    if (report || results) {
      clearRunOutput('Analysis goal changed. Click Run Analysis Agent to run the new analysis.');
    }
    setExecutedGoal(nextGoal);
  }

  function clearRunOutput(message) {
    setWarning('');
    setInfoMessage(message);
    setDatasetState(null);
    setAdaptiveDecision(null);
    setPlan([]);
    setTrace([]);
    setResults(null);
    setReport(null);
  }

  return (
    <main>
      <Header />
      <div className="dashboard-layout">
        <aside className="controls" aria-label="Analysis controls">
          <FileUploader onFileSelected={handleFileSelected} onSampleSelected={handleSampleSelected} datasetName={datasetName} />
          <GoalSelector
            goal={goal}
            onGoalChange={handleGoalChange}
            targetColumn={targetColumn}
            onTargetColumnChange={setTargetColumn}
            columns={columns}
          />
          <InsightModeSelector mode={mode} onModeChange={setMode} />
          <section className="card run-card">
            <button className="run-button" type="button" onClick={runAgent} disabled={isRunning}>
              {isRunning ? 'Running Agent...' : 'Run Analysis Agent'}
            </button>
            <p className="muted">Standard Insight runs locally. Smart Insight falls back automatically if unavailable.</p>
          </section>
          {error && <div className="notice warning">{error}</div>}
          {infoMessage && <div className="notice info">{infoMessage}</div>}
        </aside>
        <div className="outputs">
          <WorkflowPanel completed={Boolean(report)} warning={warning} running={isRunning} adaptiveDecision={adaptiveDecision} />
          {!report && (
            <section className="card empty-state">
              <span className="badge">No analysis yet</span>
              <h2>Load a dataset and click Run Analysis Agent to start.</h2>
              <p>Load a sample dataset or upload a CSV, choose a goal, and run the agent.</p>
              {infoMessage && <div className="notice info">{infoMessage}</div>}
              {!data.length && <div className="notice warning">No dataset is loaded yet.</div>}
            </section>
          )}
          {report && (
            <>
              <AdaptiveDecision decision={adaptiveDecision} />
              <DatasetPreview profile={profile} />
              <AgentPlan plan={plan} />
              <AgentTrace trace={trace} />
              <ToolResults goal={executedGoal} results={results} profile={profile} />
              <ChartPanel goal={executedGoal} profile={profile} results={results} data={data} />
              <InsightReport report={report} modeUsed={modeUsed} warning={warning} onNextAction={handleNextAction} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
