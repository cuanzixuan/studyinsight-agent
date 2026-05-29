const plans = {
  'Overall Summary': [
    ['Inspect dataset shape', 'Data profiler', 'Count rows and columns to understand dataset size.', 'The agent needs dataset size before choosing a useful summary strategy.'],
    ['Detect column types', 'Schema profiler', 'Separate numeric and categorical columns.', 'Column types determine which statistical tools and charts are valid.'],
    ['Check missing values', 'Missingness scanner', 'Find columns with null, empty, or undefined values.', 'Missingness can affect summary quality and interpretation.'],
    ['Compute descriptive statistics', 'Statistics executor', 'Calculate summary statistics for numeric fields.', 'Descriptive statistics provide reliable computed evidence for the report.'],
    ['Generate summary visualizations', 'Chart generator', 'Create a compact chart from the most useful available column.', 'A visual overview helps users quickly inspect distribution or category balance.'],
    ['Generate insight report', 'Insight generator', 'Summarize computed evidence into a structured report.', 'The final report translates tool outputs into demo-ready findings.']
  ],
  'Compare Categories': [
    ['Select a categorical column and a numeric column', 'Column selector', 'Choose the grouping column and metric column.', 'Category comparison needs one grouping field and one numeric metric.'],
    ['Group data by category', 'Grouping tool', 'Bucket rows by the selected category.', 'Grouping creates the categories that can be compared.'],
    ['Compute average numeric value for each group', 'Mean calculator', 'Calculate the group-level average metric.', 'Group means provide a simple computed basis for ranking categories.'],
    ['Generate bar chart', 'Chart generator', 'Visualize grouped mean values.', 'A bar chart makes the highest and lowest groups visible.'],
    ['Summarize highest and lowest groups', 'Insight generator', 'Explain which groups stand out.', 'The report should identify the clearest category-level differences.']
  ],
  'Find Relationships': [
    ['Select numeric columns', 'Column selector', 'Identify numeric fields suitable for correlation analysis.', 'Relationship discovery requires numeric columns with paired values.'],
    ['Compute pairwise correlations', 'Correlation tool', 'Calculate Pearson correlations for all numeric pairs.', 'Correlation is an appropriate first tool for linear relationship discovery.'],
    ['Identify strongest correlation pair', 'Ranking tool', 'Find the highest absolute correlation.', 'Ranking helps the agent focus the chart and report on the clearest signal.'],
    ['Generate scatter plot', 'Chart generator', 'Plot the strongest numeric relationship.', 'A scatter plot lets users inspect the relationship beyond the correlation number.'],
    ['Summarize relationship', 'Insight generator', 'Describe the relationship and its limitations.', 'The report should explain association while avoiding causal claims.']
  ],
  'Detect Anomalies': [
    ['Select a numeric column', 'Column selector', 'Choose the metric for anomaly detection.', 'IQR anomaly detection operates on a numeric metric.'],
    ['Compute IQR bounds', 'IQR tool', 'Calculate quartiles and outlier thresholds.', 'IQR bounds provide a deterministic threshold for potential outliers.'],
    ['Identify outlier rows', 'Anomaly detector', 'Flag rows outside the IQR bounds.', 'Flagged rows are the observations that need inspection.'],
    ['Generate anomaly visualization', 'Chart generator', 'Compare normal rows with anomaly rows.', 'A compact count chart shows anomaly scale quickly.'],
    ['Summarize anomaly count', 'Insight generator', 'Explain the number and meaning of potential anomalies.', 'The report should turn flagged rows into actionable review guidance.']
  ]
};

export function createAnalysisPlan(profile, goal, targetColumn) {
  const selected = plans[goal] || plans['Overall Summary'];
  return selected.map(([step, tool, description, reason]) => ({
    step,
    tool,
    description: targetColumn && step.startsWith('Select') ? `${description} Target hint: ${targetColumn}.` : description,
    reason,
    status: 'completed',
    dynamic: false
  }));
}
