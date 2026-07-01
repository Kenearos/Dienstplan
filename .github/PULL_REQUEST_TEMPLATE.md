<!--
PULL_REQUEST_TEMPLATE.md — rendered into <repo>/.github/ by adopt-standard.sh.
The checklist is tied to SOP-001 (branch & merge) and the CI policy gates.
Keep the items; tailor wording to your repo. Delete inapplicable sections, not checks.
-->

## What & why

<!-- One or two sentences: what does this change do, and why now? Link the issue. -->

Closes #

## Type of change

- [ ] `feat` — new functionality
- [ ] `fix` — bug fix
- [ ] `docs` — documentation only
- [ ] `ci` / `refactor` / `test` / `chore`
- [ ] **Breaking change** (consumers must act — `!` / `BREAKING CHANGE:` in the commit)
- [ ] **Decision** — an ADR is included or updated (`docs/adr/NNNN-*.md`)

## SOP-001 (branch & merge) checklist

- [ ] Branched from `develop` with a short-lived `feature/<topic>` (no direct commits to `main`/`develop`).
- [ ] Commits follow **Conventional Commits**.
- [ ] Up to date with the base branch (rebased/merged); no merge conflicts.
- [ ] At least one **CODEOWNERS** reviewer is requested.
- [ ] `CHANGELOG.md` updated under `[Unreleased]` (if user-facing).

## Policy & security gates (must be green)

- [ ] `pre-commit run -a` passes locally (whitespace/EOF/YAML, **shellcheck**, **gitleaks**, **sops-encrypted-check**).
- [ ] CI `static-checks`, `test`, `build`, **`policy_check`** and **`security-scan`** stages pass.
- [ ] **No plaintext secrets** added — secrets are SOPS+age encrypted (`*.enc.*` / `*.sops.*` only). See `SECURITY.md`.
- [ ] Data traffic-light respected: nothing 🔴 RED (sensitive personal data / plaintext keys) committed.
- [ ] If this asserts a rule: an ADR records *why*, an SOP records *how*, and a Policy (+ `*_test.rego`) enforces it.

## How was this verified?

<!-- Commands run, environments tested, evidence. Be concrete and falsifiable. -->

## Rollback plan

<!-- If this is a risky change (deploy, migration, policy tightening): how to revert. -->
