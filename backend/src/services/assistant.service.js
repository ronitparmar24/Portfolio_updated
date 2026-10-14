import { env } from '../config/env.js';
import {
  buildRelevantKnowledge,
  determineActions,
  determineSuggestions,
  ALLOWED_URL_SET
} from './assistantKnowledge.js';

export const OVERALL_TIMEOUT_MS = 11000;
export const PRIMARY_MODEL_TIMEOUT_MS = 6500;

export const CANDIDATE_MODELS = [
  env.GROQ_MODEL,
  env.GROQ_FALLBACK_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant'
].filter(Boolean);

/**
 * Sanitize and bound history (last 6 turns = 3 user/assistant pairs)
 */
export function sanitizeHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
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
    }));
}

/**
 * Assemble messages array with system prompt and history.
 */
export async function assembleMessages(question, safeHistory, options = {}) {
  const knowledgeContext = typeof buildRelevantKnowledge === 'function'
    ? await Promise.resolve(buildRelevantKnowledge(question, safeHistory, options))
    : '';

  const systemPrompt = `You are the portfolio assistant and guide for Ronit Parmar, embedded directly on his personal developer portfolio website.

${knowledgeContext}`.trim();

  return [
    { role: 'system', content: systemPrompt },
    ...safeHistory,
    { role: 'user', content: question.trim() }
  ];
}

/**
 * Ask the portfolio assistant a question using Groq Cloud AI with streaming SSE support,
 * resilient model fallback, and an 11s response budget.
 *
 * @param {object} params
 * @param {string} params.question - Visitor's query
 * @param {Array} [params.history=[]] - Validated previous turns
 * @param {string} [params.mode='recruiter'] - Interaction mode
 * @param {AbortSignal} [params.clientSignal] - AbortSignal from client disconnect
 * @param {Function} params.onToken - Callback invoked for each streamed token (string)
 * @returns {Promise<{answer: string, actions: Array<object>, suggestions: Array<string>}>}
 */
export async function askAssistantStream({
  question,
  history = [],
  mode = 'recruiter',
  clientSignal = null,
  onToken = () => {}
}) {
  if (!env.GROQ_API_KEY) {
    const error = new Error('GROQ_API_KEY is not configured');
    error.status = 503;
    error.code = 'NOT_CONFIGURED';
    throw error;
  }

  const safeHistory = sanitizeHistory(history);
  const messages = await assembleMessages(question, safeHistory, { mode });

  const candidateModels = Array.from(new Set(CANDIDATE_MODELS));
  const overallController = new AbortController();
  const overallTimeoutId = setTimeout(() => overallController.abort(), OVERALL_TIMEOUT_MS);

  if (clientSignal) {
    if (clientSignal.aborted) {
      clearTimeout(overallTimeoutId);
      throw new Error('Client aborted');
    }
    clientSignal.addEventListener('abort', () => overallController.abort(), { once: true });
  }

  let lastError = null;
  let accumulatedAnswer = '';

  try {
    for (let i = 0; i < candidateModels.length; i++) {
      if (overallController.signal.aborted) break;

      const model = candidateModels[i];
      const isLastModel = i === candidateModels.length - 1;
      const modelTimeoutMs = isLastModel ? OVERALL_TIMEOUT_MS : PRIMARY_MODEL_TIMEOUT_MS;

      const modelController = new AbortController();
      const onOverallAbort = () => modelController.abort();
      overallController.signal.addEventListener('abort', onOverallAbort, { once: true });

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
            max_tokens: 400,
            stream: true,
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
          continue; // Attempt fallback model
        }

        if (response.body && typeof response.body.getReader === 'function') {
          // Real SSE stream from Groq
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';
          let modelProducedTokens = false;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(':')) continue;
                if (trimmed === 'data: [DONE]') continue;

                if (trimmed.startsWith('data: ')) {
                  const jsonStr = trimmed.slice(6);
                  try {
                    const data = JSON.parse(jsonStr);
                    const token = data.choices?.[0]?.delta?.content;
                    if (token) {
                      modelProducedTokens = true;
                      accumulatedAnswer += token;
                      onToken(token);
                    }
                  } catch (_) {
                    // Ignore JSON parse errors on partial chunks
                  }
                }
              }
            }
          } catch (streamErr) {
            if (modelProducedTokens) {
              throw streamErr;
            }
            console.warn(`[assistant] stream error on ${model} before tokens:`, streamErr.message);
            lastError = streamErr;
            continue;
          }
        } else if (typeof response.json === 'function') {
          // Non-streaming response / mock fallback
          const data = await response.json();
          const rawAnswer = data.choices?.[0]?.message?.content || data.choices?.[0]?.delta?.content || '';
          if (rawAnswer) {
            accumulatedAnswer = rawAnswer;
            onToken(rawAnswer);
          }
        } else {
          throw new Error('Groq response body is empty');
        }

        const finalAnswer = accumulatedAnswer.trim();
        if (finalAnswer) {
          clearTimeout(overallTimeoutId);

          const rawActions = determineActions(question, finalAnswer, safeHistory);
          const verifiedActions = rawActions.filter((act) => act && ALLOWED_URL_SET.has(act.url));
          const suggestions = determineSuggestions(question, finalAnswer, safeHistory);

          return {
            answer: finalAnswer,
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

        if (overallController.signal.aborted) {
          break;
        }
      }
    }
  } finally {
    clearTimeout(overallTimeoutId);
  }

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

/**
 * Backward-compatible non-streaming function used by existing test suite.
 */
export async function askAssistant(question, history = [], options = {}) {
  let completeAnswer = '';
  return await askAssistantStream({
    question,
    history,
    mode: options.mode || 'recruiter',
    onToken: (token) => {
      completeAnswer += token;
    }
  });
}

