import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`[api] listening on :${env.PORT} (${env.NODE_ENV})`);
});

/**
 * The database connects after the server starts listening.
 *
 * Why this order: Render's health check must get a response quickly or the
 * deploy is marked failed. If Atlas is slow or briefly unreachable, the API
 * should still boot and report `database: "disconnected"` on /api/health rather
 * than crash-loop. Mongoose buffers queries and retries in the background.
 */
connectDatabase().catch((error) => {
  console.error('[db] initial connection failed:', error.message);
});

/** Graceful shutdown: finish in-flight requests, then close the DB pool. */
async function shutdown(signal) {
  console.log(`[api] ${signal} received, shutting down`);

  server.close(async () => {
    await mongoose.connection.close(false);
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[api] unhandled rejection:', reason);
});
