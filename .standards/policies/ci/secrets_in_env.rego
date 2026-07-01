# Secrets hygiene in pipeline / runtime environment blocks.
#
# Enforces:  docs/adr/0003-secrets-sops-age-fido2.md
#            docs/adr/0004-policy-as-code-opa-conftest.md
# SOP:       sops/SOP-005-secrets-management.md  (no plaintext secrets; SOPS+age + EnvironmentFile)
# Input:     a descriptor with an environment map and optional metadata:
#   {
#     "environment": "staging",
#     "env": { "LOG_LEVEL": "info", "API_TOKEN": "${API_TOKEN}" },
#     "env_files": ["%h/.config/mypods/api.env"],
#     "env_origin": { "DB_PASSWORD": "prod" }   # optional: which env a secret was sourced from
#   }
#
# Rules:
#   deny  - a secret-NAMED env var whose VALUE is an inlined plaintext secret
#           (not a ${VAR}/%VAR% reference and not empty)
#   deny  - any env VALUE that matches a known secret shape (PEM key, token prefix)
#   deny  - a secret sourced from a 'prod' origin used in a non-prod ('staging'/'dev') env
#   warn  - secret-named vars present but no EnvironmentFile declared (should use SOPS+age file)
package standards.ci.secrets

import rego.v1

import data.standards.lib

prod_envs := {"prod", "production"}

is_prod if {
	prod_envs[lower(input.environment)]
}

env := object.get(input, "env", {})

env_files := object.get(input, "env_files", [])

# --- Plaintext secret in a secret-named variable ----------------------------

deny contains msg if {
	some k, val in env
	lib.looks_like_secret_name(k)
	is_string(val)
	not lib.is_placeholder(val)
	msg := sprintf("env '%v' looks like a secret but holds an inline value; reference it via SOPS+age/EnvironmentFile instead (SOP-005)", [k])
}

# --- Value that matches a known secret shape, regardless of the var name -----

deny contains msg if {
	some k, val in env
	lib.looks_like_secret_value(val)
	not lib.is_placeholder(val)
	msg := sprintf("env '%v' value matches a secret pattern (private key / token); never commit plaintext secrets (SOP-005)", [k])
}

# --- Cross-environment secret bleed: prod secret used in a lower env ---------

deny contains msg if {
	not is_prod
	origin := object.get(input, "env_origin", {})
	some k, src in origin
	lower(src) == "prod"
	msg := sprintf("env '%v' is sourced from a PROD secret but used in '%v'; environments must not share secret material (ADR-0006, SOP-005)", [k, input.environment])
}

# --- Advisory: secret-named vars but no EnvironmentFile pattern --------------

warn contains msg if {
	some k, _ in env
	lib.looks_like_secret_name(k)
	count(env_files) == 0
	msg := sprintf("env '%v' is secret-shaped but no EnvironmentFile is declared; load secrets from a SOPS-decrypted env file (SOP-005)", [k])
}
