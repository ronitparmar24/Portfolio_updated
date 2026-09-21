export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

// Express identifies error handlers by arity, so `next` must stay in the signature.
export function errorHandler(error, req, res, next) {
  // Catch malformed JSON syntax errors thrown by express.json()
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.'
    });
  }

  const status = error.statusCode || error.status || 500;

  console.error(`[error] ${req.method} ${req.originalUrl}:`, error.message);

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong on our side.' : error.message
  });
}

/** Wrapper so async route handlers do not need their own try/catch. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
