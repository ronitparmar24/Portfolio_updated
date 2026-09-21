import { getRepositories } from '../services/github.service.js';

export async function listRepositories(req, res) {
  try {
    const { data, cached, stale } = await getRepositories();
    const limit = Math.min(Number(req.query.limit) || 6, 30);

    // Let the browser and any CDN cache this too — no reason to wake the API
    // for a value that only changes when Ronit pushes code.
    res.set('Cache-Control', 'public, max-age=300');

    res.json({
      success: true,
      cached,
      stale: Boolean(stale),
      count: Math.min(limit, data.length),
      data: data.slice(0, limit)
    });
  } catch (error) {
    console.error('[github]', error.message);
    res.status(502).json({ success: false, message: 'Could not load GitHub repositories.' });
  }
}
