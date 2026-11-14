// Сборка одной страницы для артефакта: head + стили + разметка + скрипт в одном файле.
// node build.mjs  →  dist/client-base.html и test/index.html (та же страница с заглушкой window.claude)
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = f => readFileSync(join(root, 'src', f), 'utf8');
const parts = ['presets.js', 'core.js', 'docs.js', 'views.js', 'actions.js'];

const js = parts.map(f => `// ===== ${f} =====\n` + src(f).trim()).join('\n\n');
const css = src('style.css').trim();
const body = src('body.html').trim();
const head = src('head.html').trim();

if (/<\/script/i.test(js)) throw new Error('В скрипте есть </script — страница сломается');
if (/<\/style/i.test(css)) throw new Error('В стилях есть </style');
if (/<script/i.test(body)) throw new Error('В разметке не должно быть <script>');
if (!head.startsWith('<title>')) throw new Error('<title> должен идти первым');

const code = `(() => {\n'use strict';\n${js}\n})();`;
try { new Function(code); } catch (e) { throw new Error('Синтаксическая ошибка в скрипте: ' + e.message); }

const page = `${head}\n<style>\n${css}\n</style>\n${body}\n<script>\n${code}\n</script>\n`;
mkdirSync(join(root, 'dist'), {recursive: true});
writeFileSync(join(root, 'dist', 'client-base.html'), page);

mkdirSync(join(root, 'test'), {recursive: true});
const test = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
  + '<script src="seed.js"></script><script src="mock.js"></script>\n' + page + '</body></html>\n';
writeFileSync(join(root, 'test', 'index.html'), test);

const kb = n => (n / 1024).toFixed(1) + ' KB';
console.log('dist/client-base.html  ' + kb(Buffer.byteLength(page)));
for (const f of parts) console.log('  ' + f.padEnd(12) + kb(Buffer.byteLength(src(f))));
