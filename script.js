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

/* ── "Ask about Ronit" AI Assistant ─────────────────────────────── */
(function initAssistant() {
  const ASSISTANT_API =
    typeof API_BASE_URL !== 'undefined'
      ? API_BASE_URL
      : (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:'
        ? 'http://localhost:5000/api'
        : 'https://YOUR-SERVICE.onrender.com/api');

  const assistantDialog = document.querySelector('#assistant-dialog');
  const assistantTrigger = document.querySelector('#assistant-trigger');
  const assistantForm = document.querySelector('#assistant-form');
  const assistantInput = document.querySelector('#assistant-input');
  const assistantLog = document.querySelector('#assistant-log');

  if (!assistantDialog || !assistantTrigger || !assistantForm || !assistantInput || !assistantLog) {
    return;
  }

  const closeButton = assistantDialog.querySelector('.dialog-close');
  const submitButton = assistantForm.querySelector('button[type="submit"]');

  assistantTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (assistantDialog.open) {
      assistantDialog.close();
      return;
    }
    assistantDialog.showModal();
    assistantDialog.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      assistantInput?.focus({ preventScroll: true });
    }, 50);
  });

  closeButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    assistantDialog.close();
  });

  assistantDialog.addEventListener('click', (e) => {
    if (e.target === assistantDialog) {
      assistantDialog.close();
    }
  });

  assistantDialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    assistantTrigger?.focus({ preventScroll: true });
  });

  assistantDialog.querySelectorAll('.assistant-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.question;
      if (q && !assistantInput.disabled) {
        assistantInput.value = q;
        if (typeof assistantForm.requestSubmit === 'function') {
          assistantForm.requestSubmit();
        } else {
          assistantForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    });
  });

  function formatAssistantMessage(text) {
    if (!text) return '';
    const links = [];
    const addLink = (href, label) => {
      const idx = links.length;
      links.push(`<a href="${href}" target="_blank" rel="noopener noreferrer" class="assistant-link">${label} ↗</a>`);
      return `___LINK_${idx}___`;
    };
    const addEmail = (email) => {
      const idx = links.length;
      links.push(`<a href="mailto:${email}" class="assistant-link">${email}</a>`);
      return `___LINK_${idx}___`;
    };

    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    safe = safe.replace(/\[([^\]]+)\]\(((?:https?:\/\/)[^\s)]+)\)/g, (_, label, url) => addLink(url, label));

    safe = safe.replace(/(https?:\/\/[^\s<)]+)/g, (url) => {
      const cleanUrl = url.replace(/[.,;!?)]+$/, '');
      const trailing = url.slice(cleanUrl.length);
      return addLink(cleanUrl, cleanUrl) + trailing;
    });

    safe = safe.replace(/(?:^|[\s(])((?:github\.com|[\w-]+\.vercel\.app)[^\s<)]*)/g, (match, url) => {
      const prefix = match.slice(0, match.indexOf(url));
      const cleanUrl = url.replace(/[.,;!?)]+$/, '');
      const trailing = url.slice(cleanUrl.length);
      return prefix + addLink(`https://${cleanUrl}`, cleanUrl) + trailing;
    });

    safe = safe.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (email) => {
      const cleanEmail = email.replace(/[.,;!?]+$/, '');
      const trailing = email.slice(cleanEmail.length);
      return addEmail(cleanEmail) + trailing;
    });

    return safe.replace(/___LINK_(\d+)___/g, (_, idx) => links[Number(idx)] || '');
  }

  assistantForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = assistantInput.value.trim();
    if (!question) return;

    // 1. Append user message bubble (escaped via textContent)
    const userBubble = document.createElement('div');
    userBubble.className = 'assistant-msg assistant-msg-user';
    userBubble.textContent = question;
    assistantLog.append(userBubble);

    // 2. Disable input and submit button
    assistantInput.disabled = true;
    if (submitButton) submitButton.disabled = true;

    // 3. Append three-dot "typing" bubble
    const botBubble = document.createElement('div');
    botBubble.className = 'assistant-msg assistant-msg-bot assistant-msg-typing';
    botBubble.textContent = 'Thinking…';
    assistantLog.append(botBubble);
    assistantLog.scrollTop = assistantLog.scrollHeight;

    const fallbackMessage = "That's taking too long — try again in a moment, or email ronitparmar.work@gmail.com directly.";

    try {
      const response = await fetch(`${ASSISTANT_API}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(20000)
      });

      botBubble.classList.remove('assistant-msg-typing');

      if (!response.ok) {
        botBubble.innerHTML = formatAssistantMessage(fallbackMessage);
      } else {
        const result = await response.json();
        if (result.success && result.answer) {
          botBubble.innerHTML = formatAssistantMessage(result.answer);
        } else {
          botBubble.innerHTML = formatAssistantMessage(fallbackMessage);
        }
      }
    } catch (_) {
      botBubble.classList.remove('assistant-msg-typing');
      botBubble.innerHTML = formatAssistantMessage(fallbackMessage);
    } finally {
      assistantInput.disabled = false;
      if (submitButton) submitButton.disabled = false;
      assistantInput.value = '';
      assistantLog.scrollTop = assistantLog.scrollHeight;
      assistantInput.focus({ preventScroll: true });
    }
  });
})();

