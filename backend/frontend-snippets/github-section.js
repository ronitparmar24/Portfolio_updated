// Optional: render live GitHub repo cards. Put an empty container in index.html:
// <div id="github-repos" class="github-grid" aria-busy="true"></div>

async function loadGithubRepositories() {
  const container = document.querySelector('#github-repos');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/github/repos?limit=6`);
    const result = await response.json();
    if (!result.success) throw new Error('Unavailable');

    // textContent over innerHTML for anything coming from an API — repo
    // descriptions are user-controlled text and innerHTML makes them executable.
    container.replaceChildren(
      ...result.data.map((repo) => {
        const card = document.createElement('article');
        card.className = 'github-card';

        const title = document.createElement('h3');
        title.textContent = repo.name;

        const description = document.createElement('p');
        description.textContent = repo.description || 'No description yet.';

        const meta = document.createElement('span');
        meta.className = 'github-meta';
        meta.textContent = `${repo.language || 'Mixed'} · ★ ${repo.stars}`;

        const link = document.createElement('a');
        link.href = repo.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `View ${repo.name} on GitHub`;

        card.append(title, description, meta, link);
        return card;
      })
    );
  } catch {
    // Silent failure: a broken widget should never leave a dead section on screen.
    container.remove();
  } finally {
    container.removeAttribute?.('aria-busy');
  }
}

loadGithubRepositories();
