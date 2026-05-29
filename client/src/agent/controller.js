import { createAnalysisPlan } from './planner.js';

const safeArray = (value) => (Array.isArray(value) ? value : []);

export function analyzeDatasetState(profile) {
  const numericColumns = safeArray(profile?.numericColumns);
  const categoricalColumns = safeArray(profile?.categoricalColumns);
  const missingValues = profile?.missingValues || {};
  const totalMissingCells = Object.values(missingValues).reduce((sum, count) => sum + (Number(count) || 0), 0);
  const affectedMissingColumns = Object.values(missingValues).filter((count) => Number(count) > 0).length;
  const hasMissingValues = totalMissingCells > 0;
  const hasNumericColumns = numericColumns.length > 0;
  const hasEnoughNumericForCorrelation = numericColumns.length >= 2;
  const hasCategoricalColumns = categoricalColumns.length > 0;
  const warnings = [];
  const suggestedPreprocessingTools = [];

  if (hasMissingValues) {
    warnings.push('Missing values were detected and may affect advanced analysis.');
    suggestedPreprocessingTools.push('Missing Value Scanner', 'Cleaning Strategy Advisor');
  }

  if (!hasNumericColumns) {
    warnings.push('No numeric columns were detected, so numeric analysis tools are limited.');
  }

  if (!hasCategoricalColumns) {
    warnings.push('No categorical columns were detected, so category comparison may not be available.');
  }

  return {
    hasMissingValues,
    totalMissingCells,
    affectedMissingColumns,
    hasNumericColumns,
    hasEnoughNumericForCorrelation,
    hasCategoricalColumns,
    canCompareCategories: hasCategoricalColumns && hasNumericColumns,
    canFindRelationships: hasEnoughNumericForCorrelation,
    canDetectAnomalies: hasNumericColumns,
    warnings,
    suggestedPreprocessingTools
  };
}

export function selectAdaptiveGoal(goal, datasetState) {
  if (goal === 'Compare Categories' && !datasetState.canCompareCategories) {
    return {
      selectedGoal: 'Overall Summary',
      fallbackUsed: true,
      reason: 'Compare Categories requires at least one categorical column and one numeric column, so the agent switched to Overall Summary.'
    };
  }

  if (goal === 'Find Relationships' && !datasetState.canFindRelationships) {
    return {
      selectedGoal: 'Overall Summary',
      fallbackUsed: true,
      reason: 'Find Relationships requires at least two numeric columns, so the agent switched to Overall Summary.'
    };
  }

  if (goal === 'Detect Anomalies' && !datasetState.canDetectAnomalies) {
    return {
      selectedGoal: 'Overall Summary',
      fallbackUsed: true,
      reason: 'Detect Anomalies requires at least one numeric column, so the agent switched to Overall Summary.'
    };
  }

  return {
    selectedGoal: goal,
    fallbackUsed: false,
    reason: 'The selected goal is feasible for the current dataset.'
  };
}

export function createAdaptivePlan(profile, goal, targetColumn) {
  const datasetState = analyzeDatasetState(profile);
  const adaptiveGoalDecision = selectAdaptiveGoal(goal, datasetState);
  const selectedGoal = adaptiveGoalDecision.selectedGoal;
  const basePlan = createAnalysisPlan(profile, selectedGoal, targetColumn).map((step) => {
    if (datasetState.hasMissingValues && step.step === 'Check missing values') {
      return {
        ...step,
        step: 'Summarize missing value results',
        description: 'Summarize missing-value counts and percentages after the adaptive missing-value review.',
        reason: 'The adaptive controller already reviewed missing cells, so the base summary step reports the observed missingness clearly.',
        dynamic: false
      };
    }

    return { ...step, dynamic: false };
  });
  const adaptiveSteps = [];

  if (adaptiveGoalDecision.fallbackUsed) {
    adaptiveSteps.push({
      step: 'Fallback decision',
      tool: 'Adaptive Agent Controller',
      description: 'The selected goal was not feasible for the current dataset, so the agent switched to a safer analysis goal.',
      reason: adaptiveGoalDecision.reason,
      status: 'completed',
      dynamic: true
    });
  }

  if (datasetState.hasMissingValues) {
    adaptiveSteps.push(
      {
        step: 'Review missing values',
        tool: 'Missing Value Scanner',
        description: 'Inspect missing cells and affected columns before advanced analysis.',
        reason: 'Missing values were observed in the dataset and may affect statistical results.',
        status: 'completed',
        dynamic: true
      },
      {
        step: 'Recommend cleaning strategy',
        tool: 'Cleaning Strategy Advisor',
        description: 'Suggest possible missing value handling strategies without modifying the original dataset.',
        reason: 'The agent should warn users about data quality before deeper analysis.',
        status: 'completed',
        dynamic: true
      }
    );
  }

  const insertionIndex = Math.min(basePlan.length, adaptiveGoalDecision.fallbackUsed ? 1 : 2);
  const plan = [
    ...basePlan.slice(0, insertionIndex),
    ...adaptiveSteps,
    ...basePlan.slice(insertionIndex)
  ];

  return {
    originalGoal: goal,
    selectedGoal,
    fallbackUsed: adaptiveGoalDecision.fallbackUsed,
    reason: adaptiveGoalDecision.reason,
    datasetState,
    plan
  };
}

export function buildAdaptiveAgentTrace({ originalGoal, selectedGoal, profile, datasetState, plan, results, modeUsed }) {
  const dynamicTools = safeArray(plan).filter((step) => step.dynamic).map((step) => step.tool);
  const modeLabel = modeUsed === 'smart' ? 'Smart Insight Generator' : 'Standard Insight Generator';

  return [
    {
      step: 'Observe dataset',
      action: 'Profile uploaded CSV or selected sample dataset',
      tool: 'Data Profiler',
      observation: `The dataset contains ${profile?.rowCount || 0} rows, ${profile?.columnCount || 0} columns, ${safeArray(profile?.numericColumns).length} numeric columns, ${safeArray(profile?.categoricalColumns).length} categorical columns, and ${datasetState?.totalMissingCells || 0} missing cells.`,
      reason: 'The agent needs to understand the dataset state before selecting analysis tools.'
    },
    {
      step: 'Evaluate dataset state',
      action: 'Check missingness, column types, and goal feasibility signals',
      tool: 'Adaptive Agent Controller',
      observation: `${datasetState?.hasMissingValues ? `Missing values detected in ${datasetState.affectedMissingColumns} columns.` : 'No missing values detected.'} Relationship analysis is ${datasetState?.canFindRelationships ? 'feasible' : 'not feasible'}. Category comparison is ${datasetState?.canCompareCategories ? 'feasible' : 'not feasible'}.`,
      reason: 'The agent uses dataset observations to decide which tools are safe and useful.'
    },
    {
      step: 'Check goal feasibility',
      action: 'Compare selected goal against dataset state',
      tool: 'Adaptive Agent Controller',
      observation: `Original goal: ${originalGoal}. Executed goal: ${selectedGoal}.${originalGoal !== selectedGoal ? ' Fallback was used.' : ''}`,
      reason: originalGoal === selectedGoal ? 'The selected goal is feasible for the current dataset.' : 'The selected goal was not feasible, so the agent selected a safer fallback.'
    },
    {
      step: 'Select adaptive tools',
      action: 'Build an adaptive plan from base tools and inserted tools',
      tool: 'Analysis Planner',
      observation: dynamicTools.length ? `Inserted adaptive tools: ${dynamicTools.join(', ')}.` : 'No additional adaptive tools were required.',
      reason: 'The agent adjusts the plan based on dataset quality and goal feasibility.'
    },
    {
      step: 'Execute tools',
      action: `Run deterministic analysis tools for ${selectedGoal}`,
      tool: 'Statistics Executor',
      observation: results?.error ? `Execution returned an error: ${results.message}` : `Analysis tools completed successfully for ${selectedGoal}.`,
      reason: 'Computed evidence should come from deterministic analysis tools.'
    },
    {
      step: 'Generate final report',
      action: `Generate structured insights for ${selectedGoal}`,
      tool: modeLabel,
      observation: `Final insight report generated using ${modeUsed}.`,
      reason: 'The user needs a readable summary of computed results.'
    }
  ];
}
