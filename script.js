'use strict';

/* Edit this small project collection to add future work. Visual concepts live in index.html. */
const projects = {
  metromind: {
    name: 'MetroMind',
    description: 'An intelligent metro ticketing platform with a responsive React frontend, REST API integration, and a dual-backend architecture.',
    stack: ['React / Vite', 'Node.js / Express', 'Django REST', 'MongoDB', 'scikit-learn', 'Vercel'],
    features: [
      'Built responsive, component-based booking interfaces used end-to-end by test users.',
      'Diagnosed and fixed frontend rendering and state-management issues for consistent behavior across views.',
      'Integrated APIs from Node.js / Express and Django REST backends, separating presentation, business logic, and data layers.',
      'Deployed the live application on Vercel using a Git / GitHub workflow.'
    ],
    github: 'https://github.com/ronitparmar24/MetroMind',
    live: 'https://metro-mind-lemon.vercel.app/'
  },
  metroflow: {
    name: 'MetroFlow',
    description: 'A metro ticket booking system covering the complete rider journey, backed by Flask and MySQL.',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Flask', 'MySQL'],
    features: [
      'Built the complete frontend in HTML, CSS, and JavaScript, paired with a Flask backend and MySQL database.',
      'Implemented user-authentication and digital-wallet interfaces.',
      'Created flows for QR ticket generation, downloadable PDF tickets, and monthly passes.',
      'Built an admin analytics dashboard to support system management.'
    ],
    github: 'https://github.com/ronitparmar24/metroflow'
  },
  digikhata: {
    name: 'DigiKhata',
    description: 'A Python-based digital business ledger with a Streamlit interface and SQLite storage, designed to simplify everyday financial tracking for small and medium businesses.',
    stack: ['Python', 'Streamlit', 'SQLite', 'SMTP email alerts', 'CSV export'],
    features: [
      'Built a usable interface for tracking business credits and debits.',
      'Integrated inventory management into the digital ledger workflow.',
      'Implemented automated payment reminders and email alerts.',
      'Added analytics, charts, and CSV exports to support business record-keeping.'
    ],
    github: 'https://github.com/ronitparmar24/digiKhata'
  }
};

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = themeButton.querySelector('use');
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
let customTheme = false;
try { customTheme = Boolean(localStorage.getItem('ronit-theme')); } catch (_) { /* Storage can be unavailable in embedded previews. */ }

function applyTheme(theme) {
  root.dataset.theme = theme;
  const next = theme === 'dark' ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
  themeButton.title = `Switch to ${next} theme`;
  themeIcon.setAttribute('href', theme === 'dark' ? '#sun' : '#moon');
  themeColor.content = theme === 'dark' ? '#111212' : '#f8f9f4';
}
applyTheme(root.dataset.theme || 'dark');
themeButton.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  customTheme = true;
  try { localStorage.setItem('ronit-theme', next); } catch (_) { /* Theme still works without persistence. */ }
});
systemTheme.addEventListener('change', e => { if (!customTheme) applyTheme(e.matches ? 'light' : 'dark'); });

// Mobile navigation: disclosure semantics, Escape dismissal, no invisible tab stops.
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
window.matchMedia('(min-width: 621px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

// Section reveals are progressive enhancement: content is never hidden without JS.
if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveals.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => reveals.observe(el));
  if (!reducedMotion.matches) root.classList.add('js-motion');
  const sections = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.desktop-nav a').forEach(link => {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('current', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(el => sections.observe(el));
}

// A visible pause control supplements the OS reduced-motion preference.
const motionButton = document.createElement('button');
motionButton.className = 'motion-toggle';
motionButton.type = 'button';
document.querySelector('.site-footer').append(motionButton);
let motionPaused = reducedMotion.matches;
try { motionPaused = motionPaused || localStorage.getItem('ronit-motion') === 'paused'; } catch (_) {}
function applyMotion() {
  root.classList.toggle('motion-paused', motionPaused);
  motionButton.textContent = motionPaused ? 'Motion: off' : 'Motion: on';
  motionButton.setAttribute('aria-label', motionPaused ? 'Enable animations' : 'Pause animations');
  motionButton.setAttribute('aria-pressed', String(!motionPaused));
}
applyMotion();
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  applyMotion();
  try { localStorage.setItem('ronit-motion', motionPaused ? 'paused' : 'on'); } catch (_) {}
});
reducedMotion.addEventListener('change', e => { motionPaused = e.matches; applyMotion(); });

const cards = [...document.querySelectorAll('.project-card')];
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = button === item;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let shown = 0;
    cards.forEach(card => {
      const show = button.dataset.filter === 'all' || card.dataset.category.split(' ').includes(button.dataset.filter);
      card.hidden = !show;
      if (show) { shown++; card.classList.add('is-visible'); }
    });
    document.querySelector('#filter-status').textContent = `Showing ${shown} projects`;
  });
});

// Native dialog provides keyboard focus trapping and Escape support.
const dialog = document.querySelector('#project-dialog');
let projectTrigger = null;
function addProjectLink(container, href, label, primary) {
  const link = document.createElement('a');
  link.className = `button ${primary ? 'button-primary' : 'button-outline'}`;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = `${label} ↗`;
  container.append(link);
}
function openProject(id, trigger) {
  const project = projects[id];
  if (!project) return;
  projectTrigger = trigger;
  document.querySelector('#dialog-title').textContent = project.name;
  document.querySelector('#dialog-description').textContent = project.description;
  const tags = document.querySelector('#dialog-tags');
  tags.replaceChildren();
  project.stack.forEach(tag => { const el = document.createElement('span'); el.textContent = tag; tags.append(el); });
  const features = document.querySelector('#dialog-features');
  features.replaceChildren();
  project.features.forEach(feature => { const el = document.createElement('li'); el.textContent = feature; features.append(el); });
  const links = document.querySelector('#dialog-links');
  links.replaceChildren();
  if (project.live) addProjectLink(links, project.live, 'Visit live project', true);
  addProjectLink(links, project.github, 'View source on GitHub', !project.live);
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  document.querySelector('.dialog-close').focus({ preventScroll: true });
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.project, button)));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  const bounds = dialog.getBoundingClientRect();
  if (e.target === dialog && (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  projectTrigger?.focus({ preventScroll: true });
});

let toastTimer;
function toast(message) {
  const element = document.querySelector('.toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
}
document.querySelector('.copy-email').addEventListener('click', async () => {
  const email = 'ronitparmar.work@gmail.com';
  try {
    await navigator.clipboard.writeText(email);
    toast('Email copied. Let’s make something good.');
  } catch (_) {
    const field = document.createElement('textarea');
    field.value = email;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) {}
    field.remove();
    toast(copied ? 'Email copied. Let’s make something good.' : `Copy this address: ${email}`);
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

/* --- Backend Integration: Contact Form & GitHub Repositories --- */
const API_BASE_URL =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-SERVICE.onrender.com/api';

/**
 * Wake up the API on page load (Render free instances sleep after inactivity).
 */
function warmUpApi() {
  fetch(`${API_BASE_URL}/health`, { mode: 'cors' }).catch(() => {});
}

const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

if (contactForm) {
  warmUpApi();

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);

    // Clear previous field errors
    contactForm
      .querySelectorAll('.field-error')
      .forEach((element) => (element.textContent = ''));

    const payload = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      subject: formData.get('subject')?.trim(),
      message: formData.get('message')?.trim(),
      website: formData.get('website') ?? '',
      turnstileToken: formData.get('cf-turnstile-response') ?? undefined
    };

    submitButton.disabled = true;
    const originalContent = submitButton.innerHTML;
    submitButton.textContent = 'Sending…';
    contactStatus.textContent = '';
    contactStatus.className = 'form-status';

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            const target = contactForm.querySelector(`[data-error-for="${field}"]`);
            if (target) target.textContent = messages[0];
          });
        }
        throw new Error(result.message || 'Could not send your message.');
      }

      contactStatus.textContent = result.message;
      contactStatus.classList.add('is-success');
      contactForm.reset();
      if (window.turnstile) window.turnstile.reset();
    } catch (error) {
      contactStatus.textContent =
        error.name === 'TimeoutError'
          ? 'The server is waking up. Please try once more.'
          : error.message;
      contactStatus.classList.add('is-error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalContent;
    }
  });
}

/**
 * Render live GitHub repo cards from the portfolio backend.
 */
async function loadGithubRepositories() {
  const container = document.querySelector('#github-repos');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/github/repos?limit=6`);
    const result = await response.json();
    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error('No repos returned');
    }

    container.replaceChildren(
      ...result.data.map((repo) => {
        const card = document.createElement('article');
        card.className = 'github-card';

        const title = document.createElement('h3');
        title.textContent = repo.name;

        const description = document.createElement('p');
        description.textContent = repo.description || 'Public repository on GitHub.';

        const meta = document.createElement('span');
        meta.className = 'github-meta';
        meta.textContent = `${repo.language || 'Mixed'} · ★ ${repo.stars}`;

        const link = document.createElement('a');
        link.href = repo.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `View on GitHub ↗`;

        card.append(title, description, meta, link);
        return card;
      })
    );
  } catch (err) {
    // If backend isn't reachable or fails, fail gracefully without breaking UI
    container.remove();
  } finally {
    container?.removeAttribute?.('aria-busy');
  }
}

loadGithubRepositories();
