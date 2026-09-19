// Adds the suggest-an-edit form to the built site. Runs after `npx quartz build`.
//
//   node scripts/add-suggest-edit.mjs [public]
//
// Copies suggest-edit/suggest-edit.{js,css} to public/static/ and links both from
// the <head> of every built page. Quartz v5 has no suggest-edit plugin, and a
// post-build step keeps this test book free of a plugin of its own.
//
// Fails the build if no page would show the form: that means the edit-on-github
// link, which the script reads each page's source path from, has gone missing.

import { readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = process.argv[2] ?? 'public';
const TAGS =
  '<link rel="stylesheet" href="/static/suggest-edit.css">' +
  '<script src="/static/suggest-edit.js" defer></script>';
const MARKER = 'src="/static/suggest-edit.js"';

mkdirSync(join(OUT, 'static'), { recursive: true });
for (const f of ['suggest-edit.js', 'suggest-edit.css']) copyFileSync(join('suggest-edit', f), join(OUT, 'static', f));

const pages = readdirSync(OUT, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => join(OUT, f));
let injected = 0;
const withForm = [];
for (const file of pages) {
  let html = readFileSync(file, 'utf8');
  if (!html.includes(MARKER)) {
    if (!html.includes('</head>')) throw new Error(`${file}: no </head> to inject into`);
    html = html.replace('</head>', `${TAGS}</head>`);
    writeFileSync(file, html);
    injected++;
  }
  const m = /class="edit-on-github" href="https:\/\/github\.com\/[^"]+\/edit\/[^/"]+\/([^"]+\.md)"/.exec(html);
  if (m) withForm.push(`${relative(OUT, file)} -> ${m[1]}`);
}

console.log(`add-suggest-edit: linked the form into ${injected} of ${pages.length} page(s).`);
console.log(`add-suggest-edit: ${withForm.length} page(s) will show it:\n  ${withForm.join('\n  ')}`);
if (!withForm.length) {
  console.error('add-suggest-edit: no page has an edit-on-github link, so no page would show the form. Is the edit-on-github plugin still enabled in quartz.config.yaml?');
  process.exit(1);
}
