# Standard adoption by pin: a consuming repo must declare WHICH version of this
# standards bundle it has adopted, so drift between repos is visible and pinned.
#
# Enforces:  docs/adr/0007-adopt-by-pinned-version.md
# SOP:       sops/SOP-004-environment-setup.md  (scripts/adopt-standard.sh writes the pin)
# Input:     repo metadata carrying the adopted standards version:
#   {
#     "repo": "mypods/api",
#     "standards_version": "v1.4.0",
#     "current_version": "v1.6.0"   # optional: latest published standards version
#   }
#
# Rules:
#   deny  - `standards_version` is missing or not valid SemVer (vX.Y.Z)
#   warn  - the pinned version is behind the provided `current_version`
package standards.ci.adoption

import rego.v1

import data.standards.lib

# Only evaluate inputs that are actually adoption descriptors. An adoption descriptor
# is one that carries the pin field, OR a repo-metadata object that is expected to
# carry it. We gate on `standards_version` / `repo` so unrelated inputs
# (k8s/compose/Quadlet) stay silent under conftest --all-namespaces.
_is_adoption_input if {
	lib.has_key(input, "standards_version")
}

_is_adoption_input if {
	lib.has_key(input, "repo")
}

# --- The pin must be present and valid SemVer -------------------------------

deny contains msg if {
	_is_adoption_input
	not lib.has_key(input, "standards_version")
	msg := "repo declares no 'standards_version'; pin the adopted standards bundle to a SemVer 'vX.Y.Z' (ADR-0007, SOP-004)"
}

deny contains msg if {
	_is_adoption_input
	lib.has_key(input, "standards_version")
	not lib.is_semver(input.standards_version)
	msg := sprintf("standards_version '%v' is not valid SemVer 'vX.Y.Z'; adopt by pinning an immutable release (ADR-0007)", [input.standards_version])
}

# --- Advisory: the pin is behind the current published version --------------

warn contains msg if {
	lib.has_key(input, "current_version")
	lib.is_semver(input.standards_version)
	lib.is_semver(input.current_version)
	input.standards_version != input.current_version
	semver.compare(_strip_v(input.standards_version), _strip_v(input.current_version)) < 0
	msg := sprintf("standards_version '%v' is behind current '%v'; schedule an update via scripts/adopt-standard.sh (ADR-0007, SOP-004)", [input.standards_version, input.current_version])
}

# --- helpers ----------------------------------------------------------------

# _strip_v drops the leading `v` so OPA's semver.compare (which expects a bare
# SemVer core) can order the two pins.
_strip_v(tag) := out if {
	startswith(tag, "v")
	out := substring(tag, 1, -1)
}

_strip_v(tag) := tag if {
	not startswith(tag, "v")
}
