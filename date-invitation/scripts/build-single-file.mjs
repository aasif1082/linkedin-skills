// Packs the Vite build (dist/) into ONE self-contained HTML file with the
// CSS and JS inlined: dist-single/date-invite.html. Useful for hosts that take
// a single page (a claude.ai artifact, a pastebin-style host, email-free sharing).
//
// Run after `npm run build`, or just `npm run build:single`.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const outDir = new URL('../dist-single/', import.meta.url).pathname;
let html = readFileSync(join(dist, 'index.html'), 'utf8');

const assets = readdirSync(join(dist, 'assets'));
const read = (f) => readFileSync(join(dist, 'assets', f), 'utf8');
const css = assets.filter((f) => f.endsWith('.css')).map(read).join('\n');
// Escape "</script" so the inlined bundle can't close its own tag early.
const js = assets
  .filter((f) => f.endsWith('.js'))
  .map(read)
  .join('\n')
  .replace(/<\/script/gi, '<\\/script');

const title = /<title>[\s\S]*?<\/title>/.exec(html)?.[0] ?? '';
const fonts = [...html.matchAll(/<link[^>]+fonts\.(?:googleapis|gstatic)\.com[^>]*>/g)].map((m) => m[0]);
const metas = [...html.matchAll(/<meta (?:name="(?:description|theme-color)"|property="og:[^"]+")[^>]*>/g)].map((m) => m[0]);
const body = /<body>([\s\S]*?)<\/body>/.exec(html)?.[1].replace(/<script[\s\S]*?<\/script>/g, '').trim() ?? '';
const favicon = readFileSync(join(dist, 'heart.svg')).toString('base64');

// Title and styles first; the host adds its own doctype/html/head/body skeleton.
const page = [
  title,
  `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${favicon}" />`,
  ...metas,
  ...fonts,
  `<style>\n${css}\n</style>`,
  body,
  `<script type="module">\n${js}\n</script>`,
  '',
].join('\n');

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'date-invite.html'), page);
console.log(`dist-single/date-invite.html (${(page.length / 1024).toFixed(0)} KB)`);
