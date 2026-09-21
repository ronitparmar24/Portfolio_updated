export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

// Express identifies error handlers by arity, so `next` must stay in the signature.
export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  console.error(`[error] ${req.method} ${req.originalUrl}:`, error.message);

  res.status(status).json({
    success: false,
    message:
      status === 500 ? 'Something went wrong on our side.' : error.message
  });
}

/** Wrapper so async route handlers do not need their own try/catch. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
