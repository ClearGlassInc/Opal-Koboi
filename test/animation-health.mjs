/**
 * ClearGlass Animation Health Check
 * Static analysis of animation assets, CSS/JS references, and keyframe
 * definitions across all production HTML pages. No browser required.
 *
 * Run: node test/animation-health.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ── Production pages (source paths, not _site) ─────────────────────────────
const PAGES = [
  'index.html',
  'spec.html',
  'nexus-omega-enhanced.html',
  'docs/clearglass-nexus-v10.1-prometheus.html',
];

// ── Animation keyframes that must be defined in the shared CSS ──────────────
const REQUIRED_KEYFRAMES = [
  'field-scan', 'field-scan-h', 'border-flow', 'ripple', 'spin',
  'radar-spin', 'pip-pulse', 'chip-ping', 'blip', 'log-in',
  'data-pulse', 'spark-draw', 'spark-glow', 'signal-sweep', 'data-tick',
  'bloom-drift-1', 'bloom-drift-2', 'bloom-drift-3', 'metric-scan',
  'cs-ping', 'cs-pop', 'cs-fade',
];

// ── JS API tokens that must be present in the shared JS ────────────────────
const REQUIRED_JS_APIS = [
  'IntersectionObserver', 'requestAnimationFrame', 'data-reveal',
  'data-count', 'data-tilt', 'data-log', 'prefers-reduced-motion',
  'animationPlayState', 'data-perf',
];

// ── Utility ─────────────────────────────────────────────────────────────────
function extractAttrRefs(html, attr) {
  const re = new RegExp(`${attr}="([^"]+)"`, 'g');
  const refs = [];
  let m;
  while ((m = re.exec(html)) !== null) refs.push(m[1]);
  return refs;
}

let passed = 0, failed = 0;

function ok(label) { console.log(`  PASS  ${label}`); passed++; }
function fail(label) { console.error(`  FAIL  ${label}`); failed++; }
function section(title) { console.log(`\n── ${title}`); }

// ── 1. Verify each page exists ───────────────────────────────────────────────
section('Page existence');
for (const page of PAGES) {
  const p = join(ROOT, page);
  if (existsSync(p)) ok(page);
  else fail(`${page} — file not found`);
}

// ── 2. For each page: verify CSS + JS references resolve ────────────────────
section('Asset references');
for (const page of PAGES) {
  const p = join(ROOT, page);
  if (!existsSync(p)) continue;
  const html = readFileSync(p, 'utf8');
  const base = dirname(p);

  // CSS <link href="...">
  const cssRefs = extractAttrRefs(html, 'href').filter(h =>
    h.endsWith('.css') && !h.startsWith('http') && !h.startsWith('//')
  );
  for (const ref of cssRefs) {
    const abs = resolve(base, ref);
    if (existsSync(abs)) ok(`${page} → ${ref}`);
    else fail(`${page} → ${ref} — CSS file not found`);
  }

  // JS <script src="...">
  const jsRefs = extractAttrRefs(html, 'src').filter(s =>
    s.endsWith('.js') && !s.startsWith('http') && !s.startsWith('//')
  );
  for (const ref of jsRefs) {
    const abs = resolve(base, ref);
    if (existsSync(abs)) ok(`${page} → ${ref}`);
    else fail(`${page} → ${ref} — JS file not found`);
  }
}

// ── 3. Verify required keyframes in shared CSS ───────────────────────────────
section('Required CSS keyframes (console.css)');
const consoleCss = readFileSync(join(ROOT, 'assets/css/console.css'), 'utf8');
const controlCss = readFileSync(join(ROOT, 'assets/css/control-surface.css'), 'utf8');
const combinedCss = consoleCss + controlCss;

for (const kf of REQUIRED_KEYFRAMES) {
  if (combinedCss.includes(`@keyframes ${kf}`)) ok(`@keyframes ${kf}`);
  else fail(`@keyframes ${kf} — not found in shared CSS`);
}

// ── 4. Verify required JS APIs/tokens in shared JS ──────────────────────────
section('Required JS tokens (console.js + control-surface.js)');
const consoleJs = readFileSync(join(ROOT, 'assets/js/console.js'), 'utf8');
const controlJs = readFileSync(join(ROOT, 'assets/js/control-surface.js'), 'utf8');
const combinedJs = consoleJs + controlJs;

for (const token of REQUIRED_JS_APIS) {
  if (combinedJs.includes(token)) ok(token);
  else fail(`${token} — not found in shared JS`);
}

// ── 5. Verify data-reveal wire-up on main pages ──────────────────────────────
section('data-reveal wiring on shared-system pages');
for (const page of ['index.html', 'spec.html']) {
  const p = join(ROOT, page);
  if (!existsSync(p)) continue;
  const html = readFileSync(p, 'utf8');
  if (html.includes('data-reveal')) ok(`${page} has data-reveal elements`);
  else fail(`${page} — no data-reveal elements found`);
}

// ── 6. Verify data-perf adaptive CSS is present ──────────────────────────────
section('Performance adaptive CSS');
if (consoleCss.includes('[data-perf="low"]')) ok('[data-perf="low"] rules present in console.css');
else fail('[data-perf="low"] adaptive CSS rules not found');

// ── 7. Verify reduced-motion support ─────────────────────────────────────────
section('Reduced-motion support');
if (consoleCss.includes('prefers-reduced-motion')) ok('prefers-reduced-motion in console.css');
else fail('prefers-reduced-motion missing from console.css');
if (controlCss.includes('prefers-reduced-motion')) ok('prefers-reduced-motion in control-surface.css');
else fail('prefers-reduced-motion missing from control-surface.css');

// ── 8. Verify deployment config covers all shared pages ──────────────────────
section('Deployment config (pages.yml)');
const pagesYml = join(ROOT, '.github/workflows/pages.yml');
if (existsSync(pagesYml)) {
  const yml = readFileSync(pagesYml, 'utf8');
  const deployedPages = ['index.html', 'spec.html', 'nexus-omega-enhanced.html'];
  for (const p of deployedPages) {
    if (yml.includes(p)) ok(`pages.yml deploys ${p}`);
    else fail(`pages.yml — missing deployment of ${p}`);
  }
  if (yml.includes('cp -r assets')) ok('pages.yml deploys assets/ directory');
  else fail('pages.yml — assets/ not deployed');
} else {
  fail('pages.yml not found');
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Animation health check: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('One or more animation health checks failed.');
  process.exit(1);
} else {
  console.log('All animation health checks passed.');
}
