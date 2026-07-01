# Contributing to `Dienstplan`

> Rendered by `adopt-standard.sh` from the standards repo, pinned at
> **`1.0.0`** (see [`.standards-version`](.standards-version)).
> Replace the `{{PLACEHOLDERS}}` and tailor as needed. This is the adopter-facing
> variant of the standard's own contribution guide.

This repo adopts our engineering standard. Contributions follow it: **decisions are
recorded, the local gate must pass, and an owner reviews via CODEOWNERS.**

---

## TL;DR

1. **Branch** off `develop` with a short-lived `feature/<topic>` branch (branch &
   merge SOP — SOP-001 in the standard).
2. If you are **deciding** something architectural (a contract, default, or rule),
   record an **ADR** first (`docs/adr/NNNN-kebab-title.md`, Nygard format).
3. Make the change.
4. Run the gate locally: **`pre-commit run -a`** and, if this repo has a `Makefile`
   with a test target, **`make test`**. Both must pass.
5. Add a `CHANGELOG.md` entry under `[Unreleased]`.
6. Commit with **Conventional Commits**, open a PR, fill the PR template, get an
   **owner review** ([`CODEOWNERS`](CODEOWNERS)).

---

## The local gate

CI runs the same checks; passing locally is the contract for opening a PR.

```bash
pre-commit install      # one-time
pre-commit run -a       # hygiene + shellcheck + gitleaks + sops-encrypted-check (+ optional conftest)
make test               # if this repo defines it (validate/test/policy targets)
```

Tooling degrades gracefully: an optional binary that is not installed is skipped with
a notice rather than hard-failing — but install it if your change touches the area it
checks. **Never bypass `gitleaks` or `sops-encrypted-check`** (see
[`SECURITY.md`](SECURITY.md): no plaintext secrets, ever).

---

## Conventional Commits

```
<type>(<optional scope>): <imperative summary>
```

Allowed `type`s: `feat`, `fix`, `docs`, `ci`, `refactor`, `test`, `chore` (plus
`adr`, `sop`, `policy` for standard-adjacent repos). Use `!` or a `BREAKING CHANGE:`
footer for changes consumers must act on. Examples:

```
feat(api): add idempotent retry to the payment client
fix(ci): pin reusable workflow to v1.0.0
docs: clarify staging deploy approval step
```

---

## Review via CODEOWNERS

Every PR requires review from an owner in [`CODEOWNERS`](CODEOWNERS) before merge
(enforce with branch protection on `develop`/`main`). Security-relevant paths
(`/.github/`, `/ci/`, `/policies/`, `/secrets/`, `/SECURITY.md`) always require an
owner's sign-off. The PR template is your checklist.

## CI wiring

This repo's CI is a **thin caller** that `uses:` the standard's reusable workflows
pinned at the adopted version (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
Do not copy pipeline logic into this repo — change the standard and bump the pin
instead.

---

## References

- [`SECURITY.md`](SECURITY.md) · [`CODEOWNERS`](CODEOWNERS) · [`.standards-version`](.standards-version)
- [`.pre-commit-config.yaml`](.pre-commit-config.yaml) · [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
