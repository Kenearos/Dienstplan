#!/usr/bin/env bash
#
# policy-gate.sh — vendored standards policy gate.
#
# Runs the standard's Rego policies (vendored at .standards/policies/) against this
# repo's manifests with conftest. Auto-detects artifact types and applies the right
# parser + namespace so policies never cross-fire:
#   *.container          -> --parser ini       --namespace standards.quadlet.security
#   Containerfile*/Dockerfile* -> --parser dockerfile --namespace standards.containerfile.hardening
#   deploy/deploy-descriptor.json -> --namespace standards.ci.deploy / standards.ci.image
#
# Fails (exit 1) only on a policy `deny`; `warn`s are reported but do not block —
# this is the "gates over gatekeepers" model (see the standard's docs/00-overview.md).
# Part of the standard; do NOT edit by hand — re-run adopt-standard.sh to update.
set -euo pipefail
shopt -s nullglob globstar

POL=".standards/policies"
rc=0

if [[ ! -d "${POL}" ]]; then
  echo "policy-gate: ${POL} not found — run adopt-standard.sh to vendor the policies." >&2
  exit 2
fi

run() {  # run <label> <conftest-args...>
  local label="$1"; shift
  echo "== ${label}"
  conftest test "$@" -p "${POL}" || rc=1
}

# Quadlet systemd units.
quadlets=( **/*.container )
if (( ${#quadlets[@]} )); then
  run "quadlet policy (${#quadlets[@]} unit(s))" \
    "${quadlets[@]}" --parser ini --namespace standards.quadlet.security
fi

# Containerfiles / Dockerfiles.
cfiles=( Containerfile* **/Containerfile* Dockerfile* **/Dockerfile* )
if (( ${#cfiles[@]} )); then
  run "containerfile policy (${#cfiles[@]} file(s))" \
    "${cfiles[@]}" --parser dockerfile --namespace standards.containerfile.hardening
fi

# Optional deploy descriptor for the CI/deploy/image policies.
if [[ -f deploy/deploy-descriptor.json ]]; then
  run "ci policy (deploy descriptor)" \
    deploy/deploy-descriptor.json \
    --namespace standards.ci.deploy --namespace standards.ci.image
fi

if (( rc == 0 )); then
  echo "policy gate: PASS"
else
  echo "policy gate: FAIL (a deny rule fired — see above)" >&2
fi
exit "${rc}"
