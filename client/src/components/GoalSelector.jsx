const goals = ['Overall Summary', 'Compare Categories', 'Find Relationships', 'Detect Anomalies'];

export default function GoalSelector({ goal, onGoalChange, targetColumn, onTargetColumnChange, columns }) {
  return (
    <section className="card control-card">
      <div>
        <h2>Analysis Goal</h2>
        <p className="muted">The goal changes the plan, tools, chart, and report.</p>
      </div>
      <select value={goal} onChange={(event) => onGoalChange(event.target.value)}>
        {goals.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select value={targetColumn} onChange={(event) => onTargetColumnChange(event.target.value)}>
        <option value="">Optional target column</option>
        {columns.map((column) => <option key={column} value={column}>{column}</option>)}
      </select>
    </section>
  );
}
