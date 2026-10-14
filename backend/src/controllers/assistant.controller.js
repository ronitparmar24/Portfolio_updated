import { z } from 'zod';
import { features } from '../config/env.js';
import { askAssistant } from '../services/assistant.service.js';

const turnSchema = z.object({
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: "Role must be 'user' or 'assistant'." })
  }),
  content: z
    .string()
    .trim()
    .min(1, 'History message cannot be empty.')
    .max(800, 'History message must not exceed 800 characters.')
});

const assistantQuerySchema = z.object({
  question: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(2, 'Question must be at least 2 characters.')
    .max(350, 'Question must not exceed 350 characters.'),
  history: z.array(turnSchema).max(8, 'History cannot exceed 8 messages.').optional().default([])
});

/**
 * Handle questions sent to the "Ask about Ronit" AI assistant.
 * Accepts bounded multi-turn conversation history and returns grounded answers,
 * verified action links, and follow-up suggestions.
 */
export async function askQuestion(req, res) {
  if (!features.assistant) {
    return res.status(503).json({
      success: false,
      code: 'UNAVAILABLE',
      message: 'Assistant is not configured right now. Please reach Ronit directly at ronitparmar.work@gmail.com.'
    });
  }

  const parsed = assistantQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: parsed.error.issues[0]?.message || 'Please provide a valid question.'
    });
  }

  try {
    const { question, history } = parsed.data;
    const result = await askAssistant(question, history);

    return res.json({
      success: true,
      answer: result.answer,
      actions: result.actions || [],
      suggestions: result.suggestions || []
    });
  } catch (error) {
    console.error('[assistant] query failed:', error.message);

    // Rate limiting or quota issues from Groq
    if (error.code === 'RATE_LIMIT' || error.status === 429) {
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT',
        message: 'The AI assistant is temporarily handling high traffic. Please try again in a few moments, or reach Ronit directly at ronitparmar.work@gmail.com.'
      });
    }

    // Timeouts
    if (error.code === 'TIMEOUT' || error.status === 504 || error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        code: 'TIMEOUT',
        message: 'That question took too long to process. Please retry, or email ronitparmar.work@gmail.com directly.'
      });
    }

    // Provider unavailable or other network errors
    return res.status(502).json({
      success: false,
      code: 'PROVIDER_ERROR',
      message: 'The assistant could not complete your request right now. Please try again in a moment, or reach Ronit directly at ronitparmar.work@gmail.com.'
    });
  }
}
