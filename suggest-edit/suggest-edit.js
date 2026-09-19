// Suggest-an-edit form for the platform test book.
//
// A second client of the suggest-edit function, deliberately minimal. It speaks the
// same contract as the canonical book's publish.js (the comment block at the top of
// that file is the reference):
//
//   POST <ENDPOINT>, Content-Type: application/json
//   { name, email, suggestion, reasoning, path, website }
//   201 -> { issueUrl }
//   4xx/5xx -> { error, userMessage? }   error is log material; never rendered
//
// Which book the suggestion is for is NOT sent: the function decides it from the
// browser's Origin header, against the registry. That is the thing under test.
//
// The page's source path comes from the "Edit on GitHub" link that the
// edit-on-github plugin renders from Quartz's own fileData.filePath, e.g.
// https://github.com/<owner>/<repo>/edit/main/content/chapter-1.md
// -> "content/chapter-1.md". Pages with no such link (folder and tag listings, 404)
// get no button.
//
// Injected into every page by scripts/add-suggest-edit.mjs after `quartz build`.

(function () {
  // registry: platform.suggest_edit_endpoint
  const ENDPOINT = 'https://suggest-edit-function.vercel.app/api/suggest-edit';
  const TIMEOUT_MS = 10000;
  const EDIT_HREF = /^https:\/\/github\.com\/[^/]+\/[^/]+\/edit\/[^/]+\/(.+\.md)$/;

  function sourcePath() {
    const link = document.querySelector('a.edit-on-github');
    const m = link && EDIT_HREF.exec(link.getAttribute('href') || '');
    if (!m) return null;
    try {
      return decodeURI(m[1]);
    } catch {
      return null;
    }
  }

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
    if (text) node.textContent = text;
    return node;
  }

  function field(form, label, input) {
    const wrap = el('label', { class: 'tb-se-field' });
    wrap.append(el('span', {}, label), input);
    form.append(wrap);
    return input;
  }

  function mount(path) {
    const anchor = document.querySelector('a.edit-on-github');
    const button = el('button', { type: 'button', class: 'tb-se-open', 'data-path': path }, 'Suggest an edit');
    anchor.after(button);

    const dialog = el('dialog', { class: 'tb-se-dialog', 'aria-labelledby': 'tb-se-title' });
    dialog.append(el('h2', { id: 'tb-se-title' }, 'Suggest an edit'));
    dialog.append(el('p', { class: 'tb-se-page' }, `Page: ${path}`));

    const form = el('form', { method: 'dialog' });
    const name = field(form, 'Your name', el('input', { name: 'name', required: '', maxlength: '200' }));
    const email = field(form, 'Your email (not published)', el('input', { name: 'email', type: 'email', required: '', maxlength: '254' }));
    const suggestion = field(form, 'Suggested change', el('textarea', { name: 'suggestion', required: '', rows: '4', maxlength: '5000' }));
    const reasoning = field(form, 'Why (optional)', el('textarea', { name: 'reasoning', rows: '2', maxlength: '5000' }));

    // Honeypot, the same bait publish.js uses: hidden from people, and a filled-in
    // value is discarded by the function with a fake 201.
    const hp = el('input', { name: 'website', tabindex: '-1', autocomplete: 'off' });
    const hpWrap = el('div', { class: 'tb-se-hp', 'aria-hidden': 'true' });
    hpWrap.append(hp);
    form.append(hpWrap);

    const status = el('p', { class: 'tb-se-status', role: 'status' });
    const actions = el('div', { class: 'tb-se-actions' });
    const cancel = el('button', { type: 'button' }, 'Close');
    const send = el('button', { type: 'submit' }, 'Send suggestion');
    actions.append(cancel, send);
    form.append(status, actions);
    dialog.append(form);
    document.body.append(dialog);

    button.addEventListener('click', () => {
      status.textContent = '';
      send.disabled = false;
      dialog.showModal();
    });
    cancel.addEventListener('click', () => dialog.close());

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      send.disabled = true;
      status.textContent = 'Sending…';

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            suggestion: suggestion.value,
            reasoning: reasoning.value,
            path,
            website: hp.value,
          }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => null);
        if (res.status === 201 && data && typeof data.issueUrl === 'string') {
          status.textContent = 'Thank you. Your suggestion was filed: ';
          const link = el('a', { href: data.issueUrl, target: '_blank', rel: 'noopener' }, data.issueUrl);
          status.append(link);
          form.reset();
          return;
        }
        // `error` is for the console only. The status code is shown because this is a
        // test book and the test plan checks it; the canonical form doesn't show it.
        console.warn('suggest-edit:', res.status, data && data.error);
        const message = data && typeof data.userMessage === 'string' ? data.userMessage.trim().slice(0, 200) : '';
        status.textContent = `${message || 'Your suggestion could not be sent. Please try again later.'} (HTTP ${res.status})`;
      } catch (err) {
        // Includes a CORS refusal: the browser hides the 403 from the page.
        console.warn('suggest-edit: request failed', err);
        status.textContent = 'Your suggestion could not be sent (no response, or the request was refused). Please try again later.';
      } finally {
        clearTimeout(timer);
        send.disabled = false;
      }
    });
  }

  function start() {
    const path = sourcePath();
    if (path) mount(path);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
