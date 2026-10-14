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
  cinepulse: {
    name: 'CinePulse',
    description: 'A full-stack movie discovery and watchlist platform powered by the TMDB API, with a PostgreSQL backend and Python data layer.',
    stack: ['TypeScript', 'JavaScript', 'CSS3', 'HTML5', 'PL/pgSQL', 'Python', 'TMDB API'],
    features: [
      'Built a responsive movie discovery UI with dynamic search, filters, and a curated trending feed using the TMDB API.',
      'Designed and implemented a PostgreSQL schema with PL/pgSQL procedures to manage user watchlists and ratings.',
      'Developed a Python data layer to sync TMDB metadata with the local database.',
      'Deployed the live application on Vercel with continuous deployment via GitHub.'
    ],
    github: 'https://github.com/ronitparmar24/cinepulse',
    live: 'https://cinepulse-kohl.vercel.app/'
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
  window.PORTFOLIO_API_URL ||
  (location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : '/api');

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

  const nameInput = contactForm.querySelector('#contact-name');
  const emailInput = contactForm.querySelector('#contact-email');
  const messageInput = contactForm.querySelector('#contact-message');
  const charCounter = contactForm.querySelector('#contact-char-counter');

  // Real-time character counter for message textarea
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCounter.textContent = `${len} / 3000`;
      charCounter.classList.toggle('is-limit', len > 2800);
    });
  }

  function validateField(input, testFn, errorMsg) {
    if (!input) return true;
    const errTarget = contactForm.querySelector(`[data-error-for="${input.name}"]`);
    const val = input.value.trim();
    const isValid = testFn(val);

    if (!isValid) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');
      if (errTarget) errTarget.textContent = errorMsg;
    } else {
      input.classList.remove('is-invalid');
      if (val.length > 0) input.classList.add('is-valid');
      input.setAttribute('aria-invalid', 'false');
      if (errTarget) errTarget.textContent = '';
    }
    return isValid;
  }

  const fieldValidators = {
    name: () => validateField(nameInput, (v) => v.length >= 2 && v.length <= 80, 'Name must be at least 2 characters'),
    email: () => validateField(emailInput, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address'),
    message: () => validateField(messageInput, (v) => v.length >= 10 && v.length <= 3000, 'Message must be at least 10 characters')
  };

  [nameInput, emailInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('blur', () => fieldValidators[input.name]?.());
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        fieldValidators[input.name]?.();
      }
    });
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Client-side validation check before network request
    const isNameValid = fieldValidators.name();
    const isEmailValid = fieldValidators.email();
    const isMessageValid = fieldValidators.message();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      contactStatus.textContent = 'Please check the highlighted fields.';
      contactStatus.className = 'form-status is-error';
      const firstInvalid = contactForm.querySelector('.is-invalid');
      firstInvalid?.focus();
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);

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
            const targetInput = contactForm.querySelector(`[name="${field}"]`);
            if (target) target.textContent = messages[0];
            if (targetInput) {
              targetInput.classList.add('is-invalid');
              targetInput.setAttribute('aria-invalid', 'true');
            }
          });
        }
        throw new Error(result.message || 'Could not send your message.');
      }

      contactStatus.textContent = result.message;
      contactStatus.classList.add('is-success');
      contactForm.reset();
      contactForm.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
      if (charCounter) charCounter.textContent = '0 / 3000';
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
    const response = await fetch(`${API_BASE_URL}/github/repos?limit=4`);
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
    // If backend isn't reachable or fails, remove the skeleton container gracefully
    container.remove();
  } finally {
    container?.removeAttribute?.('aria-busy');
  }
}

loadGithubRepositories();

/* ── More Builds toggle ─────────────────────────────── */
(function initMoreBuildsToggle() {
  const btn   = document.getElementById('more-builds-toggle');
  const body  = document.getElementById('more-builds-body');
  const label = btn?.querySelector('.toggle-label');
  if (!btn || !body) return;

  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !isExpanded;

    btn.setAttribute('aria-expanded', String(next));
    body.classList.toggle('is-hidden', !next);
    if (label) label.textContent = next ? 'Hide' : 'Show';
  });
})();

/* ── "Ask about Ronit" Portfolio Guide Assistant ─────────────────────────────── */
(function initAssistant() {
  const ASSISTANT_API =
    typeof API_BASE_URL !== 'undefined'
      ? API_BASE_URL
      : (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:'
        ? 'http://localhost:5000/api'
        : '/api');

  const assistantDialog = document.querySelector('#assistant-dialog');
  const assistantTrigger = document.querySelector('#assistant-trigger');
  const assistantForm = document.querySelector('#assistant-form');
  const assistantInput = document.querySelector('#assistant-input');
  const assistantLog = document.querySelector('#assistant-log');
  const clearBtn = document.querySelector('#assistant-clear-btn');
  const closeBtn = document.querySelector('#assistant-close-btn') || assistantDialog?.querySelector('.dialog-close');
  const sendBtn = document.querySelector('#assistant-send-btn') || assistantForm?.querySelector('button[type="submit"]');
  const stopBtn = document.querySelector('#assistant-stop-btn');
  const charCounter = document.querySelector('#assistant-char-count');
  const jumpBtn = document.querySelector('#assistant-jump-btn');
  const modePills = document.querySelectorAll('.assistant-mode-pill');

  if (!assistantDialog || !assistantTrigger || !assistantForm || !assistantInput || !assistantLog) {
    return;
  }

  const STORAGE_KEY = 'ronit_portfolio_chat_v3';
  const MODE_STORAGE_KEY = 'ronit_assistant_mode_v3';
  const SESSION_ID_KEY = 'ronit_assistant_session_v3';
  const MAX_HISTORY_TURNS = 8;
  const CLIENT_TIMEOUT_MS = 16000;

  // Strict allowlist for frontend clickable actions
  const ALLOWED_URLS = new Set([
    'https://metro-mind-lemon.vercel.app/',
    'https://github.com/ronitparmar24/MetroMind',
    'https://cinepulse-kohl.vercel.app/',
    'https://github.com/ronitparmar24/Cinepulse',
    'https://github.com/ronitparmar24/cinepulse',
    'https://github.com/ronitparmar24/digiKhata',
    'https://github.com/ronitparmar24/metroflow',
    'https://github.com/ronitparmar24/BRTS-Management',
    'https://github.com/ronitparmar24/FlappyBirdV1',
    'https://github.com/ronitparmar24?tab=repositories',
    'https://github.com/ronitparmar24',
    'https://linkedin.com/in/ronit-parmar',
    './assets/Ronit_Parmar_Resume.pdf',
    'mailto:ronitparmar.work@gmail.com',
    '#contact',
    '#work',
    '#about',
    '#toolkit',
    '#journey'
  ]);

  const STARTER_ACTIONS = [
    { label: '🌟 Featured: MetroMind AI', question: 'Tell me about his flagship project MetroMind and its ML architecture' },
    { label: '🎬 Full-Stack: CinePulse (Postgres)', question: 'What makes CinePulse unique and how does it use PostgreSQL stored procedures?' },
    { label: '⚡ Summarize Ronit in 30s', question: 'Summarize Ronit in 30 seconds for a recruiter' },
    { label: '💼 Fit for Full-Stack Internship?', question: 'Is Ronit a fit for a full-stack developer internship?' }
  ];

  // Initialize session ID
  let sessionId = '';
  try {
    sessionId = sessionStorage.getItem(SESSION_ID_KEY) || '';
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  } catch (_) {
    sessionId = 'sess_' + Date.now();
  }

  // Auto-adaptive interaction mode (automatically adjusts tone and depth based on question intent)
  const currentMode = 'auto';

  // Ensure controls are in clean initial state
  if (stopBtn) stopBtn.hidden = true;
  if (sendBtn) sendBtn.hidden = false;
  if (jumpBtn) jumpBtn.hidden = true;
  if (assistantInput) assistantInput.style.height = '42px';

  // Conversation state
  let conversation = [];
  let lastFailedQuestion = null;
  let currentAbortController = null;
  let userHasScrolledUp = false;

  // Character counter listener
  assistantInput.addEventListener('input', () => {
    const len = assistantInput.value.length;
    if (charCounter) {
      charCounter.textContent = `${len}/350`;
      charCounter.style.color = len > 320 ? '#ff6b6b' : 'var(--muted)';
    }
    // Auto-adjust height for textarea (clamps between 42px and 84px)
    assistantInput.style.height = 'auto';
    const newHeight = Math.max(42, Math.min(assistantInput.scrollHeight, 84));
    assistantInput.style.height = `${newHeight}px`;
  });

  // Track user scroll position in log
  assistantLog.addEventListener('scroll', () => {
    const scrollBottom = assistantLog.scrollHeight - assistantLog.scrollTop - assistantLog.clientHeight;
    userHasScrolledUp = scrollBottom > 60;
    if (jumpBtn) {
      jumpBtn.hidden = !userHasScrolledUp;
    }
  });

  jumpBtn?.addEventListener('click', () => {
    assistantLog.scrollTo({ top: assistantLog.scrollHeight, behavior: 'smooth' });
    userHasScrolledUp = false;
    jumpBtn.hidden = true;
  });

  function scrollToBottomIfAllowed(smooth = true) {
    if (!userHasScrolledUp) {
      if (smooth) {
        assistantLog.scrollTo({ top: assistantLog.scrollHeight, behavior: 'smooth' });
      } else {
        assistantLog.scrollTop = assistantLog.scrollHeight;
      }
    }
  }

  // Restore session from tab-scoped sessionStorage
  function loadSession() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          conversation = parsed;
          renderConversation();
          return;
        }
      }
    } catch (_) {}
    renderWelcomeState();
  }

  function saveSession() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation.slice(-14)));
    } catch (_) {}
  }

  function clearSession() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
    conversation = [];
    lastFailedQuestion = null;
    assistantInput.value = '';
    assistantInput.style.height = '42px';
    if (charCounter) charCounter.textContent = '0/350';
    renderWelcomeState();
    toast('Conversation cleared.');
    assistantInput.focus({ preventScroll: true });
  }

  clearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSession();
  });

  // Open & Close docked panel
  function openAssistant() {
    if (assistantDialog.open) return;

    const launcherWrap = document.querySelector('.assistant-launcher-wrap');
    if (launcherWrap) launcherWrap.classList.add('is-open');

    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
      assistantDialog.showModal();
    } else {
      assistantDialog.show();
    }

    assistantTrigger.setAttribute('aria-expanded', 'true');
    assistantDialog.scrollTop = 0;
    assistantLog.scrollTop = assistantLog.scrollHeight;

    setTimeout(() => {
      assistantInput?.focus({ preventScroll: true });
    }, 60);
  }

  function closeAssistant() {
    if (!assistantDialog.open) return;

    const launcherWrap = document.querySelector('.assistant-launcher-wrap');
    if (launcherWrap) launcherWrap.classList.remove('is-open');

    assistantDialog.close();
    assistantTrigger.setAttribute('aria-expanded', 'false');
    assistantTrigger.focus({ preventScroll: true });
  }

  assistantTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (assistantDialog.open) {
      closeAssistant();
    } else {
      openAssistant();
    }
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAssistant();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && assistantDialog.open) {
      closeAssistant();
    }
  });

  // Keyboard shortcut: Enter sends, Shift+Enter new line
  assistantInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      assistantForm.requestSubmit();
    }
  });

  // Render initial welcome state
  function renderWelcomeState() {
    assistantLog.replaceChildren();

    const welcomeWrap = document.createElement('div');
    welcomeWrap.className = 'assistant-welcome';

    const card = document.createElement('div');
    card.className = 'assistant-welcome-card';

    const greeting = document.createElement('p');
    greeting.textContent =
      'Hi! I’m Ronit’s portfolio guide. Ask me about his flagship builds MetroMind and CinePulse, full-stack architecture, or internship availability.';
    card.append(greeting);

    const sub = document.createElement('small');
    sub.textContent = 'Grounded strictly in verified portfolio code, projects, and résumé.';
    card.append(sub);

    welcomeWrap.append(card);

    const startersWrap = document.createElement('div');
    startersWrap.className = 'assistant-starters';

    const label = document.createElement('span');
    label.className = 'assistant-starters-label';
    label.textContent = 'Explore Ronit’s work:';
    startersWrap.append(label);

    const list = document.createElement('div');
    list.className = 'assistant-starters-list';
    list.setAttribute('role', 'group');
    list.setAttribute('aria-label', 'Starter questions');

    STARTER_ACTIONS.forEach(({ label: chipLabel, question }) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'assistant-chip';
      chip.textContent = chipLabel;
      chip.setAttribute('data-question', question);
      chip.addEventListener('click', () => {
        submitQuestion(question);
      });
      list.append(chip);
    });

    startersWrap.append(list);
    welcomeWrap.append(startersWrap);
    assistantLog.append(welcomeWrap);
    scrollToBottomIfAllowed(false);
  }

  // Safe DOM-based markdown formatter (Guarantees zero XSS)
  function renderSafeMarkdown(rawText) {
    const fragment = document.createDocumentFragment();
    if (!rawText) return fragment;

    const lines = rawText.split('\n');
    let currentList = null;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Bullet list items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        if (!currentList) {
          currentList = document.createElement('ul');
          fragment.append(currentList);
        }
        const li = document.createElement('li');
        const itemText = trimmed.replace(/^[-*•]\s+/, '');
        formatInlineContent(itemText, li);
        currentList.append(li);
        return;
      }

      currentList = null; // Close active list

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        const quote = document.createElement('blockquote');
        formatInlineContent(trimmed.slice(2), quote);
        fragment.append(quote);
        return;
      }

      // Empty line
      if (!trimmed) {
        return;
      }

      // Headers (### Header)
      if (trimmed.startsWith('### ')) {
        const h4 = document.createElement('strong');
        h4.style.display = 'block';
        h4.style.marginTop = '6px';
        formatInlineContent(trimmed.slice(4), h4);
        fragment.append(h4);
        return;
      }

      // Paragraph
      const p = document.createElement('p');
      formatInlineContent(line, p);
      fragment.append(p);
    });

    return fragment;
  }

  function formatInlineContent(text, container) {
    if (!text) return;

    // Tokenize bold, code, emails, and URLs
    const parts = text.split(
      /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s)]+|mailto:[^\s)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    );

    parts.forEach((part) => {
      if (!part) return;

      // Bold (**bold**)
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        container.append(strong);
        return;
      }

      // Inline code (`code`)
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const code = document.createElement('code');
        code.textContent = part.slice(1, -1);
        container.append(code);
        return;
      }

      // Email address
      if (part.includes('@') && !part.startsWith('http')) {
        const cleanEmail = part.replace(/[.,;!?)]+$/, '');
        const trailing = part.slice(cleanEmail.length);
        const mailto = `mailto:${cleanEmail}`;
        if (ALLOWED_URLS.has(mailto)) {
          const a = document.createElement('a');
          a.href = mailto;
          a.className = 'assistant-link';
          a.textContent = cleanEmail;
          container.append(a);
          if (trailing) container.append(document.createTextNode(trailing));
          return;
        }
      }

      // Verified URL
      if (part.startsWith('http')) {
        const cleanUrl = part.replace(/[.,;!?)]+$/, '');
        const trailing = part.slice(cleanUrl.length);

        if (ALLOWED_URLS.has(cleanUrl)) {
          const a = document.createElement('a');
          a.href = cleanUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'assistant-link';
          a.textContent = `${cleanUrl} ↗`;
          container.append(a);
          if (trailing) container.append(document.createTextNode(trailing));
          return;
        }
      }

      // Regular safe text node
      container.append(document.createTextNode(part));
    });
  }

  // Execute site-aware actions
  function executeAction(act) {
    if (!act) return;

    // Scroll to section
    if (act.type === 'scroll' || act.actionType === 'scroll') {
      const targetSelector = act.target || act.url;
      const el = document.querySelector(targetSelector);
      if (el) {
        if (window.innerWidth <= 640 && assistantDialog.open) {
          closeAssistant();
        }
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Open project modal dialog
    if (act.type === 'openProject' || act.actionType === 'openProject') {
      const projectId = act.id || act.project?.id;
      if (typeof openProject === 'function' && projectId) {
        if (window.innerWidth <= 640 && assistantDialog.open) {
          closeAssistant();
        }
        openProject(projectId, assistantTrigger);
      }
      return;
    }

    // Open contact form and prefill
    if (act.type === 'openContact' || act.actionType === 'openContact') {
      if (window.innerWidth <= 640 && assistantDialog.open) {
        closeAssistant();
      }
      const contactEl = document.querySelector('#contact');
      contactEl?.scrollIntoView({ behavior: 'smooth' });
      if (act.prefill?.message) {
        const msgInput = document.querySelector('#contact-message');
        if (msgInput) {
          msgInput.value = act.prefill.message;
          msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      document.querySelector('#contact-name')?.focus({ preventScroll: true });
      return;
    }

    // Download resume
    if (act.type === 'downloadResume' || act.actionType === 'downloadResume') {
      const a = document.createElement('a');
      a.href = './assets/Ronit_Parmar_Resume.pdf';
      a.setAttribute('download', 'Ronit_Parmar_Resume.pdf');
      document.body.append(a);
      a.click();
      a.remove();
      toast('Downloading Ronit’s résumé…');
      return;
    }
  }

  // Render a project card component inside bot message
  function renderProjectCard(proj) {
    const card = document.createElement('div');
    card.className = 'assistant-project-card';

    const header = document.createElement('div');
    header.className = 'assistant-project-header';

    const title = document.createElement('span');
    title.className = 'assistant-project-title';
    title.textContent = proj.name;
    header.append(title);
    card.append(header);

    if (proj.tagline) {
      const tagline = document.createElement('div');
      tagline.className = 'assistant-project-tagline';
      tagline.textContent = proj.tagline;
      card.append(tagline);
    }

    if (Array.isArray(proj.stack) && proj.stack.length > 0) {
      const tagRow = document.createElement('div');
      tagRow.className = 'assistant-project-tags';
      proj.stack.slice(0, 5).forEach((t) => {
        const tag = document.createElement('span');
        tag.className = 'assistant-project-tag';
        tag.textContent = t;
        tagRow.append(tag);
      });
      card.append(tagRow);
    }

    const actionsRow = document.createElement('div');
    actionsRow.className = 'assistant-project-actions';

    // Button to open modal breakdown
    const modalBtn = document.createElement('button');
    modalBtn.type = 'button';
    modalBtn.className = 'assistant-card-btn';
    modalBtn.textContent = 'Project Breakdown ↗';
    modalBtn.addEventListener('click', () => {
      executeAction({ type: 'openProject', id: proj.id });
    });
    actionsRow.append(modalBtn);

    // Live link button
    if (proj.liveUrl && ALLOWED_URLS.has(proj.liveUrl)) {
      const liveBtn = document.createElement('a');
      liveBtn.className = 'assistant-card-btn';
      liveBtn.href = proj.liveUrl;
      liveBtn.target = '_blank';
      liveBtn.rel = 'noopener noreferrer';
      liveBtn.textContent = 'Live Demo ↗';
      actionsRow.append(liveBtn);
    }

    // GitHub link button
    if (proj.githubUrl && ALLOWED_URLS.has(proj.githubUrl)) {
      const ghBtn = document.createElement('a');
      ghBtn.className = 'assistant-card-btn';
      ghBtn.href = proj.githubUrl;
      ghBtn.target = '_blank';
      ghBtn.rel = 'noopener noreferrer';
      ghBtn.textContent = 'GitHub ↗';
      actionsRow.append(ghBtn);
    }

    card.append(actionsRow);
    return card;
  }

  // Render full conversation
  function renderConversation() {
    assistantLog.replaceChildren();

    if (conversation.length === 0) {
      renderWelcomeState();
      return;
    }

    conversation.forEach((turn, idx) => {
      if (turn.role === 'user') {
        const bubble = document.createElement('div');
        bubble.className = 'assistant-msg assistant-msg-user';
        bubble.textContent = turn.content;
        assistantLog.append(bubble);
      } else if (turn.role === 'assistant') {
        const bubble = document.createElement('div');
        bubble.className = 'assistant-msg assistant-msg-bot';

        // Header with timestamp, copy button, and feedback buttons
        const header = document.createElement('div');
        header.className = 'assistant-bot-header';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'PORTFOLIO GUIDE';
        header.append(titleSpan);

        const toolsDiv = document.createElement('div');
        toolsDiv.className = 'assistant-bot-header-tools';

        if (turn.timestamp) {
          const timeSpan = document.createElement('span');
          timeSpan.className = 'assistant-msg-time';
          timeSpan.textContent = turn.timestamp;
          timeSpan.title = 'Message time';
          toolsDiv.append(timeSpan);
        }

        // Thumbs-up feedback
        const thumbsUp = document.createElement('button');
        thumbsUp.type = 'button';
        thumbsUp.className = `assistant-feedback-btn ${turn.feedback === 'up' ? 'active' : ''}`;
        thumbsUp.setAttribute('aria-label', 'Helpful answer');
        thumbsUp.title = 'Helpful';
        thumbsUp.innerHTML = '<svg class="icon"><use href="#thumbs-up"/></svg>';
        thumbsUp.addEventListener('click', () => {
          turn.feedback = turn.feedback === 'up' ? null : 'up';
          saveSession();
          renderConversation();
          toast(turn.feedback ? 'Thanks for the feedback!' : 'Feedback removed');
        });
        toolsDiv.append(thumbsUp);

        // Thumbs-down feedback
        const thumbsDown = document.createElement('button');
        thumbsDown.type = 'button';
        thumbsDown.className = `assistant-feedback-btn ${turn.feedback === 'down' ? 'active' : ''}`;
        thumbsDown.setAttribute('aria-label', 'Unhelpful answer');
        thumbsDown.title = 'Needs improvement';
        thumbsDown.innerHTML = '<svg class="icon"><use href="#thumbs-down"/></svg>';
        thumbsDown.addEventListener('click', () => {
          turn.feedback = turn.feedback === 'down' ? null : 'down';
          saveSession();
          renderConversation();
          toast(turn.feedback ? 'Feedback noted, thank you!' : 'Feedback removed');
        });
        toolsDiv.append(thumbsDown);

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'assistant-copy-btn';
        copyBtn.setAttribute('aria-label', 'Copy answer to clipboard');
        copyBtn.innerHTML = '<svg class="icon"><use href="#copy"/></svg> <span>Copy</span>';

        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(turn.content);
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.querySelector('span').textContent = 'Copy';
            }, 2000);
          } catch (_) {
            toast('Failed to copy.');
          }
        });
        toolsDiv.append(copyBtn);
        header.append(toolsDiv);
        bubble.append(header);

        // Body content
        const bodyEl = document.createElement('div');
        bodyEl.className = 'assistant-msg-body';
        bodyEl.append(renderSafeMarkdown(turn.content));
        bubble.append(bodyEl);

        // Render project cards if actions contain project data
        if (Array.isArray(turn.actions)) {
          turn.actions.forEach((act) => {
            if (act && act.project) {
              bubble.append(renderProjectCard(act.project));
            }
          });
        }

        // Action chips
        if (Array.isArray(turn.actions) && turn.actions.length > 0) {
          const actionsWrap = document.createElement('div');
          actionsWrap.className = 'assistant-actions';
          actionsWrap.setAttribute('role', 'group');
          actionsWrap.setAttribute('aria-label', 'Verified resources & actions');

          turn.actions.forEach((act) => {
            if (act && act.url && ALLOWED_URLS.has(act.url)) {
              if (act.actionType === 'openProject' || act.actionType === 'openContact' || act.actionType === 'downloadResume') {
                const actionButton = document.createElement('button');
                actionButton.type = 'button';
                actionButton.className = 'assistant-action-chip';
                actionButton.textContent = act.label || 'Action ↗';
                actionButton.addEventListener('click', () => {
                  executeAction(act);
                });
                actionsWrap.append(actionButton);
              } else {
                const chip = document.createElement('a');
                chip.className = 'assistant-action-chip';
                chip.href = act.url;
                chip.textContent = act.label || 'View resource ↗';

                if (act.type === 'download' || act.url.endsWith('.pdf')) {
                  chip.setAttribute('download', '');
                } else if (!act.url.startsWith('#') && !act.url.startsWith('mailto:')) {
                  chip.target = '_blank';
                  chip.rel = 'noopener noreferrer';
                }

                chip.addEventListener('click', (e) => {
                  if (act.url.startsWith('#')) {
                    e.preventDefault();
                    executeAction({ type: 'scroll', target: act.url });
                  }
                });

                actionsWrap.append(chip);
              }
            }
          });

          if (actionsWrap.children.length > 0) {
            bubble.append(actionsWrap);
          }
        }

        // Suggestions on the last bot response
        if (idx === conversation.length - 1 && Array.isArray(turn.suggestions) && turn.suggestions.length > 0) {
          const sugWrap = document.createElement('div');
          sugWrap.className = 'assistant-suggestions';

          const sugLabel = document.createElement('span');
          sugLabel.className = 'assistant-suggestions-label';
          sugLabel.textContent = 'Suggested follow-ups:';
          sugWrap.append(sugLabel);

          const sugList = document.createElement('div');
          sugList.className = 'assistant-suggestion-chips';

          turn.suggestions.forEach((sugText) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'assistant-chip';
            chip.textContent = sugText;
            chip.addEventListener('click', () => {
              submitQuestion(sugText);
            });
            sugList.append(chip);
          });

          sugWrap.append(sugList);
          bubble.append(sugWrap);
        }

        assistantLog.append(bubble);
      }
    });

    scrollToBottomIfAllowed(false);
  }

  // Stop button handler
  stopBtn?.addEventListener('click', () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
      toast('Generation stopped.');
    }
  });

  // Submit question flow with SSE streaming and live blinking caret
  async function submitQuestion(questionText) {
    const question = (questionText || assistantInput.value).trim();
    if (!question || assistantInput.disabled) return;

    lastFailedQuestion = null;
    userHasScrolledUp = false;

    // Reset input
    assistantInput.value = '';
    assistantInput.style.height = '42px';
    if (charCounter) charCounter.textContent = '0/350';

    // Append user message
    conversation.push({ role: 'user', content: question });
    renderConversation();

    // Toggle controls
    assistantInput.disabled = true;
    if (sendBtn) sendBtn.hidden = true;
    if (stopBtn) stopBtn.hidden = false;

    // Show initial typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'assistant-msg-typing';
    typingBubble.innerHTML =
      '<span class="typing-dots"><span></span><span></span><span></span></span> <span>Ronit’s guide is thinking…</span>';
    assistantLog.append(typingBubble);
    scrollToBottomIfAllowed(true);

    const historyPayload = conversation
      .slice(0, -1)
      .slice(-MAX_HISTORY_TURNS)
      .map((t) => ({ role: t.role, content: (t.content || '').slice(0, 1200) }));

    currentAbortController = new AbortController();

    let accumulatedText = '';
    let responseActions = [];
    let responseSuggestions = [];
    let botBubble = null;
    let botBody = null;
    let caretSpan = null;

    try {
      const response = await fetch(`${ASSISTANT_API}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          question,
          history: historyPayload,
          mode: currentMode,
          stream: true,
          sessionId
        }),
        signal: currentAbortController.signal
      });

      if (!response.ok) {
        typingBubble.remove();
        const errJson = await response.json().catch(() => null);
        handleQueryError(errJson?.message || 'The assistant could not complete your request right now.', question);
        return;
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        // SSE Streaming path
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const ev of events) {
            const lines = ev.split('\n');
            let eventType = 'message';
            let dataStr = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                dataStr = line.slice(6).trim();
              }
            }

            if (eventType === 'token' && dataStr) {
              try {
                const parsedData = JSON.parse(dataStr);
                const token = parsedData.token;
                if (token) {
                  // On first token, remove thinking bubble and create bot bubble with caret
                  if (!botBubble) {
                    typingBubble.remove();

                    botBubble = document.createElement('div');
                    botBubble.className = 'assistant-msg assistant-msg-bot';

                    const header = document.createElement('div');
                    header.className = 'assistant-bot-header';
                    header.innerHTML = '<span>PORTFOLIO GUIDE</span>';
                    botBubble.append(header);

                    botBody = document.createElement('div');
                    botBody.className = 'assistant-msg-body';

                    caretSpan = document.createElement('span');
                    caretSpan.className = 'assistant-caret';
                    caretSpan.setAttribute('aria-hidden', 'true');

                    botBubble.append(botBody);
                    assistantLog.append(botBubble);
                  }

                  accumulatedText += token;
                  botBody.replaceChildren(renderSafeMarkdown(accumulatedText));
                  botBody.append(caretSpan);
                  scrollToBottomIfAllowed(false);
                }
              } catch (_) {}
            } else if (eventType === 'meta' && dataStr) {
              try {
                const meta = JSON.parse(dataStr);
                if (Array.isArray(meta.actions)) responseActions = meta.actions;
                if (Array.isArray(meta.suggestions)) responseSuggestions = meta.suggestions;
              } catch (_) {}
            } else if (eventType === 'error' && dataStr) {
              try {
                const errData = JSON.parse(dataStr);
                throw new Error(errData.message || 'Stream error');
              } catch (e) {
                throw e;
              }
            }
          }
        }
      } else {
        // Fallback non-streaming JSON response
        typingBubble.remove();
        const data = await response.json();
        accumulatedText = data.answer || '';
        responseActions = Array.isArray(data.actions) ? data.actions : [];
        responseSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      }

      // Finalize completed response
      typingBubble.remove();
      caretSpan?.remove();

      if (accumulatedText) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        conversation.push({
          role: 'assistant',
          content: accumulatedText,
          actions: responseActions,
          suggestions: responseSuggestions,
          timestamp: timeNow
        });

        saveSession();
        renderConversation();
      }
    } catch (err) {
      typingBubble.remove();
      caretSpan?.remove();

      if (err.name === 'AbortError') {
        // User clicked stop generating or client disconnected
        if (accumulatedText) {
          const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          conversation.push({
            role: 'assistant',
            content: accumulatedText,
            actions: responseActions,
            suggestions: responseSuggestions,
            timestamp: timeNow
          });
          saveSession();
          renderConversation();
        }
      } else {
        const isTimeout = err.name === 'TimeoutError';
        const msg = isTimeout
          ? 'That question took too long to answer. Try retrying or emailing Ronit directly.'
          : err.message || 'The assistant could not connect right now. Please try again in a moment.';
        handleQueryError(msg, question);
      }
    } finally {
      currentAbortController = null;
      assistantInput.disabled = false;
      if (stopBtn) stopBtn.hidden = true;
      if (sendBtn) sendBtn.hidden = false;
      scrollToBottomIfAllowed(true);
      assistantInput.focus({ preventScroll: true });
    }
  }

  // Handle failure cleanly with retry button and direct contact option
  function handleQueryError(message, failedQuestion) {
    lastFailedQuestion = failedQuestion;

    const errorBubble = document.createElement('div');
    errorBubble.className = 'assistant-msg assistant-msg-bot assistant-msg-error';

    const textEl = document.createElement('div');
    textEl.className = 'assistant-msg-body';
    textEl.textContent = message;
    errorBubble.append(textEl);

    const retryRow = document.createElement('div');
    retryRow.className = 'assistant-retry-row';

    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'assistant-retry-btn';
    retryBtn.innerHTML = '<svg class="icon"><use href="#rotate-ccw"/></svg> <span>Retry question</span>';
    retryBtn.addEventListener('click', () => {
      errorBubble.remove();
      if (lastFailedQuestion) {
        submitQuestion(lastFailedQuestion);
      }
    });
    retryRow.append(retryBtn);

    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:ronitparmar.work@gmail.com';
    emailLink.className = 'text-link';
    emailLink.textContent = 'Email Ronit directly ↗';
    retryRow.append(emailLink);

    errorBubble.append(retryRow);
    assistantLog.append(errorBubble);
    scrollToBottomIfAllowed(true);
  }

  assistantForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitQuestion();
  });

  // Expose global helper for actions if needed
  window.assistantOpenProject = (id) => executeAction({ type: 'openProject', id });

  // Initialize session on page load
  loadSession();
})();



