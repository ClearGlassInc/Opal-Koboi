import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const requiredFields = ['name', 'version', 'description', 'license', 'scripts'];
const missingFields = requiredFields.filter((field) => !pkg[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required package fields: ${missingFields.join(', ')}`);
}

if (!pkg.name.startsWith('@clearglassinc/')) {
  throw new Error('Package name must use the @clearglassinc npm scope.');
}

if (!/^\d+\.\d+\.\d+/.test(pkg.version)) {
  throw new Error('Package version must follow semantic versioning, for example 2.0.0.');
}

if (!existsSync('README.md')) {
  throw new Error('README.md is required before package publishing.');
}

const readme = readFileSync('README.md', 'utf8');
if (!readme.includes('CLEARGLASSINC')) {
  throw new Error('README.md must identify the ClearGlass Inc. project.');
}

console.log(`Package validation passed for ${pkg.name}@${pkg.version}.`);
