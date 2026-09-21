import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB Atlas.
 *
 * serverSelectionTimeoutMS is lowered from the 30s default so a bad connection
 * string or a missing Atlas IP allowlist entry fails fast, instead of leaving
 * requests hanging until the platform's own timeout kills them.
 */
export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10
  });

  console.log('[db] connected');

  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
  mongoose.connection.on('error', (error) => console.error('[db] error:', error.message));
}

export function databaseStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ];
}
