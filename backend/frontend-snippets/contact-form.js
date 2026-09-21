// Append to script.js (or keep as its own module and load it with defer).

const API_BASE_URL =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-SERVICE.onrender.com/api';

/**
 * Free Render instances sleep after ~15 minutes of inactivity and take up to a
 * minute to wake. Pinging /health once when the page loads means the API is warm
 * by the time a visitor actually finishes typing a message.
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
      // Present only if you enabled Turnstile
      turnstileToken: formData.get('cf-turnstile-response') ?? undefined
    };

    submitButton.disabled = true;
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
        // Field-level errors from Zod, rendered next to the offending input
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
      submitButton.textContent = 'Send message';
    }
  });
}
