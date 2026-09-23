import { app } from '../backend/src/app.js';
import { connectDatabase } from '../backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('[serverless-db] connection error:', error.message);
  }
  return new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req, res);
  });
}
