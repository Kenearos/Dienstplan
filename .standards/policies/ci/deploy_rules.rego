# Deploy gate: who is allowed to deploy WHAT, WHERE, and under WHICH conditions.
#
# Enforces:  docs/adr/0004-policy-as-code-opa-conftest.md
#            docs/adr/0005-trunk-based-with-release-branches.md
# SOP:       sops/SOP-002-release-process.md  (the human release procedure delegates
#            its "production deploy is gated" step to this policy)
# Input:     a deploy/pipeline descriptor, e.g.
#   {
#     "environment": "prod",        # target environment (prod|staging|dev)
#     "branch": "main",             # ref the pipeline runs on
#     "event": "tag",               # trigger event (tag|push|pull_request|manual)
#     "tag": "v1.4.0",              # release tag, when event == "tag"
#     "review": {"approved": true, "approvals": 2},
#     "actor": "alex"
#   }
#
# Contract (identical for the GitHub Actions and Woodpecker adapters — see
# docs/00-overview.md §4): a production deploy is allowed ONLY from `main`, ONLY on a
# `tag` event, ONLY with an approved review. Everything else is denied with a message.
package standards.ci.deploy

import rego.v1

import data.standards.lib

# Treat these environment names as production.
prod_envs := {"prod", "production"}

is_prod if {
	prod_envs[lower(input.environment)]
}

# Non-release branch prefixes that must never deploy to production.
nonrelease_prefixes := {"feature/", "feat/", "fix/", "hotfix/", "wip/", "dependabot/", "renovate/"}

# --- Production guardrails ---------------------------------------------------

# Prod deploys must originate from the trunk branch `main`.
deny contains msg if {
	is_prod
	input.branch != "main"
	msg := sprintf("prod deploy must run on branch 'main', got '%v' (see SOP-002, ADR-0005)", [input.branch])
}

# Prod deploys must be triggered by a release tag event, not an ad-hoc push/PR/manual run.
deny contains msg if {
	is_prod
	input.event != "tag"
	msg := sprintf("prod deploy must be triggered by a 'tag' event, got '%v' (see SOP-002)", [input.event])
}

# The release tag itself must follow the vX.Y.Z convention.
deny contains msg if {
	is_prod
	input.event == "tag"
	not lib.is_semver(input.tag)
	msg := sprintf("prod release tag '%v' is not SemVer 'vX.Y.Z' (see ADR-0005)", [input.tag])
}

# Prod deploys require a recorded, approved review.
deny contains msg if {
	is_prod
	not review_approved
	msg := "prod deploy requires an approved review (review.approved == true)"
}

review_approved if {
	input.review.approved == true
}

# Feature/throwaway branches must never reach production, regardless of other fields.
deny contains msg if {
	is_prod
	some prefix in nonrelease_prefixes
	startswith(input.branch, prefix)
	msg := sprintf("branch '%v' may not deploy to prod (non-release branch prefix)", [input.branch])
}

# --- Staging guardrails (lighter) -------------------------------------------

# Staging may deploy from main or develop, but never from a pull_request event
# (PR builds are untrusted and must not push to a shared environment).
deny contains msg if {
	lower(input.environment) == "staging"
	input.event == "pull_request"
	msg := "staging deploy must not run on a 'pull_request' event (untrusted ref)"
}

# --- Advisory ---------------------------------------------------------------

# Warn when a prod deploy is approved by a single reviewer; SOP-002 recommends >=2.
warn contains msg if {
	is_prod
	review_approved
	count_approvals < 2
	msg := sprintf("prod deploy approved by only %v reviewer(s); SOP-002 recommends >= 2", [count_approvals])
}

count_approvals := n if {
	n := input.review.approvals
}

count_approvals := 1 if {
	not input.review.approvals
	input.review.approved == true
}
