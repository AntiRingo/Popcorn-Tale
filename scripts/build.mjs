import { readFile, mkdir, writeFile } from 'node:fs/promises';
let html = await readFile('index.html', 'utf8');
const css = await readFile('style.css', 'utf8');
const sources = await Promise.all(['src/progression.js', 'src/engine.js', 'src/art.js', 'src/app.js'].map(p => readFile(p, 'utf8')));
const js = sources.map(s => s.replace(/^import .*?;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
html = html.replace('<link rel="stylesheet" href="./style.css" />', `<style>${css}</style>`).replace('<script type="module" src="./src/app.js"></script>', () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
console.log(`Built dist/index.html (${Math.round(Buffer.byteLength(html) / 1024)} KB). Open directly in a browser; no server required.`);
