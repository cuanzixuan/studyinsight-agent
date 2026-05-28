export default function Header() {
  return (
    <header className="app-header">
      <div className="hero-copy">
        <p className="eyebrow">GOAL-AWARE CSV DATA ANALYSIS AGENT</p>
        <h1>StudyInsight</h1>
        <p className="subtitle">
          Upload a CSV file, choose an analysis goal, and let the agent plan, analyze, visualize, and summarize insights.
        </p>
        <div className="hero-badges" aria-label="StudyInsight features">
          <span>Goal-aware planning</span>
          <span>Tool-based analysis</span>
          <span>Standard / Smart insights</span>
          <span>No database required</span>
        </div>
      </div>
    </header>
  );
}
