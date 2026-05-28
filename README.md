# StudyInsight: Goal-Aware CSV Data Analysis Agent

Demo video link: _add your demo video link here_

## Overview

StudyInsight is a full-stack web app for short, goal-aware CSV analysis demos. A user can upload a CSV file or load a built-in sample dataset, choose an analysis goal, choose an insight mode, and run an analysis agent that profiles, plans, computes, visualizes, and reports insights.

The app is intentionally not a chatbot. It uses a visible workflow that shows how the agent interprets the goal, creates a plan, executes deterministic data tools, observes computed results, generates charts, and produces a structured report.

## Agent Scope

StudyInsight is a task-specific data analysis agent, not a general-purpose autonomous agent. It operates inside a controlled CSV analysis environment and uses a fixed set of tools:

- CSV parser
- Data profiler
- Analysis planner
- Statistics executor
- Chart generator
- Insight generator

The agent does not browse the web, modify files, persist history, or take open-ended actions outside the analysis workflow. Its scope is deliberately narrow so the behavior is stable and easy to explain in a 2-minute academic demo.

## Why This Is an Agent

StudyInsight behaves like an agent because it receives a user goal, observes the dataset, plans analysis steps, selects and executes tools, observes computed results, and generates a final report. The Agent Trace section makes this action-observation loop visible for each run.

Smart Insight can optionally use an LLM to polish the computed report, but the numerical analysis comes from deterministic tools such as grouped means, correlations, descriptive statistics, and IQR anomaly detection.

## Why This Is An Agent Rather Than A Chatbot

StudyInsight separates the agent workflow into explicit stages:

1. Goal interpretation
2. Dataset profiling
3. Analysis planning
4. Tool execution
5. Observation from computed statistical results
6. Visualization
7. Final report generation

The LLM, when enabled, only summarizes computed results. It does not perform the numerical or statistical analysis.

## Agent Workflow

- CSV parser reads uploaded files with headers.
- Data profiler detects shape, column types, missing values, and sample rows.
- Analysis planner creates goal-specific steps.
- Statistics executor computes summaries, grouped means, correlations, or IQR anomalies.
- Chart generator renders goal-specific visualizations.
- Insight generator creates a structured report.

## Insight Generation Modes

### Standard Insight

Local deterministic summary generation. No API key is required. This mode is fast, reproducible, and works even when the backend is not running.

### Smart Insight

Optional LLM-enhanced summary generation through the backend API. It uses a Qwen-compatible OpenAI-style API when `QWEN_API_KEY` is configured. If the API key is missing or the model call fails, the frontend automatically falls back to Standard Insight.

## Tools Used By The Agent

- CSV parser
- Data profiler
- Analysis planner
- Statistics executor
- Chart generator
- Insight generator

## Tech Stack

- Frontend: React, Vite, PapaParse, Recharts
- Backend: Node.js, Express, CORS, dotenv, OpenAI SDK
- Database: none

## How To Run

### Frontend

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

### Backend

```bash
cd server
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

## Using Standard Insight

- No API key is required.
- Start the frontend.
- Load a sample dataset or upload a CSV.
- Choose Standard Insight.
- Run the analysis agent.

## Using Smart Insight

- Start both frontend and backend.
- Copy `server/.env.example` to `server/.env`.
- Set `QWEN_API_KEY`.
- Run the backend.
- Choose Smart Insight in the UI.

## Limitations

- Works best with clean tabular CSV files.
- The agent detects and reports missing values but does not automatically impute them, because cleaning strategies depend on the data context.
- Does not replace expert statistical analysis.
- Smart Insight depends on external model API availability.
- Current version does not use a database or save analysis history.
- More advanced statistical tests and persistent report storage can be added in future work.
