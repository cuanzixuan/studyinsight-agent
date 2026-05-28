import OpenAI from 'openai';
import { buildInsightPrompt } from '../prompts/insightPrompt.js';

function normalizeInsight(value) {
  return {
    summary: String(value?.summary || 'The model returned an insight summary.'),
    keyFindings: Array.isArray(value?.keyFindings) ? value.keyFindings.map(String) : [],
    recommendedNextSteps: Array.isArray(value?.recommendedNextSteps) ? value.recommendedNextSteps.map(String) : [],
    limitations: Array.isArray(value?.limitations) ? value.limitations.map(String) : []
  };
}

function parseInsightJson(text) {
  try {
    return normalizeInsight(JSON.parse(text));
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return normalizeInsight(JSON.parse(match[0]));
      } catch {
        // Fall through to raw-text fallback.
      }
    }
    return {
      summary: text || 'Smart Insight returned text that could not be parsed as JSON.',
      keyFindings: [],
      recommendedNextSteps: ['Review the computed tool results shown in the app.'],
      limitations: ['The LLM response was not valid JSON, so the app preserved it as a summary only.']
    };
  }
}

export async function generateLLMInsight({ goal, profile, plan, results }) {
  const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  });

  const completion = await client.chat.completions.create({
    model: process.env.QWEN_MODEL || 'qwen-plus',
    messages: [
      {
        role: 'system',
        content: 'You summarize computed data analysis results. Return only valid JSON and never invent numbers.'
      },
      {
        role: 'user',
        content: buildInsightPrompt({ goal, profile, plan, results })
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const text = completion.choices?.[0]?.message?.content || '';
  return parseInsightJson(text);
}
