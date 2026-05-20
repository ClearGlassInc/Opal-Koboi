import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createOperationPlan, defaultMission, formatPlan, runOperation, EnterpriseAutomationPlatform } from '../src/index.js';

const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const cleanArgs = args.filter((item) => item !== '--json');
const command = cleanArgs[0] || 'help';
const inputPath = cleanArgs[1];
const platform = new EnterpriseAutomationPlatform();

function helpText() {
  return [
    'Opal-Koboi Enterprise Automation Platform',
    '',
    'Commands:',
    '  status                  Show runtime status',
    '  dashboard [file.json]    Show enterprise dashboard summary',
    '  plan [file.json]         Build an operation plan',
    '  run [file.json]          Build and execute the next-action simulation',
    '  orchestrate [file.json]  Run a workflow file through the platform engine',
    '  --json dashboard         Print machine-readable JSON',
    '',
    'Examples:',
    '  node bin/opal-koboi.js dashboard examples/mission.json',
    '  node bin/opal-koboi.js orchestrate examples/workflow.json'
  ].join('\n');
}

function loadJson(path, fallback) {
  if (!path) return fallback;
  const absolute = resolve(process.cwd(), path);
  if (!existsSync(absolute)) throw new Error('Input file not found: ' + absolute);
  return JSON.parse(readFileSync(absolute, 'utf8'));
}

function print(value, fallbackText) {
  console.log(outputJson ? JSON.stringify(value, null, 2) : fallbackText);
}

try {
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(helpText());
  } else if (command === 'version' || command === '--version' || command === '-v') {
    console.log('2.1.0');
  } else if (command === 'status') {
    const plan = createOperationPlan(loadJson(inputPath, defaultMission));
    const status = {
      ok: true,
      program: 'opal-koboi',
      version: '2.1.0',
      posture: plan.summary.posture,
      tasks: plan.summary.totalTasks,
      nextAction: plan.nextAction ? plan.nextAction.title : null
    };
    print(status, 'Opal-Koboi online. Posture: ' + status.posture + '. Tasks: ' + status.tasks + '.');
  } else if (command === 'dashboard') {
    const dashboard = platform.dashboard(loadJson(inputPath, defaultMission));
    print(dashboard, 'Opal-Koboi dashboard: health=' + dashboard.health + ', posture=' + dashboard.plan.posture + ', tasks=' + dashboard.plan.totalTasks + '.');
  } else if (command === 'plan') {
    const plan = createOperationPlan(loadJson(inputPath, defaultMission));
    print(plan, formatPlan(plan));
  } else if (command === 'run') {
    const result = runOperation(loadJson(inputPath, defaultMission));
    print(result, formatPlan(result.plan) + '\n\n' + result.message);
  } else if (command === 'orchestrate') {
    const workflow = loadJson(inputPath, { name: 'Default Workflow', steps: [{ type: 'plan', name: 'Default Plan', input: defaultMission }] });
    const result = platform.run(workflow);
    print(result, 'Workflow ' + result.name + ' completed. ok=' + result.ok + ', steps=' + result.results.length + '.');
  } else {
    throw new Error('Unknown command: ' + command);
  }
} catch (error) {
  console.error('Opal-Koboi error: ' + error.message);
  process.exitCode = 1;
}
