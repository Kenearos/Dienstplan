---
title: <Procedure title>
status: Draft
owner: alex
review-date: YYYY-MM-DD
---

<!--
SOP template — matches the section contract in docs/00-overview.md §5.5.
Used by `make sop-new` and rendered by adopt-standard.sh into
<repo>/sops/SOP-NNN-kebab-topic.md.

Rules:
  - File name: SOP-NNN-kebab-topic.md, NNN zero-padded (SOP-007, SOP-008, …).
  - Sections MUST appear in this order: Purpose, Scope, Roles, Procedure,
    Enforced by, Failure modes & rollback, References.
  - Every Procedure step is FALSIFIABLE: you can mechanically tell whether it
    was done (a command ran, a file exists, a check is green).
  - Keep the ADR <-> SOP <-> Policy triangle intact: name the ADR that motivates
    this SOP and the Policy/CI that enforces its checkable steps.
Delete this comment when you fill the template in.
-->

# SOP-NNN: <Procedure title>

## Purpose

<!-- One paragraph: what outcome this procedure guarantees and why it exists. -->

## Scope

<!-- When this SOP applies and when it does NOT (repos, branches, environments,
     mandanten). Be explicit about boundaries. -->

## Roles

<!-- Who does what. Use roles/IDs, not real names (data traffic-light: YELLOW). -->

| Role | Responsibility |
|------|----------------|
| Author | … |
| Reviewer (CODEOWNERS) | … |
| Approver | … |

## Procedure

<!-- Numbered, falsifiable steps. Each step states the action and its observable
     "done" condition. Reference the exact command/file where possible. -->

1. **<Action>.** Done when: `<observable check, e.g. a command exits 0 / a file exists>`.
2. **<Action>.** Done when: `…`.
3. **<Action>.** Done when: `…`.

## Enforced by

<!-- Link the machine checks that gate the falsifiable steps above:
  - Policy: ../policies/<domain>/<name>.rego (+ tests/<name>_test.rego)
  - CI:     ../ci/github/reusable-*.yml | ../ci/woodpecker/.woodpecker.*.yml
  - Local:  .pre-commit-config.yaml hooks
  - ADR:    ../docs/adr/NNNN-*.md (the decision this SOP operationalizes)
  If a step is human-judgement only, say so and explain the compensating control. -->

## Failure modes & rollback

<!-- What can go wrong at each critical step, how it is detected, and the exact
     rollback. Be concrete: "revert commit X", "re-run with --force-unlock", etc. -->

- **Failure:** … → **Detection:** … → **Rollback:** …

## References

<!-- Related SOPs, ADRs, policies, external docs (repo-relative markdown links). -->
