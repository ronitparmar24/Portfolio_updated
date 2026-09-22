import { env } from '../config/env.js';

const CACHE_TTL_MS = 10 * 60 * 1000;

let cache = { data: null, expiresAt: 0 };

/**
 * Fetch public repositories, cached in memory for 10 minutes.
 *
 * Unauthenticated GitHub calls are capped at 60 per hour per IP, so a portfolio
 * that hits the API on every page load will break for everyone the moment it
 * gets traffic. One in-process cache entry is all this needs — the API runs as a
 * single instance, and repos do not change minute to minute.
 *
 * Adding a scopeless GITHUB_TOKEN raises the ceiling to 5000/hour.
 */
export async function getRepositories() {
  const now = Date.now();

  if (cache.data && cache.expiresAt > now) {
    return { cached: true, data: cache.data };
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'portfolio-api'
  };

  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  const response = await fetch(
    `https://api.github.com/users/${env.GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
    { headers, signal: AbortSignal.timeout(8000) }
  );

  if (!response.ok) {
    // Serve stale data rather than an error if GitHub is rate limiting us.
    if (cache.data) return { cached: true, stale: true, data: cache.data };
    throw new Error(`GitHub responded ${response.status}`);
  }

  const repositories = await response.json();

  // Exclude forks, archived repos, and the portfolio repos themselves
  // (Portfolio and Portfolio_updated are meta-repos — not relevant as project showcases)
  const EXCLUDED = new Set(['Portfolio', 'Portfolio_updated', 'PortFolio', 'ronit-portfolio']);

  const data = repositories
    .filter((repo) => !repo.fork && !repo.archived && !EXCLUDED.has(repo.name))
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language,
      topics: repo.topics ?? [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.pushed_at
    }))
    .sort((a, b) => b.stars - a.stars || new Date(b.updatedAt) - new Date(a.updatedAt));

  cache = { data, expiresAt: now + CACHE_TTL_MS };

  return { cached: false, data };
}
