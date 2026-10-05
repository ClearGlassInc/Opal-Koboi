# Revenue Ladder: Sellable Capabilities with Repository Evidence

Audit date: 2026-10-05. Companion to [`revenue-baseline.md`](revenue-baseline.md).

Rules applied to this table:

- A capability is listed only if code or a documented procedure in this repository backs it.
  Each row names the file. The "Verified" column says exactly what was checked and what was not.
- Every price, turnaround and buyer segment here is a **HYPOTHESIS**, proposed for the owner to
  approve. None has customer evidence behind it, and none is an offer.
- No revenue, customer, pipeline or demand figure appears here. None exists in this repository.

## Evidence table

| Existing repo capability | Customer problem solved | Target buyer (proposed) | Concrete deliverable | Time to deliver (proposed) | Price, CAD | File/code evidence | Verified |
|---|---|---|---|---|---|---|---|
| Fixed-scope **Security Quick-Audit** (read-only posture review) | Owner does not know whether email, identity and admin settings are exposed | Ontario SMBs and compliance leads | Written findings report | 3-5 business days | Owner to set. The source file still says `<<FILL IN>>`. | `artemis/service-agent/knowledge-base.md` offering 2, described as the default entry point | Offering is named, but its scope and price fields are still `<<FILL IN>>`. **No repo code automates the email-authentication or identity checks**, so delivery is manual. |
| GitHub Actions run-history review | Long CI wall time, failing workflows, missing `concurrency` | Product engineering teams on GitHub Actions | Report from the client's `gh run list --json` export | 1-2 days | 750-1,500 **HYPOTHESIS** | `ontario_strike/gha_queue_doctor.py` | Ran on a synthetic 2-run export on 2026-10-05: parsing and top-workflow counts worked. **Not exercised:** flake detection needs at least 5 runs of a workflow (line 79). p95 is unreliable on small samples. "Duration" is created-to-updated time, not measured queue time. |
| Terraform plan guard | A replace of a costly resource (EKS/RDS/LB/NAT/OpenSearch), or a mass destroy of more than 10 resources, reaching apply | AWS IaC platform teams | CI gate config plus a review of recent plans | 1-2 days | 750-1,500 **HYPOTHESIS** | `ontario_strike/terraform_plan_guard.py` (`violations()`, lines 63-74) | Ran on a synthetic plan on 2026-10-05: blocked an RDS replace, exit 2. **It does not block a single delete** of a costly resource. |
| Idle cloud spend finder | Paying for stopped, unattached or idle resources | SaaS teams with material cloud bills | Ranked idle-spend list with monthly USD at risk | 1-2 days | 750-2,500 **HYPOTHESIS** | `ontario_strike/cloud_idle_finops.py` | Ran on a synthetic 2-item inventory on 2026-10-05: flagged USD 152/month, exit 0 |
| SLO burn-rate release gate | Releases ship while the error budget is burning | SRE teams on Azure Monitor or any request/error counters | Burn-rate gate wired into the release pipeline | 2-3 days | 1,500-2,500 **HYPOTHESIS** | `ontario_strike/azure_slo_burn.py` | The burn-rate formula was fixed in this change (it had multiplied by period/window). The documented example now returns `OK burn=1.200` (exit 0). 150/10,000 errors at SLO 99.9 returns `PAGE burn=15.000` (exit 2). Only one window is evaluated per call. |
| Kubernetes rollout brake | Deployments roll forward on error | Kubernetes SaaS platforms | Rollout gate on `kubectl get deploy/ds -o json` output | 2-3 days | 1,500-2,500 **HYPOTHESIS** | `ontario_strike/k8s_rollout_brake.py` | `--help` only |
| At-rest PHI/PII file scan | Unencrypted personal data sitting in shared folders | Regulated SMBs | Masked findings list per file | 1-2 days | **Not sellable yet** | `clearpulse/compliance/scanner.py` | 46 ClearPulse tests pass. **Its patterns are US-centric (SSN, US phone) and have no Ontario identifiers (for example health card numbers), so it cannot back any PHIPA claim yet.** |
| M365 + Windows hardening sprint | Known weak identity and endpoint settings | Quick-Audit clients with confirmed gaps | Implementation roadmap and changes made under written authorization | 1-2 weeks | Owner to set. The source file still says `<<FILL IN>>`. | `artemis/service-agent/knowledge-base.md` offering 1 | Offering is named, but its scope and price fields are still `<<FILL IN>>`. Delivery is manual. |
| Aerospace Intelligence System editions | n/a | n/a | n/a | n/a | **Do not sell as described** | `AerospaceIntel.ps1:461-465` (`Get-Random` scores), `:548-557` (fixed forecasts) | The core score is random. Selling it as research would be a misleading representation. |

## Entry offer decision

**Recommended entry offer:** the existing Security Quick-Audit (offering 2). The repository
already defines it as the default entry point. A second, lower-priced diagnostic was considered
and **not created**: it would add a second pricing source for the same buyer and the same first
step. The owner sets the Quick-Audit price and approves it before it is quoted.

**Delivery checklist (proposed; manual, read-only, under signed written authorization):**

1. Public DNS: MX, SPF, DKIM selector presence, and DMARC policy and reporting.
2. TLS and security headers on the primary website.
3. Identity review in M365 or Google Workspace: admin role count, MFA coverage, legacy auth.
   This needs the client's signed authorization letter.
4. A written findings report, ranked, with a remediation step for each item.
5. A walkthrough call. Offer the hardening sprint only where the findings support it.

**Payment path (outside this repo):** an invoice or e-Transfer, or a Stripe Payment Link from
the Dashboard. Start fulfilment only after the bank or processor records the payment.

## What would justify building payment automation

Build a server-side Checkout, signed webhook and notification flow only when both of these hold:

1. At least one paid order exists, verified in the processor.
2. Manual reconciliation of paid orders has become the measured bottleneck.

Until then, the GitHub-hosted static site cannot receive webhooks, and a Payment Link plus
manual reconciliation covers the volume.
