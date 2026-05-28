const list = (items) => (items && items.length ? items.join(', ') : 'none detected');

function missingLeaders(profile) {
  return Object.entries(profile.missingValues || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([column, count]) => `${column} (${count})`);
}

export function generateStandardInsights(profile, plan, results, goal) {
  if (results?.error) {
    return {
      summary: results.message,
      keyFindings: ['The selected analysis could not be completed with the current dataset structure.'],
      recommendedNextSteps: ['Choose a different goal or upload a CSV with the required numeric and categorical columns.'],
      limitations: ['No statistical result was generated for this run.']
    };
  }

  if (goal === 'Compare Categories') {
    return {
      summary: `The agent compared average ${results.numericColumn} by ${results.categoryColumn}.`,
      keyFindings: [
        `The highest average ${results.numericColumn} is found in ${results.highestGroup?.category} (${results.highestGroup?.mean}).`,
        `The lowest average ${results.numericColumn} is found in ${results.lowestGroup?.category} (${results.lowestGroup?.mean}).`
      ],
      recommendedNextSteps: ['Inspect the top and bottom groups for contextual causes.', 'Check whether group sizes are balanced before making decisions.'],
      limitations: ['Group averages can hide variation inside each category.', 'This comparison does not establish causation.']
    };
  }

  if (goal === 'Find Relationships') {
    const direction = results.correlationValue >= 0 ? 'positive' : 'negative';
    return {
      summary: `The agent computed pairwise correlations across numeric columns.`,
      keyFindings: [
        `The strongest relationship is between ${results.strongestPair[0]} and ${results.strongestPair[1]} with a correlation of ${results.correlationValue}.`,
        `This suggests a ${direction} association, but correlation does not prove causation.`
      ],
      recommendedNextSteps: ['Use the scatter plot to check for non-linear patterns or clusters.', 'Consider domain context before interpreting the relationship.'],
      limitations: ['Pearson correlation captures linear relationships only.', 'Outliers can strongly affect correlation values.']
    };
  }

  if (goal === 'Detect Anomalies') {
    return {
      summary: `The agent used the IQR method to inspect ${results.numericColumn}.`,
      keyFindings: [
        `The agent found ${results.anomalyCount} potential anomalies in ${results.numericColumn} using the IQR method.`,
        `The normal range was estimated from ${results.lowerBound} to ${results.upperBound}.`
      ],
      recommendedNextSteps: ['Review the flagged rows for data entry issues or meaningful exceptional cases.', 'Compare anomalies against other columns for additional context.'],
      limitations: ['IQR detection is a general rule and may not match every domain threshold.', 'Small datasets can produce unstable anomaly bounds.']
    };
  }

  return {
    summary: `The dataset contains ${profile.rowCount} rows and ${profile.columnCount} columns.`,
    keyFindings: [
      `The detected numeric columns are ${list(profile.numericColumns)}.`,
      `The detected categorical columns are ${list(profile.categoricalColumns)}.`,
      `The columns with the most missing values are ${list(missingLeaders(profile))}.`
    ],
    recommendedNextSteps: ['Investigate columns with missing values before advanced modeling.', 'Use a more specific goal to compare groups, find relationships, or detect anomalies.'],
    limitations: ['The report is based on descriptive statistics only.', 'The agent does not infer causal relationships from this summary.']
  };
}
