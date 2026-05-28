import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import FileUploader from './components/FileUploader.jsx';
import GoalSelector from './components/GoalSelector.jsx';
import InsightModeSelector from './components/InsightModeSelector.jsx';
import WorkflowPanel from './components/WorkflowPanel.jsx';
import DatasetPreview from './components/DatasetPreview.jsx';
import AgentTrace from './components/AgentTrace.jsx';
import AgentPlan from './components/AgentPlan.jsx';
import ToolResults from './components/ToolResults.jsx';
import ChartPanel from './components/ChartPanel.jsx';
import InsightReport from './components/InsightReport.jsx';
import { sampleDatasets } from './agent/sampleData.js';
import { profileDataset } from './agent/profiler.js';
import { createAnalysisPlan } from './agent/planner.js';
import { executeAnalysis } from './agent/executor.js';
import { generateRecommendedNextActions, generateStandardInsights } from './agent/insightGenerator.js';
import { parseCsvFile } from './utils/csvParser.js';
import { generateSmartInsights } from './utils/apiClient.js';

function describeToolSelection(goal, profile, results) {
  if (results?.error) return results.message;

  if (goal === 'Compare Categories') {
    return `Selected grouped mean analysis using ${results.categoryColumn} as the category tool input and ${results.numericColumn} as the numeric metric.`;
  }

  if (goal === 'Find Relationships') {
    return `Selected correlation analysis and a scatter chart because ${profile.numericColumns.length} numeric columns are available. Strongest pair: ${results.strongestPair.join(' and ')}.`;
  }

  if (goal === 'Detect Anomalies') {
    return `Selected IQR anomaly detection for ${results.numericColumn}; found ${results.anomalyCount} potential anomalies.`;
  }

  return `Selected descriptive statistics and a summary chart for ${profile.numericColumns.length} numeric and ${profile.categoricalColumns.length} categorical columns.`;
}

function buildAgentTrace({ goal, profile, plan, results, modeUsed }) {
  const chartTool = goal === 'Find Relationships'
    ? 'Scatter Chart Generator'
    : goal === 'Detect Anomalies'
      ? 'Anomaly Chart Generator'
      : 'Bar Chart Generator';

  return [
    {
      step: 'Observe dataset',
      action: 'Profile uploaded CSV or selected sample dataset',
      tool: 'Data Profiler',
      observation: `${profile.rowCount} rows, ${profile.columnCount} columns, ${profile.numericColumns.length} numeric columns, ${profile.categoricalColumns.length} categorical columns`,
      reason: 'The agent needs schema information before planning or selecting analysis tools.'
    },
    {
      step: 'Interpret user goal',
      action: `Map the selected goal to a task-specific analysis strategy: ${goal}`,
      tool: 'Goal Interpreter',
      observation: `The selected goal is ${goal}.`,
      reason: 'The user goal determines which deterministic tools are appropriate.'
    },
    {
      step: 'Select analysis tools',
      action: plan.map((item) => item.tool).join(', '),
      tool: 'Analysis Planner',
      observation: describeToolSelection(goal, profile, results),
      reason: plan[0]?.reason || 'The planner selects tools based on the goal and profiled dataset columns.'
    },
    {
      step: 'Execute data tools',
      action: 'Run statistical analysis on the loaded rows',
      tool: 'Statistics Executor',
      observation: results?.error ? results.message : 'Computed tool results are available in the Tool Execution Results section.',
      reason: 'Numerical evidence must come from deterministic computations before any report is generated.'
    },
    {
      step: 'Generate visualization',
      action: `Create a chart for ${goal}`,
      tool: chartTool,
      observation: results?.error ? 'Chart skipped because the selected goal could not be computed.' : 'A goal-specific visualization was generated from computed results.',
      reason: 'Visualization helps the user inspect the computed observation quickly during a short demo.'
    },
    {
      step: 'Generate final report',
      action: modeUsed === 'smart' ? 'Summarize computed results with Smart Insight' : 'Summarize computed results with Standard Insight',
      tool: modeUsed === 'smart' ? 'Backend LLM Insight Generator' : 'Local Template Insight Generator',
      observation: `${modeUsed === 'smart' ? 'Smart' : 'Standard'} Insight produced a structured report.`,
      reason: 'The final report converts observations into summary, findings, next steps, and limitations.'
    }
  ];
}

export default function App() {
  const [data, setData] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const [goal, setGoal] = useState('Overall Summary');
  const [targetColumn, setTargetColumn] = useState('');
  const [mode, setMode] = useState('standard');
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);
  const [trace, setTrace] = useState([]);
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
    setTrace([]);
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
          nextReport = {
            ...nextReport,
            recommendedNextActions: generateRecommendedNextActions(goal, nextResults, nextProfile)
          };
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
      setTrace(buildAgentTrace({ goal, profile: nextProfile, plan: nextPlan, results: nextResults, modeUsed: nextModeUsed }));
      setResults(nextResults);
      setReport(nextReport);
      setModeUsed(nextModeUsed);
    } finally {
      setIsRunning(false);
    }
  }

  function handleNextAction(action) {
    setGoal(action.goal);
    setTargetColumn(action.targetColumn || '');
    setWarning('');
  }

  return (
    <main>
      <Header />
      <div className="dashboard-layout">
        <aside className="controls" aria-label="Analysis controls">
          <FileUploader onFileSelected={handleFileSelected} onSampleSelected={handleSampleSelected} datasetName={datasetName} />
          <GoalSelector
            goal={goal}
            onGoalChange={setGoal}
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
        </aside>
        <div className="outputs">
          <WorkflowPanel completed={Boolean(report)} warning={warning} running={isRunning} />
          {!report && (
            <section className="card empty-state">
              <span className="badge">No analysis yet</span>
              <h2>Load a dataset and click Run Analysis Agent to start.</h2>
              <p>Load a sample dataset or upload a CSV, choose a goal, and run the agent.</p>
              {!data.length && <div className="notice warning">No dataset is loaded yet.</div>}
            </section>
          )}
          {report && (
            <>
              <DatasetPreview profile={profile} />
              <AgentPlan plan={plan} />
              <AgentTrace trace={trace} />
              <ToolResults goal={goal} results={results} />
              <ChartPanel goal={goal} profile={profile} results={results} data={data} />
              <InsightReport report={report} modeUsed={modeUsed} warning={warning} onNextAction={handleNextAction} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
