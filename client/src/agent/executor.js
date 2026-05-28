import { correlation, detectOutliersIQR, groupByMean, numericSummary, round, topValueCounts, toNumber } from '../utils/stats.js';

const preferColumn = (columns, preferred) => preferred.find((column) => columns.includes(column)) || columns[0];

function error(message) {
  return { error: true, message };
}

export function executeAnalysis(data, profile, goal, targetColumn) {
  if (!data.length) return error('No rows are available for analysis.');

  if (goal === 'Overall Summary') {
    const numericSummaries = profile.numericColumns.map((column) => {
      const summary = numericSummary(data, column);
      return Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, round(value)]));
    });
    const topCategoricalValues = Object.fromEntries(
      profile.categoricalColumns.slice(0, 4).map((column) => [column, topValueCounts(data, column)])
    );
    return {
      rowCount: profile.rowCount,
      columnCount: profile.columnCount,
      numericSummaries,
      missingValueSummary: profile.missingValues,
      missingPercentageSummary: profile.missingPercentages,
      topCategoricalValues,
      selectedNumericColumn: profile.numericColumns[0],
      selectedCategoricalColumn: profile.categoricalColumns[0]
    };
  }

  if (goal === 'Compare Categories') {
    const categoryColumn = profile.categoricalColumns.includes(targetColumn) ? targetColumn : profile.categoricalColumns[0];
    const numericColumn = preferColumn(profile.numericColumns, ['final_score', 'revenue']);
    if (!categoryColumn || !numericColumn) {
      return error('Compare Categories requires at least one categorical column and one numeric column.');
    }
    const groupedMeans = groupByMean(data, categoryColumn, numericColumn).map((item) => ({ ...item, mean: round(item.mean) }));
    return {
      categoryColumn,
      numericColumn,
      groupedMeans,
      highestGroup: groupedMeans[0] || null,
      lowestGroup: groupedMeans[groupedMeans.length - 1] || null
    };
  }

  if (goal === 'Find Relationships') {
    if (profile.numericColumns.length < 2) {
      return error('Find Relationships requires at least two numeric columns.');
    }
    const allCorrelations = [];
    for (let i = 0; i < profile.numericColumns.length; i += 1) {
      for (let j = i + 1; j < profile.numericColumns.length; j += 1) {
        const xColumn = profile.numericColumns[i];
        const yColumn = profile.numericColumns[j];
        const value = correlation(data.map((row) => row[xColumn]), data.map((row) => row[yColumn]));
        if (value !== null) allCorrelations.push({ xColumn, yColumn, correlation: round(value, 3) });
      }
    }
    allCorrelations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    const strongest = allCorrelations[0];
    if (!strongest) return error('The numeric columns do not contain enough valid paired values for correlation analysis.');
    const scatterData = data
      .map((row) => ({
        x: toNumber(row[strongest.xColumn]),
        y: toNumber(row[strongest.yColumn])
      }))
      .filter((point) => point.x !== null && point.y !== null);
    return {
      strongestPair: [strongest.xColumn, strongest.yColumn],
      correlationValue: strongest.correlation,
      scatterData,
      allCorrelations
    };
  }

  if (goal === 'Detect Anomalies') {
    const numericColumn = profile.numericColumns.includes(targetColumn)
      ? targetColumn
      : preferColumn(profile.numericColumns, ['final_score', 'revenue']);
    if (!numericColumn) return error('Detect Anomalies requires at least one numeric column.');
    const result = detectOutliersIQR(data, numericColumn);
    return {
      numericColumn,
      q1: round(result.q1),
      q3: round(result.q3),
      iqr: round(result.iqr),
      lowerBound: round(result.lowerBound),
      upperBound: round(result.upperBound),
      anomalyCount: result.anomalyRows.length,
      normalCount: result.normalCount,
      anomalyRows: result.anomalyRows.slice(0, 8)
    };
  }

  return error(`Unsupported analysis goal: ${goal}.`);
}
