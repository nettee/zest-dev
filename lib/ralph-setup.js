const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getSpec } = require('./spec-manager');

const FINAL_RALPH_TASK = 'Make sure all tasks are done in ralph loops, and then create PR. If there is a related issue, make sure to link it in the PR.';
const DFU_RALPH_TASK = 'If the spec has Deferred Follow-Ups (DFU), create one GitHub issue for each DFU item and link those issues in the PR.';
const RALPH_TASK_PROMPT = 'Use the Zest Dev skill to implement the active planned Spec.';

function findSection(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingPattern = new RegExp(`^${escapedHeading}\\s*$`, 'm');
  const match = headingPattern.exec(content);

  if (!match) {
    return null;
  }

  const bodyStart = match.index + match[0].length;
  const level = heading.match(/^#+/)[0].length;
  const nextHeadingPattern = new RegExp(`^#{1,${level}}\\s+`, 'm');
  const rest = content.slice(bodyStart);
  const nextMatch = nextHeadingPattern.exec(rest);

  return nextMatch ? rest.slice(0, nextMatch.index) : rest;
}

function parseProgressTasks(specContent) {
  const progress = findSection(specContent, '## Progress');

  if (progress === null) {
    throw new Error('Active spec is missing ## Progress');
  }

  const tasks = [];
  let sawCheckbox = false;
  let stoppedAtHitl = false;
  let progressMode = null;

  for (const line of progress.split(/\r?\n/)) {
    if (line.trim() === '') {
      continue;
    }

    const match = line.match(/^- \[([ xX])\] (.+)$/);
    if (!match) {
      throw new Error(`Unsupported Progress line: ${line}`);
    }

    sawCheckbox = true;
    const marker = match[1].toLowerCase();
    const taskText = match[2];
    const ticketMatch = taskText.match(/^Ticket \d+(?: \((AFK|HITL)\))?: .+$/);

    if (!ticketMatch) {
      throw new Error(`Unsupported Progress line: ${line}`);
    }

    const lineMode = ticketMatch[1] ? 'annotated' : 'plain';
    if (progressMode === null) {
      progressMode = lineMode;
    } else if (progressMode !== lineMode) {
      throw new Error(`Unsupported Progress line: ${line}`);
    }

    if (stoppedAtHitl) {
      continue;
    }

    if (ticketMatch[1] === 'HITL') {
      stoppedAtHitl = true;
      continue;
    }

    if (marker === ' ') {
      tasks.push(taskText);
    }
  }

  if (!sawCheckbox) {
    throw new Error('Active spec Progress section has no checkbox items');
  }

  if (tasks.length === 0) {
    throw new Error('Active spec Progress section has no unfinished checkbox items');
  }

  return tasks;
}

function runRalphAddTask(task, cwd) {
  const result = spawnSync('ralph', ['--add-task', task], {
    cwd,
    encoding: 'utf-8'
  });

  if (result.error) {
    throw new Error(`Failed to run ralph --add-task: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`ralph --add-task failed for "${task}"${details ? `:\n${details}` : ''}`);
  }

  return {
    task,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}

function setupRalphFromActiveSpec(cwd = process.cwd()) {
  const spec = getSpec('active');
  const specContent = fs.readFileSync(spec.path, 'utf-8');
  const progressTasks = parseProgressTasks(specContent);
  const tasks = [...progressTasks, DFU_RALPH_TASK, FINAL_RALPH_TASK];
  const ralphDir = path.join(cwd, '.ralph');

  fs.rmSync(ralphDir, { recursive: true, force: true });

  tasks.forEach(task => {
    runRalphAddTask(task, cwd);
  });
  const taskPath = path.join(cwd, 'task.md');
  fs.writeFileSync(taskPath, `${RALPH_TASK_PROMPT}\n`, 'utf-8');

  return {
    ok: true,
    spec: {
      id: spec.id,
      path: spec.path
    },
    tasks_added: tasks,
    task_md: {
      path: 'task.md',
      content: `${RALPH_TASK_PROMPT}\n`
    }
  };
}

module.exports = {
  DFU_RALPH_TASK,
  FINAL_RALPH_TASK,
  parseProgressTasks,
  setupRalphFromActiveSpec
};
