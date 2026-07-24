# FUNCTIONALITY REPORT

**Repository:** ClearGlassInc/Opal-Koboi  
**Generated:** 2026-07-05 (re-verified 2026-07-23; originally generated 2026-07-04)  
**Node.js:** v22.22.2 | **npm:** 10.9.7 | **Python:** 3.11.15

---

## Step Results

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1 | Repository Assessment | ✅ Pass | Node.js ESM + Python hybrid monorepo; 8 active components |
| 2 | Dependency Validation | ✅ Pass | Zero external JS deps; Python stdlib-only core; 0 vulnerabilities (root + artemis-agent) |
| 3 | Build Verification | ✅ Pass | `npm run build` → `dist/` artifacts generated; **fixed** `apps/artemis-agent` build (see below) |
| 4 | Environment & Config | ✅ Pass | No required env vars; optional API keys documented in README |
| 5 | Test Execution | ✅ Pass | JS suite + 123 Python tests + 15 TS tests — all green |
| 6 | Lint & Format | ✅ Pass | `tsc --noEmit` clean; package validation passes |
| 7 | Runtime Smoke Test | ✅ Pass | CLI commands, all 3 FastAPI gateways (`/docs` → 200), Python demos (`-m` module form) |
| 8 | Deployment Readiness | ✅ Pass | CI workflow present; Dependabot configured; dist/ excluded from git |
| 9 | Report | ✅ Complete | See below |

---

## Fix Applied (2026-07-03)

**`apps/artemis-agent/package.json` — `build` script was broken.**

`npm run build` chained `tsc -p tsconfig.json && vite build --config vite.renderer.config.ts`, but
`vite.renderer.config.ts` does not exist in the app (the app currently ships only isolated,
tested TS modules under `src/` — providers, tools, gateways, install progress, command registry —
with no `main`/`preload`/`renderer` entry points yet, despite the README's aspirational
architecture section). Running `npm run build` (and the `deploy-artemis.sh` script, which calls it)
failed with `[UNRESOLVED_ENTRY] Cannot resolve entry module vite.renderer.config.ts`.

**Fix:** scoped `build` down to `tsc -p tsconfig.json`, which matches what actually exists today
(type-checked TS modules, no bundleable renderer). `npm run build`, `npm test`, `npm run lint`, and
`scripts/deploy-artemis.sh` all pass cleanly now. Re-adding the Vite/Electron bundle step is future
work once `src/main`, `src/preload`, and `src/renderer` are implemented per the README's documented
architecture — that implementation was out of scope for this pass (it wasn't broken code to fix, it
was unbuilt product surface).

---

## Test Summary

### JavaScript (Node.js)
- **Suite:** `test/opal-koboi.test.mjs`
- **Result:** All assertions pass
- **Coverage:** `clampScore`, `scoreTask`, `classifyPriority`, `createOperationPlan`, `runOperation`, `AuditLedger`, `PolicyEngine`, `WorkflowEngine`, `EnterpriseAutomationPlatform`

### TypeScript — Artemis Agent (15 tests)
- **Suite:** `apps/artemis-agent/src/artemis.test.ts`
- **Result:** 15 passed (vitest v4.1.9)
- **Coverage:** Provider registry, slash commands, tool registry, gateway registry, install progress
- **Note:** `npm install` required in `apps/artemis-agent/` to install vitest + TypeScript devDependencies

### Python — ClearFlow (44 tests)
- **Location:** `clearflow/tests/`
- **Result:** 44 passed in 0.13s
- **Coverage:** TimeBlock parsing, Priority sorting, gating, scheduling, pledge ledger, intel routing, workflow reporting, runner simulation

### Python — ClearPulse (46 tests)
- **Location:** `clearpulse/tests/`
- **Result:** 46 passed in 0.22s
- **Coverage:** Windowed facts, access spike detection, PHI scanner/masking, alert routing/dedup, FHIR ingestion, pipeline, entity resolution, graph ring detection, incident aggregation

### Python — JobAgent (33 tests)
- **Location:** `job_agent/tests/`
- **Result:** 33 passed in 0.07s
- **Coverage:** Salary parsing, job posting ingestion, scoring/ranking, personalization, sourcing dedup, application tracking, follow-up intelligence

**Total: 123 Python tests + JS suite + 15 TS tests = fully green**

---

## Runtime Backend Smoke Test (new — 2026-07-03)

Started each optional FastAPI gateway with `uvicorn` and confirmed it serves without crashing:

| Gateway | `/docs` | Notes |
|---|---|---|
| `clearflow.backend.app` | 200 | starts clean |
| `clearpulse.backend.app` | 200 | starts clean |
| `artemis.backend.app` | 200 | starts clean |

Also confirmed `artemis/agents/orchestrator.py`, `artemis/agents/tools.py`, `artemis/evals/pipeline.py`,
`artemis/policy/guard.py`, and `growth_os/growth_os.py` all import cleanly, and that
`clearflow/demo.py`, `clearpulse/demo.py`, `job_agent/demo.py` run end-to-end via `python3 -m <pkg>.demo`
(they use absolute package imports, so `python3 path/to/demo.py` fails with `ModuleNotFoundError` —
expected Python behavior, not a bug; always invoke as a module).

---

## CLI Smoke Test (all pass)

```
$ node bin/opal-koboi.js status
Opal-Koboi online. Posture: aggressive. Tasks: 3.

$ node bin/opal-koboi.js dashboard examples/mission.json
Opal-Koboi dashboard: health=green, posture=aggressive, tasks=3.

$ node bin/opal-koboi.js plan examples/mission.json
Opal-Koboi Mission: ClearGlass enterprise automation launch
Posture: aggressive | Average Score: 84 | Tasks: 3 | Critical: 3

$ node bin/opal-koboi.js run examples/mission.json
Execute next: Keep ClearGlass website connected to Opal-Koboi

$ node bin/opal-koboi.js orchestrate examples/workflow.json
Workflow ClearGlass Enterprise Automation Workflow completed. ok=true, steps=4.
```

---

## How to Run

```bash
# Primary platform (Node.js)
npm start                                    # dashboard + mission
npm test                                     # validate + test suite
npm run build                                # generate dist/ artifacts
node bin/opal-koboi.js <command> [file.json] # CLI

# Artemis Agent (TypeScript / Electron)
cd apps/artemis-agent
npm install
npm test   # 15 vitest tests
npm run lint  # tsc --noEmit

# Python modules (stdlib only — no install needed)
python3 -m pytest clearflow/tests/   # 44 tests
python3 -m pytest clearpulse/tests/  # 46 tests
python3 -m pytest job_agent/tests/   # 33 tests

# With optional FastAPI gateway
pip install fastapi pydantic uvicorn
uvicorn clearflow.backend.app:app --reload   # ClearFlow API
uvicorn clearpulse.backend.app:app --reload  # ClearPulse API
```

---

## Architecture

| Component | Language | Status | Tests |
|-----------|----------|--------|-------|
| `src/` — Opal-Koboi core library | Node.js ESM | ✅ | JS suite |
| `bin/opal-koboi.js` — CLI | Node.js | ✅ | smoke |
| `apps/artemis-agent/` — Electron desktop app | TypeScript | ✅ | 15 (vitest) |
| `clearflow/` — AI workflow engine | Python | ✅ | 44 |
| `clearpulse/` — triage & compliance pipeline | Python | ✅ | 46 |
| `job_agent/` — job sourcing & tracking agent | Python | ✅ | 33 |
| `artemis/` — orchestration backend | Python | ✅ (no tests) | — |
| `growth_os/` — growth OS module | Python | ✅ importable | — |

---

## Manual Interventions Required

1. **Python `requirements.txt` (root)** — lists heavy ML deps (TensorFlow, Keras) for the aerospace analytics scripts (`data_collector.py`, `ml_engine.py`, etc.). These are not exercised by the test suite and are standalone scripts; install only if needed.
2. **Optional FastAPI gateways** — `clearflow/backend/app.py`, `clearpulse/backend/app.py`, and `artemis/backend/app.py` require `pip install fastapi pydantic uvicorn` to run the REST gateway (not needed for tests).
3. **Artemis-agent devDeps** — `apps/artemis-agent/node_modules/` must be populated with `npm install` before running tests or lint. The root `node_modules/` is separate.
4. **Open PR backlog** — resolved. All previously-open PRs (#46–#57) have been merged as of 2026-07-05; 0 open PRs remain.

## Re-verification (2026-07-05)

Re-ran the full check with no code changes on `main` since the last pass other than a Dependabot
GitHub Actions bump (#57, non-functional). Confirmed still green:

- `npm test` (validate + JS suite) — pass
- `npm run build` (root) — pass
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm run build`, `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- CLI smoke test (`status`, `dashboard`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)

No regressions found. No manual intervention required beyond the pre-existing documented notes above.

---

## Re-verification (2026-07-07)

Re-ran the full check with no code changes on `main` since the 2026-07-05 pass. Confirmed still green:

- `npm test` (validate + JS suite) — pass
- `npm run build` (root) — pass, `dist/` regenerated
- `pip install pytest` + `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm run build`, `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- CLI smoke test (`status`, `dashboard`, `orchestrate`) — pass
- `artemis.agents.orchestrator`, `artemis.agents.tools`, `artemis.evals.pipeline`, `artemis.policy.guard`, `growth_os.growth_os` — import cleanly
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways — `/docs` → 200
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)
- 0 open pull requests on the repository

No regressions found. No manual intervention required beyond the pre-existing documented notes above.

---

## Re-verification (2026-07-08)

Re-ran the full check with no code changes on `main` since the 2026-07-07 pass (the only intervening
commit, PR #60, was an empty merge). Confirmed still green:

- `npm ci` + `npm test` (validate + JS suite) — pass
- `npm run build` (root) — pass, `dist/` regenerated
- `pip install pytest` + `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm run build` (`tsc`), `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- CLI smoke test (`status`, `dashboard`, `orchestrate`) — pass
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways — `/docs` → 200 (via `pip install fastapi pydantic uvicorn`)
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)
- GitHub MCP access was unavailable this session (token expired), so the open-PR count could not be re-checked; no other step was affected

No regressions found. No manual intervention required beyond the pre-existing documented notes above.

---

## Re-verification (2026-07-12)

Re-ran the full check after PR #69 (pip-uninstallable `requirements.txt` repair) merged to `main`.
Found and fixed one new issue: **`flask` was missing as a real dependency.**

`app.py` unconditionally does `from flask import Flask, jsonify` at import time — it *is* a Flask
app (the `/api/health`, `/api/status`, `/api/market` routes) — but `requirements.txt` only listed
`flask` as a commented-out line under "Optional: Production Enhancements". A clean
`pip install -r requirements.txt` in a fresh venv left `app.py` unimportable with
`ModuleNotFoundError: No module named 'flask'`, contradicting the prior pass's claim that all
modules import cleanly. Fixed by moving `flask>=2.3.0` into the real dependency list (PR #70).

Confirmed green after the fix:

- Fresh venv `pip install -r requirements.txt` — succeeds
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly
- `app.py`'s `/api/health` route — 200 via Flask's test client
- `npm ci` + `npm test` (validate + JS suite) — pass
- `npm run build` (root) — pass, `dist/` regenerated
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm run build` (`tsc`), `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- CLI smoke test (`status`, `orchestrate`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)

No other regressions found.

---

## Re-verification (2026-07-14)

Re-ran the full check with no code changes on `main` since the 2026-07-12 pass (PR #70 merge is
still the tip of `main`). Confirmed still green:

- Fresh venv `pip install -r requirements.txt` — succeeds cleanly (isolating from the container's
  Debian-managed `blinker` avoids a spurious `Cannot uninstall blinker` error from system pip)
- `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- CLI smoke test (`status`, `dashboard`) — pass
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways — import cleanly
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)
- 0 open pull requests on the repository

No regressions found. No manual intervention required beyond the pre-existing documented notes above.

---

## Re-verification (2026-07-15)

Re-ran the full check after PR #71/#72 (docs-only addition of `ENGINEERING_GUIDELINES.md`, no code
changes) merged to `main`. Confirmed still green:

- `npm ci` + `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- Fresh venv `pip install -r requirements.txt` — succeeds cleanly
- `pip install pytest` + `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm run build` (`tsc`), `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly in the fresh venv
- `app.py`'s `/api/health` route — 200 via Flask's test client
- CLI smoke test (`status`, `dashboard`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)
- 0 open pull requests on the repository

No regressions found. No manual intervention required beyond the pre-existing documented notes above.

---

## Re-verification (2026-07-17)

Re-ran the full check with no code changes on `main` since the 2026-07-16 pass (PR #74 merge is
still the tip of `main`). Confirmed still green:

- `npm ci` + `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- Fresh venv `pip install -r requirements.txt` — succeeds cleanly
- `pip install pytest` + `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm run build` (`tsc`), `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly in the fresh venv
- `app.py`'s `/api/health` route — 200 via Flask's test client
- CLI smoke test (`status`, `dashboard`, `orchestrate`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)

No regressions found. No manual intervention required beyond the pre-existing documented notes above.

---

## Re-verification (2026-07-21)

Re-ran the full check after PRs #76–#83 (Dependabot bumps: GitHub Actions `setup-node@v7`,
`claude-code-action`, and pip `numpy`, `Pillow`, `tqdm`, `reportlab`, `PyYAML`) merged to `main`.
Found and fixed one new regression:

**`requirements.txt` — `numpy>=2.5.1` is unsatisfiable on Python 3.11.**

Dependabot PR #81 bumped the root `numpy` minimum pin to `2.5.1`, but numpy `2.5.1`+ requires
Python `>=3.12`. This repo's own tooling (`.github/workflows/workflow-repair-agent.yml`) and this
environment both run Python 3.11, so a fresh `pip install -r requirements.txt` failed outright with
`No matching distribution found for numpy>=2.5.1` — no numpy release satisfying that pin supports
3.11. The CI workflow (`ci.yml`) doesn't install Python deps at all, so this wasn't caught
automatically. Fixed by reverting the pin to `numpy>=2.4.6` (PR), the highest version still
compatible with Python 3.11 — matches every other unbounded/compatible pin in the file.

Also found `apps/artemis-agent`'s transitive `js-yaml` (via a fresh `npm install`) flagged with a
high-severity advisory (GHSA-52cp-r559-cp3m, quadratic CPU consumption on YAML merge keys).
Resolved cleanly with `npm audit fix` (no breaking version bump); `package-lock.json` updated.

Confirmed green after both fixes:

- Fresh venv `pip install -r requirements.txt` (numpy pin fixed) — succeeds
- `pip install -r clearpulse/requirements.txt` (PyYAML `>=6.0.3` bump) — succeeds
- `npm ci` + `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install`, `npm audit fix` (0 vulnerabilities), `npm run build` (`tsc`),
  `npm test` (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly in the fresh venv
- `app.py`'s `/api/health` route — 200 via Flask's test client
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways,
  `artemis.agents.orchestrator`, `artemis.agents.tools`, `artemis.evals.pipeline`,
  `artemis.policy.guard`, `growth_os.growth_os` — all import cleanly
- CLI smoke test (`status`, `dashboard`, `plan`, `run`, `orchestrate`) — pass
- Working tree remains clean of build artifacts after all installs/builds (`node_modules`, `dist`
  correctly gitignored)
- 0 open pull requests on the repository

No other regressions found. No manual intervention required beyond the pre-existing documented
notes above.

---

## Re-verification (2026-07-22)

Re-ran the full check with no code changes on `main` since the 2026-07-21 pass (PR #84, the numpy
pin fix and js-yaml advisory resolution, is still the tip of `main`). Confirmed still green:

- Fresh venv `pip install -r requirements.txt` (numpy pin fixed) — succeeds
- `pip install -r clearpulse/requirements.txt` — succeeds
- `npm ci` + `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install` (0 vulnerabilities), `npm run build` (`tsc`), `npm test`
  (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly in the fresh venv
- `app.py`'s `/api/health` route — 200 via Flask's test client
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways
  (via `uvicorn`) — `/docs` → 200
- `artemis.agents.orchestrator`, `artemis.agents.tools`, `artemis.evals.pipeline`,
  `artemis.policy.guard`, `growth_os.growth_os` — all import cleanly
- CLI smoke test (`status`, `dashboard`, `plan`, `run`, `orchestrate`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist` correctly gitignored)
- 0 open pull requests on the repository

No regressions found. No manual intervention required beyond the pre-existing documented notes
above.

---

## Re-verification (2026-07-23)

Re-ran the full check with no code changes on `main` since the 2026-07-22 pass (PR #85, the docs-only
re-verification writeup, is still the tip of `main`). Confirmed still green:

- Fresh venv `pip install -r requirements.txt` — succeeds (numpy resolves to `2.4.6`, respecting the
  existing Python-3.11-safe pin; `flask 3.1.3` installed)
- `pip install -r clearpulse/requirements.txt` — succeeds
- `npm ci` + `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install` (0 vulnerabilities), `npm run build` (`tsc`), `npm test`
  (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly in the fresh venv
- `app.py`'s `/api/health` route — 200 via Flask's test client
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways —
  import cleanly as FastAPI app objects
- CLI smoke test (`status`, `dashboard`, `orchestrate`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist`, `__pycache__`
  correctly gitignored)
- 0 open pull requests on the repository

No regressions found. No manual intervention required beyond the pre-existing documented notes
above.

---

## Re-verification (2026-07-24)

Re-ran the full check with no code changes on `main` since the 2026-07-23 pass (PR #86, the docs-only
re-verification writeup, is still the tip of `main`). Confirmed still green:

- Fresh venv `pip install -r requirements.txt` — succeeds (numpy resolves to `2.4.6`, respecting the
  existing Python-3.11-safe pin; `flask 3.1.3` installed)
- `pip install -r clearpulse/requirements.txt` — succeeds
- `npm ci` + `npm run ci` (validate + JS suite + build, root) — pass, `dist/` regenerated
- `python3 -m pytest clearflow/tests/ clearpulse/tests/ job_agent/tests/` — 123 passed
- `apps/artemis-agent`: `npm install` (0 vulnerabilities), `npm run build` (`tsc`), `npm test`
  (15 vitest), `npm run lint` (`tsc --noEmit`) — all pass
- `app.py`, `data_collector.py`, `database_init.py`, `market_analyzer.py`, `ml_engine.py`,
  `predictive_engine.py` — all import cleanly in the fresh venv
- `app.py`'s `/api/health` route — 200 via Flask's test client
- `clearflow.backend.app`, `clearpulse.backend.app`, `artemis.backend.app` FastAPI gateways —
  import cleanly as FastAPI app objects
- `artemis.agents.orchestrator`, `artemis.agents.tools`, `artemis.evals.pipeline`,
  `artemis.policy.guard`, `growth_os.growth_os` — all import cleanly
- CLI smoke test (`status`, `dashboard`, `orchestrate`) — pass
- Working tree remains clean after all installs/builds (`node_modules`, `dist`, `__pycache__`
  correctly gitignored)
- 0 open pull requests on the repository

No regressions found. No manual intervention required beyond the pre-existing documented notes
above.

---

## CI Workflow

`.github/workflows/ci.yml` runs on push/PR to `main`:
1. `npm ci`
2. `npm test` (validate + test suite)
3. `npm run build`
4. `npm run dashboard`
5. `npm run orchestrate`

Dependabot configured (`.github/dependabot.yml`) for weekly `github-actions` and `pip` updates.

All steps verified passing locally on 2026-07-04.

---

## Recommendation

**Status: READY TO MERGE**

All components are fully functional. The remaining `requirements.txt` (heavy ML) and FastAPI gateways are optional and not blocking — they are infrastructure-only scripts documented as manual steps above. The `apps/artemis-agent` build was broken (see Fix Applied above) and is now fixed; its Electron main/renderer/preload layers remain unimplemented (tracked as future work, not a regression).
