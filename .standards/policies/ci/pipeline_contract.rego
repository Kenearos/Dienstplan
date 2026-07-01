# Pipeline contract: both CI adapters (GitHub Actions and Woodpecker) must implement
# the SAME canonical stage sequence, so a pipeline is portable between them.
#
# Enforces:  docs/adr/0002-dual-target-ci.md
# SOP:       sops/SOP-001-branch-and-merge.md  (the merge gate runs this contract)
# Input:     a pipeline descriptor listing the stages it defines:
#   {
#     "ci": "github",
#     "stages": ["static-checks", "test", "build", "policy_check",
#                "security-scan", "publish", "deploy-staging"]
#   }
#   Stage names may use the adapter's own spelling; `deploy` is satisfied by either
#   `deploy-staging` or `deploy-prod`.
#
# Rules:
#   deny  - any REQUIRED canonical stage is missing from the descriptor
package standards.ci.pipeline

import rego.v1

# Only evaluate inputs that are actually pipeline descriptors (carry a `stages` list).
# Keeps the package silent under conftest --all-namespaces for unrelated inputs.
_is_pipeline_input if {
	is_array(input.stages)
}

# The canonical, ordered set of stages every pipeline must implement. `deploy` is a
# logical stage satisfied by a concrete deploy-staging or deploy-prod stage.
required_stages := ["static-checks", "test", "build", "policy_check", "security-scan", "publish", "deploy"]

# The set of stage names the descriptor actually declares, lower-cased.
declared_stages contains s if {
	some raw in input.stages
	is_string(raw)
	s := lower(raw)
}

# --- A required stage is missing --------------------------------------------

deny contains msg if {
	_is_pipeline_input
	some required in required_stages
	not _stage_satisfied(required)
	msg := sprintf("pipeline is missing required stage '%v'; both CI adapters must implement the canonical contract %v (ADR-0002, SOP-001)", [required, required_stages])
}

# --- helpers ----------------------------------------------------------------

# _stage_satisfied(req) is true when the descriptor declares the required stage.
# The logical `deploy` stage is satisfied by deploy-staging OR deploy-prod.
_stage_satisfied(req) if {
	req != "deploy"
	declared_stages[req]
}

_stage_satisfied("deploy") if {
	declared_stages["deploy-staging"]
}

_stage_satisfied("deploy") if {
	declared_stages["deploy-prod"]
}

_stage_satisfied("deploy") if {
	declared_stages["deploy"]
}
