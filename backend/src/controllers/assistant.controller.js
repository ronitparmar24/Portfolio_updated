import { z } from 'zod';
import { features } from '../config/env.js';
import { askAssistantStream, askAssistant } from '../services/assistant.service.js';

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

export const sessionQueryTracker = new Map();
export const SESSION_WINDOW_MS = 60 * 60 * 1000;
export const SESSION_MAX_QUESTIONS = 25;

export function checkSessionLimit(sessionId) {

  if (!sessionId) return true;
  const now = Date.now();
  const record = sessionQueryTracker.get(sessionId) || { count: 0, resetAt: now + SESSION_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + SESSION_WINDOW_MS;
    sessionQueryTracker.set(sessionId, record);
    return true;
  }
  if (record.count >= SESSION_MAX_QUESTIONS) {
    return false;
  }
  record.count += 1;
  sessionQueryTracker.set(sessionId, record);
  return true;
}

const assistantQuerySchema = z.object({
  question: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(2, 'Question must be at least 2 characters.')
    .max(350, 'Question must not exceed 350 characters.'),
  history: z.array(turnSchema).max(8, 'History cannot exceed 8 messages.').optional().default([]),
  mode: z.enum(['recruiter', 'technical', 'casual']).optional().default('recruiter'),
  stream: z.boolean().optional().default(true),
  sessionId: z.string().trim().max(80).optional()
});

/**
 * Handle questions sent to the "Ask about Ronit" AI assistant.
 * Supports Server-Sent Events (SSE) streaming for real-time token delivery,
 * client abort signals, and graceful JSON fallback.
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

  const { question, history, mode, stream, sessionId } = parsed.data;
  const effectiveSessionId = sessionId || req.headers['x-session-id'];

  if (effectiveSessionId && !checkSessionLimit(effectiveSessionId)) {
    return res.status(429).json({
      success: false,
      code: 'SESSION_LIMIT',
      message: "You've asked several questions in this session! To chat further or schedule an interview, please reach Ronit directly at ronitparmar.work@gmail.com."
    });
  }
  const isStreamingRequested = stream !== false && typeof res.writeHead === 'function' && typeof res.write === 'function';

  // Client abort handling
  const clientController = new AbortController();
  if (typeof req?.on === 'function') {
    req.on('close', () => {
      clientController.abort();
    });
  }


  if (!isStreamingRequested) {
    // Non-streaming JSON mode (used by unit tests or non-streaming clients)
    try {
      const result = await askAssistant(question, history, { mode });
      return res.json({
        success: true,
        answer: result.answer,
        actions: result.actions || [],
        suggestions: result.suggestions || []
      });
    } catch (error) {
      return handleAssistantError(error, res);
    }
  }

  // Streaming SSE mode
  let headersSent = false;
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    headersSent = true;
    if (typeof res.flush === 'function') res.flush();

    // Send initial start event
    res.write('event: start\ndata: {"status":"thinking"}\n\n');

    const result = await askAssistantStream({
      question,
      history,
      mode,
      clientSignal: clientController.signal,
      onToken: (token) => {
        if (!clientController.signal.aborted) {
          res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
          if (typeof res.flush === 'function') res.flush();
        }
      }
    });

    if (!clientController.signal.aborted) {
      // Send metadata (actions, suggestions, etc.)
      res.write(
        `event: meta\ndata: ${JSON.stringify({
          actions: result.actions || [],
          suggestions: result.suggestions || []
        })}\n\n`
      );

      // Send done event and close stream
      res.write('event: done\ndata: {}\n\n');
      res.end();
    }
  } catch (error) {
    console.error('[assistant] query failed:', error.message);

    if (clientController.signal.aborted) {
      return;
    }

    if (!headersSent) {
      return handleAssistantError(error, res);
    }

    // If headers were already flushed to the client, transmit the error via SSE
    const friendlyMessage = getFriendlyErrorMessage(error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: friendlyMessage, canRetry: true })}\n\n`);
    res.end();
  }
}

function getFriendlyErrorMessage(error) {
  if (error.code === 'RATE_LIMIT' || error.status === 429) {
    return 'The AI assistant is temporarily handling high traffic. Please try again in a few moments, or reach Ronit directly at ronitparmar.work@gmail.com.';
  }
  if (error.code === 'TIMEOUT' || error.status === 504 || error.name === 'AbortError') {
    return 'That question took too long to process. Please retry, or email ronitparmar.work@gmail.com directly.';
  }
  return 'The assistant could not complete your request right now. Please try again in a moment, or reach Ronit directly at ronitparmar.work@gmail.com.';
}

function handleAssistantError(error, res) {
  console.error('[assistant] controller error:', error.message);
  if (error.code === 'RATE_LIMIT' || error.status === 429) {
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT',
      message: getFriendlyErrorMessage(error)
    });
  }
  if (error.code === 'TIMEOUT' || error.status === 504 || error.name === 'AbortError') {
    return res.status(504).json({
      success: false,
      code: 'TIMEOUT',
      message: getFriendlyErrorMessage(error)
    });
  }
  return res.status(502).json({
    success: false,
    code: 'PROVIDER_ERROR',
    message: getFriendlyErrorMessage(error)
  });
}

