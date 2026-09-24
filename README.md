# Platform test book

**Not a textbook.** A throwaway second book, registered as `platform-test-book`, that
tests the platform's shared services with two books
(`textbook-registry/design/MULTI-BOOK-HOSTING.md` §6), and demonstrates a book on the
shared builder (`BOOK-ONE-TO-QUARTZ.md` D17, §8 step 21). The text is placeholder.

- **Site:** https://platform-test-book-2.pages.dev (Cloudflare Pages project
  `platform-test-book-2`, Direct Upload, in the platform's account). The drafts preview is
  `https://drafts.platform-test-book-2.pages.dev`.
- **Registry status:** `preview`. It resolves in the suggest-edit function and appears in
  the console and in the portal's *Not for readers* section, but never in the portal's
  reader sections. Retire it with `status: retired` when it's no longer needed. Don't
  delete it from the registry.
- **Why this account:** the repo belongs to `dept-coordinator-test`, not
  `textbookproject2026-alt`, so the function's per-repository GitHub App installation
  lookup is tested against a second owner.

## How it is built

Like every platform book: this repo holds only the book, and
[`quartz-book`](https://github.com/textbookproject2026-alt/quartz-book) builds and deploys
it, reading the title, domain and options from the registry. There is no Quartz here and
nothing to configure. The design values, Hypothes.is, the controls row (Edit, History,
Suggest an edit), paragraph numbers, the graph and the book's catalog for the portal all
come from the builder.

`.github/workflows/nudge.yml` tells the builder when a branch moves, so the site rebuilds
within a couple of minutes. Without it the builder still catches up within 15 minutes.

## What is in it

| Path | What |
|---|---|
| `index.md` | The book's home page |
| `chapters/` | Three placeholder chapters. Each has one deliberate misspelling (`recieve`, `seperately`, `definately`), so a suggestion like `"recieve" should be "receive"` gives the console an exact replacement to apply |
| `textbook.config.json` | Names the slug. The builder finds the book's registry entry by it, and the console cross-checks it against this checkout's `origin` remote |

Only `index.md`, `chapters/`, `assets/`, `glossary.md` and `community/` are published.

This is a book, not a department edition. It has no upstream to sync from, and its
registry entry has `editions: null`.

## Branches

`main` is live. `drafts` is where the console writes, and the console opens a
drafts → main pull request to publish. Both branches must exist, because the registry's CI
checks for them, and both are built: `main` to the site, `drafts` to the drafts preview.

## Licence

The text is CC-BY-SA-4.0 (`LICENSE`), as in the registry.
