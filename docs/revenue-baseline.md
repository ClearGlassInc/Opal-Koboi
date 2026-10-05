# Revenue Baseline: ClearGlassInc/Opal-Koboi

Audit date: 2026-10-05. Scope: this repository, its GitHub Actions history and its deploy
targets. Each line below names the evidence it rests on. Anything that could not be checked is
marked **NOT VERIFIED** or **NOT AVAILABLE**. This page states no revenue, customer or pipeline
figure. Payment-processor data was not available to the audit (see section 3), and this public
repository is not a system of record for sales.

## 1. Repository identification

| Item | Value | Evidence |
|---|---|---|
| Remote | `https://github.com/ClearGlassInc/Opal-Koboi` (public, MIT, template repo) | `git remote get-url origin`; GitHub repo API |
| Default branch / HEAD | `main` @ `3074a7335e14447ec4ec29059fc9aa4e173ee271` (merge of PR #145, 2026-10-01) | `git rev-parse origin/main` |
| Working tree at audit start | clean | `git status` |
| Package | `@clearglassinc/opal-koboi@2.1.3`, Node >= 20, ESM | `package.json` |
| Local checks (2026-10-02) | `npm run ci` pass; `apps/artemis-agent` build, test (15/15), lint, audit pass; pytest: clearflow 47, clearpulse 46, job_agent 33 pass on Python 3.13 | Session run logs |

## 2. Architecture and deployment

| Component | What it is | Deploy status |
|---|---|---|
| Static site (`index.html`, `spec.html`, `assets/`, `docs/`, `README.md`) | Marketing page and demo console. The hero figures are hardcoded in `index.html:110-122`, the log feed is a fixed list in `assets/js/console.js:139-152`, and system statuses come from a simulator (`assets/js/control-surface.js:56-90`). | GitHub-managed `pages-build-deployment` succeeds (run 36894061655, 2026-10-01). The custom `pages.yml` has failed on every run since 2026-08-10. |
| Opal-Koboi CLI and library (`src/`, `bin/`) | Mission planning and workflow orchestration CLI | Published to GitHub Packages only. Public npm returns 404, and the `npmjs` publish job skips because `NPM_TOKEN` is not set (run 30686393311). |
| ClearFlow (`clearflow/`) | Workflow engine with a FastAPI gateway | No hosted deployment found |
| ClearPulse (`clearpulse/`) | Compliance and forensics pipeline with a FastAPI gateway | No hosted deployment found |
| ARTEMIS (`artemis/`, `apps/artemis-agent/`) | Agent orchestration, policy guard, TypeScript agent | The Netlify site `clearglass-artemis` fails deploy previews on every open PR |
| Ops scripts (`ontario_strike/`) | 5 standalone diagnostic scripts (Terraform, GitHub Actions, SLO burn, cloud idle spend, Kubernetes rollout) | Local tools; no deployment |

**CI/CD state.** The repo's own workflows (CI, `pages.yml`, Repository Health, Workflow Repair
Agent, CodeQL) have failed on `main` since 2026-08-10. The jobs end in about 3-5 seconds with no
runner assigned, so no test or build step runs. The cause is at the GitHub account level, not
in the code, and has to be resolved in the organization's GitHub settings.

## 3. Revenue infrastructure (built assets)

| Asset | Status | Evidence |
|---|---|---|
| Payment processor SDK, checkout route or Payment Link in code | **NOT FOUND** | Repo-wide grep for stripe, checkout, payment link, invoice and webhook handlers found only `actions/checkout` |
| Payment webhook / order ledger / revenue records | **NOT FOUND** | Same grep; `git log --grep` found no commerce commits |
| Purchase URLs in docs | `buy.clearglassinc.com` did not resolve in DNS on 2026-10-02, so those links were removed from the public docs | `getent hosts` |
| Stripe account (products, prices, payments, webhooks) | **NOT AVAILABLE**: the Stripe connector is not connected in the audit environment | Connector listing, 2026-10-02 |
| License enforcement | None. A license key is hardcoded in `clearglassinc.json:13` and never validated. | Repo-wide grep: `license_key` appears only at `clearglassinc.json:13` and is never read |
| Sponsorship | `.github/FUNDING.yml` is the empty template | File contents |

**Status: PAYMENT INFRASTRUCTURE NOT BUILT IN THIS REPOSITORY.** Payment collection for any
service currently has to come from systems outside this repo (invoice, Interac e-Transfer, or a
Payment Link created in the Stripe Dashboard).

## 4. Integrations

| Integration | Status | Evidence |
|---|---|---|
| Lead capture form / booking link on the site | **NOT FOUND**. The homepage CTAs point to page anchors, `spec.html` or GitHub. | `index.html:100-109,379-392` |
| Analytics | **NOT FOUND** | grep for `gtag`/`analytics` |
| Slack | Generic webhook notifier exists but has no configured URL | `clearflow/notify.py:104-129` |
| CRM | **NOT FOUND**. `job_agent/` is a personal job-search tracker (JSON sink), not a sales CRM. | `job_agent/tracking.py` |
| Sales-qualification agent | Prompt files only. Every price and the booking URL are `<<FILL IN>>`. | `artemis/service-agent/knowledge-base.md` |

## 5. Core IP that can support paid services

See [`revenue-ladder.md`](revenue-ladder.md) for the evidence table.

## 6. Security and trust bottlenecks

1. **Unverifiable public claims (mostly fixed in this change).** Named testimonials, customer
   case studies, SOC 2 and ITAR/EAR claims, "87% prediction accuracy", placeholder phone numbers
   and addresses, and links to subdomains that do not resolve have been removed from the Markdown
   docs. The aerospace score those claims described is produced by `Get-Random`
   (`AerospaceIntel.ps1:461-465`). **Still open:** the contact block in `LICENSE.txt` (placeholder
   address and phone; this needs the owner's licence review, see item 5),
   `Clearglassinc_System_Architecture.docx` and `Clearglassinc_Complete_Documentation.docx`, and
   the strings in `generate_docs.js` that produce them.
2. **Homepage figures were presented as live.** A notice now says the page shows simulated sample
   data, and the "Uptime SLA" label is now "Uptime (demo)".
3. **Nexus demo page (fixed in this change).** Untrusted feed and model text is now escaped
   before it is rendered, and the page no longer stores a visitor's API key in browser storage
   (it also clears any key saved by earlier versions).
4. **CodeQL has not completed a scan on `main` since 2026-08-09** (blocked by the same CI issue).
5. **License conflict.** `LICENSE` and `package.json` say MIT, while `LICENSE.txt` and the README
   say commercial and all rights reserved. **Open: owner decision.**
6. **`api_specification.yaml` does not parse as YAML** (error at line 191, column 59). This
   predates this change.

## 7. Recommended shortest path to the first CAD $1

1. Sell an existing fixed-scope service: the **Security Quick-Audit**
   (`artemis/service-agent/knowledge-base.md`, offering 2). It needs no hosting, licence system
   or new code.
2. Collect payment outside this repo through an owner-controlled invoice, an e-Transfer, or a
   Stripe Payment Link created in the Dashboard. Treat a payment as verified only when the
   processor or bank records it, never on a redirect or a sent email.
3. Deliver by hand using the ladder's delivery checklist. Build checkout, webhook or Slack
   automation only after paid orders show the manual path is the bottleneck.
4. Restore GitHub Actions at the organization level so CI, CodeQL and `pages.yml` run again.
