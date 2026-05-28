export function buildInsightPrompt({ goal, profile, plan, results }) {
  return `
You are an insight summarization assistant inside a data analysis agent.

The statistical results below are already computed by deterministic tools.
Do not invent unsupported numbers.
Do not rerun analysis mentally.
Summarize the computed results clearly for a short academic demo.

Return only valid JSON with this exact shape:
{
  "summary": "...",
  "keyFindings": ["...", "..."],
  "recommendedNextSteps": ["...", "..."],
  "limitations": ["...", "..."]
}

Analysis goal:
${goal}

Dataset profile:
${JSON.stringify(profile, null, 2)}

Agent plan:
${JSON.stringify(plan, null, 2)}

Computed tool results:
${JSON.stringify(results, null, 2)}
`;
}
