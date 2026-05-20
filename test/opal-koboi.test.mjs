import assert from 'node:assert/strict';
import { createOperationPlan, runOperation, scoreTask, classifyPriority } from '../src/index.js';

const task = {
  title: 'Deploy ClearGlass automation layer',
  impact: 90,
  urgency: 80,
  confidence: 85,
  effort: 20,
  owner: 'ClearGlass Inc.'
};

assert.equal(classifyPriority(85), 'critical');
assert.equal(classifyPriority(70), 'high');
assert.equal(classifyPriority(50), 'medium');
assert.equal(classifyPriority(20), 'low');
assert.equal(scoreTask(task) >= 80, true);

const plan = createOperationPlan({ mission: 'Test mission', tasks: [task] });
assert.equal(plan.mission, 'Test mission');
assert.equal(plan.summary.totalTasks, 1);
assert.equal(plan.nextAction.title, task.title);
assert.equal(plan.tasks[0].priority, 'critical');

const result = runOperation({ mission: 'Runtime mission', tasks: [task] });
assert.equal(result.ok, true);
assert.equal(result.program, 'opal-koboi');
assert.equal(result.message.includes('Deploy ClearGlass automation layer'), true);

console.log('Opal-Koboi runtime tests passed.');
