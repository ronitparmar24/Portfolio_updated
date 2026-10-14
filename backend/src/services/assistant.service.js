import { env } from '../config/env.js';
import {
  buildRelevantKnowledge,
  determineActions,
  determineSuggestions,
  ALLOWED_URL_SET
} from './assistantKnowledge.js';

const OVERALL_TIMEOUT_MS = 11000;
const PRIMARY_MODEL_TIMEOUT_MS = 6500;

/**
 * Ask the portfolio assistant a question using Groq Cloud AI with multi-turn history,
 * grounded knowledge selection, strict response-time budgeting, and model fallback.
 *
 * @param {string} question - The visitor's question
 * @param {Array<{role: string, content: string}>} [history=[]] - Validated previous messages
 * @returns {Promise<{answer: string, actions: Array<object>, suggestions: Array<string>}>}
 */
export async function askAssistant(question, history = []) {
  if (!env.GROQ_API_KEY) {
    const error = new Error('GROQ_API_KEY is not configured');
    error.status = 503;
    error.code = 'NOT_CONFIGURED';
    throw error;
  }

  // 1. Sanitize and bound history (last 6 turns = 3 user/assistant pairs)
  const safeHistory = Array.isArray(history)
    ? history
        .slice(-6)
        .filter(
          (turn) =>
            turn &&
            (turn.role === 'user' || turn.role === 'assistant') &&
            typeof turn.content === 'string' &&
            turn.content.trim().length > 0
        )
        .map((turn) => ({
          role: turn.role,
          content: turn.content.trim().slice(0, 600)
        }))
    : [];

  // 2. Select dynamic, grounded knowledge context
  const systemPrompt = `You are the portfolio assistant and guide for Ronit Parmar, embedded directly on his personal developer portfolio website.

${buildRelevantKnowledge(question, safeHistory)}
`.trim();

  // 3. Assemble chat completion messages (system prompt is strictly server-controlled)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory,
    { role: 'user', content: question.trim() }
  ];

  // 4. Candidate models from environment configuration with resilient fallbacks
  const candidateModels = Array.from(
    new Set(
      [
        env.GROQ_MODEL,
        env.GROQ_FALLBACK_MODEL,
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.8-27b',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant'
      ].filter(Boolean)
    )
  );

  const overallController = new AbortController();
  const overallTimeoutId = setTimeout(() => overallController.abort(), OVERALL_TIMEOUT_MS);

  let lastError = null;

  try {
    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      const isLastModel = i === candidateModels.length - 1;
      const modelTimeoutMs = isLastModel ? OVERALL_TIMEOUT_MS : PRIMARY_MODEL_TIMEOUT_MS;

      const modelController = new AbortController();
      const onOverallAbort = () => modelController.abort();
      overallController.signal.addEventListener('abort', onOverallAbort);

      const modelTimerId = setTimeout(() => modelController.abort(), modelTimeoutMs);

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            temperature: 0.35,
            max_tokens: 300,
            messages
          }),
          signal: modelController.signal
        });

        clearTimeout(modelTimerId);
        overallController.signal.removeEventListener('abort', onOverallAbort);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          console.warn(`[assistant] model ${model} returned HTTP ${response.status}:`, errorBody);

          if (response.status === 429) {
            const rateErr = new Error('Groq organization rate limit or quota exceeded');
            rateErr.status = 429;
            rateErr.code = 'RATE_LIMIT';
            throw rateErr;
          }

          const err = new Error(`Groq responded with ${response.status}`);
          err.status = response.status;
          lastError = err;
          continue; // Attempt fallback candidate
        }

        const data = await response.json();
        const rawAnswer = data.choices?.[0]?.message?.content?.trim();

        if (rawAnswer) {
          clearTimeout(overallTimeoutId);

          // 5. Build verified actions and follow-up suggestions
          const rawActions = determineActions(question, rawAnswer, safeHistory);
          // Strictly validate that each action URL is in the server allowlist
          const verifiedActions = rawActions.filter((act) => act && ALLOWED_URL_SET.has(act.url));
          const suggestions = determineSuggestions(question, rawAnswer, safeHistory);

          return {
            answer: rawAnswer,
            actions: verifiedActions,
            suggestions
          };
        }
      } catch (err) {
        clearTimeout(modelTimerId);
        overallController.signal.removeEventListener('abort', onOverallAbort);

        if (err.code === 'RATE_LIMIT' || err.status === 429) {
          throw err;
        }

        console.warn(`[assistant] model ${model} error:`, err.message);
        lastError = err;

        // If overall budget timed out, don't attempt more models
        if (overallController.signal.aborted) {
          break;
        }
      }
    }
  } finally {
    clearTimeout(overallTimeoutId);
  }

  // Handle failure cleanly
  if (overallController.signal.aborted) {
    const timeoutErr = new Error('Assistant query timed out before completing');
    timeoutErr.status = 504;
    timeoutErr.code = 'TIMEOUT';
    throw timeoutErr;
  }

  throw (
    lastError ||
    new Error('Assistant was unable to generate an answer at this time.')
  );
}
