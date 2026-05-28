const API_URL = 'http://localhost:5000/api/generate-insight';

export async function generateSmartInsights(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Smart Insight request failed.');
  }

  return response.json();
}
