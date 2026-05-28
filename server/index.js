import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateLLMInsight } from './services/llmService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate-insight', async (req, res) => {
  const { goal, profile, plan, results } = req.body || {};

  if (!goal || !profile || !plan || !results) {
    res.status(400).json({ error: 'Missing required insight payload fields.' });
    return;
  }

  if (!process.env.QWEN_API_KEY) {
    res.status(503).json({
      error: 'Smart Insight is unavailable because QWEN_API_KEY is not configured.'
    });
    return;
  }

  try {
    const insight = await generateLLMInsight({ goal, profile, plan, results });
    res.json(insight);
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Smart Insight generation failed.'
    });
  }
});

app.listen(port, () => {
  console.log(`StudyInsight server running on http://localhost:${port}`);
});
