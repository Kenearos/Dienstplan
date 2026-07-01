---
title: <Short decision title, imperative>
status: Draft
owner: alex
review-date: YYYY-MM-DD
---

<!--
ADR template — Michael Nygard format. Used by `make adr-new` and rendered by
adopt-standard.sh into <repo>/docs/adr/NNNN-kebab-title.md.

Rules (see docs/00-overview.md §5.2, §5.4):
  - File name: NNNN-kebab-title.md, NNNN zero-padded (0009, 0010, …).
  - The H1 number matches NNNN; the title matches front-matter `title`.
  - status lifecycle: Draft -> Accepted -> Superseded. Immutable once Accepted —
    to change a decision, write a NEW ADR that Supersedes this one.
  - If this decision asserts an enforceable rule, name its counterparts under
    "Enforced by": the SOP that operationalizes it and the Policy (+ *_test.rego)
    that enforces it. Keep the ADR <-> SOP <-> Policy triangle intact.
Delete this comment when you fill the template in.
-->

# NNNN. <Short decision title, imperative>

## Status

Draft — YYYY-MM-DD.
<!-- When accepted: "Accepted — YYYY-MM-DD." When replaced: "Superseded by
     [ADR-XXXX](XXXX-kebab-title.md) — YYYY-MM-DD." -->

## Context

<!-- The forces at play: technical, business, team. What problem or pressure makes
     a decision necessary now? State facts and constraints, not the solution.
     Be concrete and falsifiable. -->

## Decision

<!-- The change we are actually making, in active voice: "We will …".
     One decision per ADR. Spell out the chosen option clearly enough that someone
     can implement it without guessing. -->

We will …

## Consequences

<!-- What becomes easier AND harder after this decision. List both. -->

- Positive: …
- Negative: …
- Neutral / follow-ups: …

## Alternatives considered

<!-- Options you rejected and the one-line reason each lost. Optional but recommended. -->

- **<Option>** — rejected because …

## Enforced by

<!-- Required when this ADR asserts an enforceable rule. Link the exact files:
  - SOP:    ../../sops/SOP-NNN-<topic>.md
  - Policy: ../../policies/<domain>/<name>.rego (+ tests/<name>_test.rego)
  - CI:     ../../ci/github/reusable-*.yml | ../../ci/woodpecker/.woodpecker.*.yml
  If purely advisory, write "Advisory — no machine enforcement." and say why. -->

## References

<!-- Related ADRs (supersedes/superseded-by), SOPs, external links. -->
