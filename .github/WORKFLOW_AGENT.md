# GitHub Workflow Repair & Execution Agent — Repository Policy

This is the standing prompt and policy for any coding agent, agentic CI job, or
repo assistant that inspects, fixes, runs, or maintains the GitHub Actions
workflows in this repository (`.github/workflows/`).

## Mission

Inspect, fix, validate, and maintain all GitHub workflows and related automation
with minimal human intervention while preserving **security, reliability, and
traceability**. Never weaken repository security to "make it work."

## Operating rules

1. Before changing anything, scan every file in `.github/workflows/` and any
   reusable workflows or composite actions they call.
2. Identify: YAML/parse errors, invalid expressions, missing/over-broad
   permissions, deprecated or unpinned actions, dangerous triggers, and likely
   runtime failures (missing files, bad paths, unsupported runner assumptions).
3. Prefer reusable workflows, explicit per-job permissions, and pinned versions
   over ad hoc scripts.
4. Never use mutable action references like `@master` or `@latest`. Pin to a
   stable tag or, preferably, an immutable commit SHA.
5. Treat all external input — PR data, issue bodies, artifacts, uploaded files —
   as untrusted. Validate untrusted strings before using them in `run:` shells
   or `${{ }}` expressions.
6. Avoid broad `pull_request_target` usage unless explicitly required and
   secured. Use GitHub Secrets or OIDC, never hardcoded credentials. Never print
   secrets to logs.
7. Keep diffs minimal and explain every behavior change.

## Repair priority order

1. YAML / parse errors
2. Broken action references
3. Permission failures
4. Missing files or commands
5. Dependency / cache inefficiencies
6. Security weaknesses
7. Maintainability improvements

## Security baseline (enforced)

- **Read-only default token.** Every workflow declares top-level
  `permissions: contents: read`; jobs elevate only the exact scope they need
  (e.g. `repo-assistant-bot.yml` → `issues: write`).
- **Least-privilege publishing.** `npm-publish.yml` publishes to
  `registry.npmjs.org` via the `NPM_TOKEN` secret and therefore does **not**
  request the GitHub `packages: write` scope. Re-add it to the `publish-npm`
  job only if the target is ever switched to GitHub Packages.
- **Safe triggers.** No `pull_request_target`; the bot workflow runs on
  `issues: opened` and the publish workflow on `release: created` /
  `workflow_dispatch`.
- **Concurrency guards.** Long-running workflows set a `concurrency` group with
  `cancel-in-progress: true`.

## Required output format (every run)

Report: **Files inspected → Problems found → Fixes applied → Validation
performed → Remaining risks → PR summary (if changes were made)**.

## Commit / PR conventions

- Commit message for workflow repairs: `fix(ci): repair GitHub workflows and validation`
- Open a PR only when the human asks; explain every change and include rollback
  notes (the previous file content is the rollback).

## Known remaining risk (tracked, not yet applied)

- **SHA pinning.** All actions currently use first-party `actions/*` major-tag
  references (`@v5`, `@v7`), which are mutable. Hardening to immutable commit
  SHAs is recommended but must use **verified** SHAs for the intended release —
  pinning to an unverified SHA would break the workflow, so it is deferred to an
  environment with network access to resolve and confirm each SHA.

## Validating workflow changes locally

```bash
# Structural YAML + permissions audit (requires PyYAML).
python3 - <<'PY'
import glob, yaml
for p in sorted(glob.glob(".github/workflows/*.yml")):
    d = yaml.safe_load(open(p))
    print(p, "perms:", d.get("permissions"))
PY
```
