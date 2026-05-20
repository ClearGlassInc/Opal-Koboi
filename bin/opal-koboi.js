import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createOperationPlan, defaultMission, formatPlan, runOperation } from '../src/index.js';

const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const cleanArgs = args.filter((item) => item !== '--json');
const command = cleanArgs[0] || 'help';
const missionPath = cleanArgs[1];

function helpText() {
  return [
    'Opal-Koboi CLI',
    '',
    'Commands:',
    '  status              Show runtime status',
    '  plan [file.json]    Build an operation plan',
    '  run [file.json]     Build and execute the next-action simulation',
    '  --json plan         Print machine-readable JSON'
  ].join('\n');
}

function loadInput(path) {
  if (!path) return defaultMission;
  const absolute = resolve(process.cwd(), path);
  if (!existsSync(absolute)) throw new Error('Mission file not found: ' + absolute);
  return JSON.parse(readFileSync(absolute, 'utf8'));
}

try {
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(helpText());
  } else if (command === 'version' || command === '--version' || command === '-v') {
    console.log('2.0.0');
  } else if (command === 'status') {
    const plan = createOperationPlan(loadInput(missionPath));
    const status = {
      ok: true,
      program: 'opal-koboi',
      version: '2.0.0',
      posture: plan.summary.posture,
      tasks: plan.summary.totalTasks,
      nextAction: plan.nextAction ? plan.nextAction.title : null
    };
    console.log(outputJson ? JSON.stringify(status, null, 2) : 'Opal-Koboi online. Posture: ' + status.posture + '. Tasks: ' + status.tasks + '.');
  } else if (command === 'plan') {
    const plan = createOperationPlan(loadInput(missionPath));
    console.log(outputJson ? JSON.stringify(plan, null, 2) : formatPlan(plan));
  } else if (command === 'run') {
    const result = runOperation(loadInput(missionPath));
    console.log(outputJson ? JSON.stringify(result, null, 2) : formatPlan(result.plan) + '\n\n' + result.message);
  } else {
    throw new Error('Unknown command: ' + command);
  }
} catch (error) {
  console.error('Opal-Koboi error: ' + error.message);
  process.exitCode = 1;
}
