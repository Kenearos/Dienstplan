# Security Policy

> Rendered by `adopt-standard.sh` from the standards repo, pinned at
> **`1.0.0`**. Replace the `{{PLACEHOLDERS}}` and tailor as needed.
> This is the adopter-facing variant of the standard's own
> `SECURITY.md`; keep the no-plaintext-secret rule and the data traffic-light intact.

This policy applies to **`Kenearos/Dienstplan`**. It is derived from our engineering
standard (pinned in [`.standards-version`](.standards-version)).

---

## Reporting a vulnerability

**Do not open a public issue for a security problem** — a public issue widens
exposure before a fix exists (a private repo is *non-public*, not *secret-safe*).

1. Email **kenearos@googlemail.com** with the subject prefix `[SECURITY] Dienstplan`.
2. Include: affected file/component, the version/commit you observed it on, a minimal
   reproduction, and the impact you foresee.
3. **Never paste a real secret, private key, token, or production hostname** into the
   report. If a credential leaked, report *that it leaked and where* — then **rotate
   it first**, before anything else.

Expect acknowledgement within **3 business days** and a triage decision within
**10 business days**. We prefer **coordinated disclosure**: please give us a
reasonable window to ship a fix before any public write-up.

---

## Secret policy — no plaintext secrets in git, ever

**No plaintext secret material is committed to this repository, not even "just for a
minute" and not even though the repo is private.**

- **Encrypted-only.** Machine-readable secrets are encrypted with **SOPS + age**
  before they touch git. Only `*.enc.*` / `*.sops.*` ciphertext and `*.example`
  placeholders belong in version control.
- **age keys, not the KeePass master password.** Use **dedicated age keys**.
  **KeePass remains the human vault** (emergency codes, manual credentials, key
  backups). Never reuse the KeePass master password for other crypto purposes.
- **SSH keys.** Private keys are **never** committed; public keys may be versioned.
- **A FIDO2 / hardware-token path** is supported for the age identity.

This is enforced, not honour-system:

| Layer | Mechanism |
|-------|-----------|
| Pre-commit (local) | `gitleaks` + `sops-encrypted-check` in [`.pre-commit-config.yaml`](.pre-commit-config.yaml); secret-safe [`.gitignore`](.gitignore) |
| CI `security-scan` | secret + dependency scanning |
| CI `policy_check` | Rego policy from the pinned standard |

If a secret is ever committed: treat it as compromised, **rotate it immediately**,
then scrub history. Rotation comes first.

---

## Data traffic-light

Classify every piece of content before committing:

| Light | Meaning | Rule |
|:-----:|---------|------|
| 🟢 **GREEN** | Technical content, **no** personal data. | OK in the repo. |
| 🟡 **YELLOW** | **Minimized** personal reference — roles / IDs, not real names. | Use **sparingly**. |
| 🔴 **RED** | Sensitive personal data, **plaintext secrets, private keys**. | **Never** in the repo. Encrypt secrets (SOPS+age) or keep personal data out entirely. |

---

## Supported versions

| Version | Supported |
|---------|-----------|
| Latest release of `Dienstplan` | ✅ Yes |
| Older releases | ❌ Upgrade first |

The standard this repo adopts follows SemVer; bump
[`.standards-version`](.standards-version) deliberately and read its CHANGELOG
migration notes.

---

## References

- [`CONTRIBUTING.md`](CONTRIBUTING.md) · [`CODEOWNERS`](CODEOWNERS)
- [`.pre-commit-config.yaml`](.pre-commit-config.yaml) · [`.standards-version`](.standards-version)
