# Revenue Ladder: Sellable Capabilities with Repository Evidence

Audit date: 2026-10-05. Companion to [`revenue-baseline.md`](revenue-baseline.md).

Rules applied to this table:

- A capability is listed only if code or a documented procedure in this repository backs it.
  Each row names the file. The "Verified" column says how it was checked.
- Prices marked **HYPOTHESIS** have no customer evidence behind them and are not offers. The
  owner sets and approves every price before it is quoted.
- No revenue, customer or demand figure appears here. None exists in this repository.

## Evidence table

| Existing repo capability | Customer problem solved | Target buyer | Concrete deliverable | Time to deliver | Feasible price (CAD) | File/code evidence | Verified |
|---|---|---|---|---|---|---|---|
| Fixed-scope **Security Quick-Audit** (read-only posture review) | Owner does not know whether email, identity and admin settings are exposed | Ontario SMB (accounting, legal, dental, property management), 5-50 staff | Written findings report and a 30-minute walkthrough | 3 business days | **249**, the price the owner already uses for this offer | `artemis/service-agent/knowledge-base.md` offering 2 (named as the default entry point; scope and price fields are still `<<FILL IN>>`) | Offering defined, with its full scope kept outside this repo. **No repo code automates the email-authentication or identity checks**, so delivery is manual. |
| GitHub Actions queue and flake diagnosis | Slow CI, flaky jobs, missing `concurrency` | Product engineering teams on GitHub Actions | Report built from the client's `gh run list --json` export, with ranked recommendations | 1-2 days | 750-1,500 **HYPOTHESIS** | `ontario_strike/gha_queue_doctor.py` | Ran on a synthetic 2-run export on 2026-10-05: exit 0, p95 and top-workflow output |
| Terraform plan blast-radius guard | Unsafe `replace`/`delete` on costly resources reaching apply | AWS IaC platform teams | CI gate config plus a review of recent plans | 1-2 days | 750-1,500 **HYPOTHESIS** | `ontario_strike/terraform_plan_guard.py` | Ran on a synthetic plan on 2026-10-05: blocked an RDS replace, exit 2 |
| Idle cloud spend finder | Paying for stopped, unattached or idle resources | SaaS teams with cloud bills over USD 5k/month | Ranked idle-spend list with monthly USD at risk | 1-2 days | 750-2,500 **HYPOTHESIS** | `ontario_strike/cloud_idle_finops.py` | Ran on a synthetic 2-item inventory on 2026-10-05: flagged USD 152/month, exit 0 |
| SLO burn-rate release gate | Releases ship while the error budget is burning | SRE teams on Azure Monitor or any request/error counters | Multi-window burn gate wired into the release pipeline | 2-3 days | 1,500-2,500 **HYPOTHESIS** | `ontario_strike/azure_slo_burn.py` | Documented example re-run on 2026-10-05: returned `PAGE`, exit 2 |
| Kubernetes rollout brake | Deployments roll forward on error | Kubernetes SaaS platforms | Rollout gate on `kubectl rollout status` output | 2-3 days | 1,500-2,500 **HYPOTHESIS** | `ontario_strike/k8s_rollout_brake.py` | `--help` only |
| At-rest PHI/PII file scan | Unencrypted personal data sitting in shared folders | Regulated SMBs | Masked findings list per file | 1-2 days | **Not sellable yet** | `clearpulse/compliance/scanner.py` | 46 ClearPulse tests pass. **Its patterns are US-centric (SSN, US phone) and have no Ontario identifiers (for example health card numbers), so it cannot back any PHIPA claim yet.** |
| Hardening sprint (M365/Windows) | Known weak identity and endpoint settings | Quick-Audit clients with confirmed gaps | Implementation roadmap and changes made under written authorization | 1-2 weeks | 2,500, the figure the owner already uses for this sprint | `artemis/service-agent/knowledge-base.md` offering 1 (scope and price fields are `<<FILL IN>>`) | Offering named; delivery is manual. The client authorization letter does not exist yet. |
| Aerospace Intelligence System editions | n/a | n/a | n/a | n/a | **Do not sell as described** | `AerospaceIntel.ps1:461-465` (`Get-Random` scores), `:548-557` (fixed forecasts) | The core score is random. Selling it as research would be a misleading representation. |

## Entry offer decision

The brief asked for a new entry offer, "ClearGlass Rapid Website & Deployment Diagnostic" at
CAD $125. **It was not created.**

- The owner already offers a fixed-scope Security Quick-Audit at CAD $249. A second, cheaper
  diagnostic would create a duplicate pricing source and undercut an offer that has already
  been quoted.
- Price changes and new offers need owner approval.

**Recommended entry offer:** the existing Security Quick-Audit, unchanged.

**Delivery checklist (manual, all read-only, under signed written authorization):**

1. Public DNS: MX, SPF, DKIM selector presence, and DMARC policy and reporting.
2. TLS and security headers on the primary website.
3. Identity review in M365 or Google Workspace: admin role count, MFA coverage, legacy auth.
   This needs the client's signed authorization letter.
4. A written findings report with no more than 10 items, ranked, each with a remediation step.
5. A 30-minute walkthrough. Offer the hardening sprint only where the findings support it.

**Payment path (outside this repo):** an invoice or e-Transfer, or a Stripe Payment Link from
the Dashboard. Start fulfilment only after the bank or processor records the payment.

## What would justify building payment automation

Build a server-side Checkout, signed webhook and notification flow only when both of these hold:

1. At least one paid order exists, verified in the processor.
2. Manual reconciliation of paid orders has become the measured bottleneck.

Until then, the GitHub-hosted static site cannot receive webhooks, and a Payment Link plus
manual reconciliation covers the volume.
