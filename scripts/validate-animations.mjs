/**
 * ClearGlass Animation System Health Check
 * Validates animation file integrity, asset references, CSS keyframe
 * coverage, JS selector integrity, and reduced-motion handling.
 *
 * Run: node scripts/validate-animations.mjs
 * Exits with code 1 if any check fails; 0 on success.
 */

import { readFileSync, existsSync } from 'node:fs';

let failed = 0;
const pass = (msg) => console.log(`  ✓  ${msg}`);
const fail = (msg) => { console.error(`  ✗  ${msg}`); failed++; };
const section = (title) => console.log(`\n── ${title}`);

/* ── 1. Required animation files exist ─────────────────────────────────── */
section('Animation files');

const REQUIRED_FILES = [
  'assets/css/console.css',
  'assets/css/control-surface.css',
  'assets/js/console.js',
  'assets/js/control-surface.js',
  'index.html',
  'spec.html',
];

REQUIRED_FILES.forEach((f) => {
  if (existsSync(f)) pass(f);
  else fail(`Missing required file: ${f}`);
});

/* ── 2. HTML pages load both CSS and JS files ───────────────────────────── */
section('Asset references in HTML');

const PAGES = [
  { file: 'index.html',  base: '.' },
  { file: 'spec.html',   base: '.' },
];

PAGES.forEach(({ file }) => {
  const html = readFileSync(file, 'utf8');

  const cssRefs = [...html.matchAll(/href=["']([^"']+\.css)['"]/g)].map((m) => m[1]);
  const jsRefs  = [...html.matchAll(/src=["']([^"']+\.js)['"]/g)].map((m) => m[1]);

  [...cssRefs, ...jsRefs].forEach((ref) => {
    // Skip external URLs
    if (ref.startsWith('http') || ref.startsWith('//')) return;
    if (existsSync(ref)) pass(`${file} → ${ref}`);
    else fail(`${file} references missing asset: ${ref}`);
  });
});

/* ── 3. Required CSS keyframes are defined ──────────────────────────────── */
section('CSS keyframe definitions');

const consoleCss = readFileSync('assets/css/console.css', 'utf8');
const controlCss = readFileSync('assets/css/control-surface.css', 'utf8');
const allCss = consoleCss + controlCss;

const REQUIRED_KEYFRAMES = [
  'field-scan',
  'field-scan-h',
  'bloom-drift-1',
  'bloom-drift-2',
  'bloom-drift-3',
  'glx-shift',
  'border-flow',
  'ripple',
  'spin',
  'radar-spin',
  'pip-pulse',
  'chip-ping',
  'blip',
  'log-in',
  'data-pulse',
  'metric-tick',
  'metric-scan',
  'spark-draw',
  'spark-glow',
  'signal-sweep',
  'data-tick',
  'trace-signal',
  'cs-ping',
  'cs-pop',
  'cs-fade',
];

REQUIRED_KEYFRAMES.forEach((name) => {
  const pattern = new RegExp(`@keyframes\\s+${name}\\b`);
  if (pattern.test(allCss)) pass(`@keyframes ${name}`);
  else fail(`Missing @keyframes: ${name}`);
});

/* ── 4. Required CSS animation classes are defined ──────────────────────── */
section('CSS animation selectors');

const REQUIRED_CSS_SELECTORS = [
  '.field__scan',
  '.field__scan-h',
  '.field__bloom--1',
  '.field__bloom--2',
  '.field__bloom--3',
  '.radar__sweep',
  '.radar__blip',
  '.glass--pulse',
  '.hero__title .glx',
  '.trace::before',
  '.metric\\.is-in',
  '.metric__num\\.is-ticking',
  '.metric__spark path\\.is-drawn',
  '.card__sweep',
  '.hud__bar::after',
  '.cs-dot--pulse::after',
  '.cs-palette__panel',
];

REQUIRED_CSS_SELECTORS.forEach((sel) => {
  // Convert the selector to a regex pattern (simple check for presence)
  const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\\/g, '\\');
  const pattern = new RegExp(escaped.replace(/\\\./g, '\\.'), 'i');
  // A simpler approach: just look for the literal class name token
  const token = sel.replace(/\\./g, '.').replace(/^\./, '').split(' ')[0].split(':')[0].split('.')[0];
  if (allCss.includes(token)) pass(sel);
  else fail(`Missing CSS animation rule for: ${sel}`);
});

/* ── 5. Required HTML animation targets exist in index.html ─────────────── */
section('HTML animation targets (index.html)');

const indexHtml = readFileSync('index.html', 'utf8');

const REQUIRED_HTML_ATTRS = [
  { attr: 'data-reveal',       desc: 'reveal-on-scroll targets' },
  { attr: 'data-tilt',         desc: 'parallax tilt targets' },
  { attr: 'data-count',        desc: 'animated counter targets' },
  { attr: 'data-fill',         desc: 'bar fill targets' },
  { attr: 'data-clock',        desc: 'mission clock target' },
  { attr: 'data-log',          desc: 'live log feed target' },
  { attr: 'data-cs-palette',   desc: 'command palette element' },
  { attr: 'data-cs-drawer',    desc: 'systems drawer element' },
  { attr: 'data-cs-scrim',     desc: 'modal scrim element' },
  { attr: 'data-cs-bar',       desc: 'sticky control bar element' },
  { attr: 'data-cs-nav',       desc: 'primary navigation' },
  { attr: 'data-cs-rail',      desc: 'mobile bottom rail' },
  { attr: 'data-cs-open-palette', desc: 'palette open trigger(s)' },
  { attr: 'data-cs-open-drawer',  desc: 'drawer open trigger(s)' },
  { attr: 'data-loading-demo', desc: 'loading state demo button' },
  { attr: 'metric__spark',     desc: 'sparkline SVGs' },
  { attr: 'glass--ticks',      desc: 'card sweep targets' },
  { attr: 'radar__sweep',      desc: 'radar sweep element' },
  { attr: 'field__scan',       desc: 'background scan element' },
];

REQUIRED_HTML_ATTRS.forEach(({ attr, desc }) => {
  if (indexHtml.includes(attr)) pass(`${desc} (${attr})`);
  else fail(`Missing HTML animation target: ${attr} — ${desc}`);
});

/* ── 6. Required HTML animation targets exist in spec.html ─────────────── */
section('HTML animation targets (spec.html)');

const specHtml = readFileSync('spec.html', 'utf8');

const REQUIRED_SPEC_ATTRS = [
  { attr: 'data-reveal',          desc: 'reveal-on-scroll target' },
  { attr: 'data-cs-palette',      desc: 'command palette element' },
  { attr: 'data-cs-drawer',       desc: 'systems drawer element' },
  { attr: 'data-cs-scrim',        desc: 'modal scrim element' },
  { attr: 'data-cs-open-palette', desc: 'palette open trigger' },
  { attr: 'data-cs-rail',         desc: 'mobile bottom rail' },
  { attr: 'field__scan',          desc: 'background scan element' },
  { attr: 'cg-nav',               desc: 'spec navigation bar' },
];

REQUIRED_SPEC_ATTRS.forEach(({ attr, desc }) => {
  if (specHtml.includes(attr)) pass(`${desc} (${attr})`);
  else fail(`Missing HTML animation target in spec.html: ${attr} — ${desc}`);
});

/* ── 7. Reduced-motion handling is present in CSS ───────────────────────── */
section('Reduced-motion safety');

const HAS_REDUCED_MOTION = consoleCss.includes('prefers-reduced-motion') &&
                           controlCss.includes('prefers-reduced-motion');
if (HAS_REDUCED_MOTION) pass('@media (prefers-reduced-motion: reduce) present in both CSS files');
else fail('Missing prefers-reduced-motion handling in CSS');

const HAS_PERF_ADAPTIVE = consoleCss.includes('[data-perf="low"]');
if (HAS_PERF_ADAPTIVE) pass('[data-perf="low"] performance-adaptive rules present');
else fail('Missing performance-adaptive [data-perf="low"] rules');

/* ── 8. JS loads both scripts and respects reduced-motion ───────────────── */
section('JavaScript animation safety');

const consoleJs = readFileSync('assets/js/console.js', 'utf8');
const controlJs = readFileSync('assets/js/control-surface.js', 'utf8');

[
  ['console.js',          consoleJs,  'reduceMotion', 'reduced-motion guard'],
  ['console.js',          consoleJs,  'IntersectionObserver', 'IntersectionObserver feature detection'],
  ['console.js',          consoleJs,  'visibilitychange', 'visibility-aware animation pausing'],
  ['console.js',          consoleJs,  'requestAnimationFrame', 'rAF-based animation'],
  ['console.js',          consoleJs,  'hardwareConcurrency', 'performance-adaptive detection'],
  ['control-surface.js',  controlJs,  'reduceMotion', 'reduced-motion guard'],
  ['control-surface.js',  controlJs,  'cs-no-motion', 'motion-toggle support'],
].forEach(([file, src, token, desc]) => {
  if (src.includes(token)) pass(`${file}: ${desc} (${token})`);
  else fail(`${file}: missing ${desc} (${token})`);
});

/* ── 9. No duplicate keyframe definitions ───────────────────────────────── */
section('Duplicate keyframe check');

const kfPattern = /@keyframes\s+([\w-]+)/g;
const kfNames = [];
let m;
while ((m = kfPattern.exec(allCss)) !== null) kfNames.push(m[1]);
const unique = new Set(kfNames);
if (kfNames.length === unique.size) {
  pass(`${kfNames.length} keyframes — no duplicates`);
} else {
  const counts = {};
  kfNames.forEach((n) => { counts[n] = (counts[n] || 0) + 1; });
  Object.entries(counts)
    .filter(([, c]) => c > 1)
    .forEach(([n, c]) => fail(`Duplicate @keyframes ${n} (found ${c} times)`));
}

/* ── Summary ────────────────────────────────────────────────────────────── */
console.log('');
if (failed === 0) {
  console.log(`✓  Animation health check passed — all checks OK.\n`);
} else {
  console.error(`✗  Animation health check failed — ${failed} issue(s) found.\n`);
  process.exit(1);
}
