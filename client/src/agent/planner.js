const plans = {
  'Overall Summary': [
    ['Inspect dataset shape', 'Data profiler', 'Count rows and columns to understand dataset size.'],
    ['Detect column types', 'Schema profiler', 'Separate numeric and categorical columns.'],
    ['Check missing values', 'Missingness scanner', 'Find columns with null, empty, or undefined values.'],
    ['Compute descriptive statistics', 'Statistics executor', 'Calculate summary statistics for numeric fields.'],
    ['Generate summary visualizations', 'Chart generator', 'Create a compact chart from the most useful available column.'],
    ['Generate insight report', 'Insight generator', 'Summarize computed evidence into a structured report.']
  ],
  'Compare Categories': [
    ['Select a categorical column and a numeric column', 'Column selector', 'Choose the grouping column and metric column.'],
    ['Group data by category', 'Grouping tool', 'Bucket rows by the selected category.'],
    ['Compute average numeric value for each group', 'Mean calculator', 'Calculate the group-level average metric.'],
    ['Generate bar chart', 'Chart generator', 'Visualize grouped mean values.'],
    ['Summarize highest and lowest groups', 'Insight generator', 'Explain which groups stand out.']
  ],
  'Find Relationships': [
    ['Select numeric columns', 'Column selector', 'Identify numeric fields suitable for correlation analysis.'],
    ['Compute pairwise correlations', 'Correlation tool', 'Calculate Pearson correlations for all numeric pairs.'],
    ['Identify strongest correlation pair', 'Ranking tool', 'Find the highest absolute correlation.'],
    ['Generate scatter plot', 'Chart generator', 'Plot the strongest numeric relationship.'],
    ['Summarize relationship', 'Insight generator', 'Describe the relationship and its limitations.']
  ],
  'Detect Anomalies': [
    ['Select a numeric column', 'Column selector', 'Choose the metric for anomaly detection.'],
    ['Compute IQR bounds', 'IQR tool', 'Calculate quartiles and outlier thresholds.'],
    ['Identify outlier rows', 'Anomaly detector', 'Flag rows outside the IQR bounds.'],
    ['Generate anomaly visualization', 'Chart generator', 'Compare normal rows with anomaly rows.'],
    ['Summarize anomaly count', 'Insight generator', 'Explain the number and meaning of potential anomalies.']
  ]
};

export function createAnalysisPlan(profile, goal, targetColumn) {
  const selected = plans[goal] || plans['Overall Summary'];
  return selected.map(([step, tool, description]) => ({
    step,
    tool,
    description: targetColumn && step.startsWith('Select') ? `${description} Target hint: ${targetColumn}.` : description,
    status: 'completed'
  }));
}
