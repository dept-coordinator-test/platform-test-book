# Platform test book

**Not a textbook.** A throwaway second book, registered as `platform-test-book`, that
tests the platform's shared services with two books for the first time
(`platform-registry-design/MULTI-BOOK-HOSTING.md` §6). The text is placeholder.

- **Site:** https://platform-test-book.pages.dev (Cloudflare Pages, project `platform-test-book`)
- **Registry status:** `preview`. It resolves in the suggest-edit function and appears
  in the console, but is never listed publicly. Retire it with `status: retired` when the
  test is over. Don't delete it from the registry.
- **Why this account:** the repo belongs to `dept-coordinator-test`, not
  `textbookproject2026-alt`, so the function's per-repository GitHub App installation
  lookup is tested against a second owner.

## What is in it

| Path | What |
|---|---|
| `content/` | Three placeholder chapters and an index. Each chapter has one deliberate misspelling (`recieve`, `seperately`, `definately`), so a suggestion like `"recieve" should be "receive"` gives the console an exact replacement to apply |
| `quartz.config.yaml` | The edition template's config (`textbook-edition-template` @ `3675313`), with the edition-integrations plugin (Hypothes.is, Plausible) removed and edit-on-github pointed at this repo |
| `suggest-edit/` | A minimal suggest-an-edit form: a second client of the suggest-edit function, using the same contract as the canonical book's `publish.js` |
| `scripts/add-suggest-edit.mjs` | Runs after `quartz build`. It links the form into every page, and fails the build if no page would show it |
| `textbook.config.json` | Names the slug. The console reads it and cross-checks it against this checkout's `origin` remote |

This is a book, not a department edition. It has no upstream to sync from, and its
registry entry has `editions: null`.

## Branches

`main` is live, and Cloudflare Pages builds it. `drafts` is where the console writes.
The console opens a drafts → main pull request to publish. Both branches must exist,
because the registry's CI checks for them.

## Build

Cloudflare Pages settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | `git fetch --unshallow \|\| true && npm run build:site` |
| Build output directory | `public` |
| Environment variable | `NODE_VERSION` = `22` |

Locally: `npm ci && npm run build:site`, then serve `public/`. The form posts to the
production function, which refuses any origin except `https://platform-test-book.pages.dev`,
so a local copy shows the form but can't file anything.

## Licence

The text is CC-BY-SA-4.0, as in the registry. The Quartz code is MIT (`LICENSE.txt`).
