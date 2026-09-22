import { z } from 'zod';
import { features } from '../config/env.js';
import { askAssistant } from '../services/assistant.service.js';

const questionSchema = z.object({
  question: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(3, 'Question must be at least 3 characters.')
    .max(300, 'Question must not exceed 300 characters.')
});

/**
 * Handle questions sent to the "Ask about Ronit" AI assistant.
 */
export async function askQuestion(req, res) {
  if (!features.assistant) {
    return res.status(503).json({
      success: false,
      message: 'Assistant is not configured right now.'
    });
  }

  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Please provide a valid question.'
    });
  }

  try {
    const answer = await askAssistant(parsed.data.question);
    return res.json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('[assistant] query failed:', error.message);
    return res.status(502).json({
      success: false,
      message: "That's taking too long — try again in a moment, or email ronitparmar.work@gmail.com directly."
    });
  }
}
