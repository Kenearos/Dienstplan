# Containerfile / Dockerfile hardening for the mypods image builds.
#
# Enforces:  docs/adr/0004-policy-as-code-opa-conftest.md
#            docs/adr/0008-container-runtime-podman-quadlet.md
# SOP:       sops/SOP-002-release-process.md  (images are built then published)
# Input:     a parsed Containerfile as an ordered list of instructions:
#   {
#     "instructions": [
#       {"cmd": "FROM", "value": "archlinux:latest"},
#       {"cmd": "ARG",  "value": "API_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx"},
#       {"cmd": "USER", "value": "app"},
#       {"cmd": "RUN",  "value": "pacman -Syu"}
#     ]
#   }
#   `cmd` is the instruction; `value` is the remainder of the line.
#   (A frontend such as `dockerfile_parse` or a small awk shim produces this shape;
#    conftest's built-in Dockerfile parser yields a compatible `Cmd`/`Value` form,
#    handled by the accessor helpers below.)
#
# Rules:
#   deny  - a secret-looking value baked into ARG or ENV
#   warn  - a FROM with an unpinned/moving base tag (no tag, or :latest)
#   warn  - the final effective user is root (no non-root USER set)
package standards.containerfile.hardening

import rego.v1

import data.standards.lib

# _is_containerfile gates every rule below so this package only fires on inputs that
# are actually parsed Containerfiles. The expected shape carries an `instructions`
# ARRAY (our {cmd,value} list, or conftest's Dockerfile parser output). Without this
# guard, an unrelated YAML object (e.g. a k8s manifest with no `instructions`) would
# spuriously trip the "never sets a non-root USER" warn under conftest --all-namespaces.
_is_containerfile if {
	is_array(input.instructions)
}

# Normalise instructions: accept either our {cmd,value} shape or conftest's
# {Cmd, Value:[...]} Dockerfile-parser shape. Keyed by index to preserve order.
instructions[i] := inst if {
	some i
	raw := input.instructions[i]
	inst := {"cmd": _cmd_of(raw), "value": _value_of(raw)}
}

_cmd_of(raw) := c if {
	raw.cmd
	c := upper(raw.cmd)
}

_cmd_of(raw) := c if {
	not raw.cmd
	c := upper(raw.Cmd)
}

_value_of(raw) := v if {
	is_string(raw.value)
	v := raw.value
}

_value_of(raw) := v if {
	not raw.value
	is_array(raw.Value)
	v := concat(" ", raw.Value)
}

_value_of(raw) := v if {
	not raw.value
	is_string(raw.Value)
	v := raw.Value
}

# --- Secrets baked into the image (ARG / ENV) -------------------------------

deny contains msg if {
	_is_containerfile
	some i
	inst := instructions[i]
	{"ARG", "ENV"}[inst.cmd]
	parts := split(inst.value, "=")
	count(parts) >= 2
	val := concat("=", array.slice(parts, 1, count(parts)))
	lib.looks_like_secret_value(trim_space(val))
	msg := sprintf("%v sets '%v' to a secret-looking value; never bake secrets into an image layer (SOP-005)", [inst.cmd, parts[0]])
}

# Also catch a secret-NAMED ARG/ENV with a non-placeholder literal value.
deny contains msg if {
	_is_containerfile
	some i
	inst := instructions[i]
	{"ARG", "ENV"}[inst.cmd]
	parts := split(inst.value, "=")
	count(parts) >= 2
	key := parts[0]
	lib.looks_like_secret_name(key)
	val := trim_space(concat("=", array.slice(parts, 1, count(parts))))
	not lib.is_placeholder(val)
	val != ""
	msg := sprintf("%v '%v' is secret-named with an inline value; pass secrets at runtime, not in the image (SOP-005)", [inst.cmd, key])
}

# --- Unpinned base image -----------------------------------------------------

warn contains msg if {
	_is_containerfile
	some i
	inst := instructions[i]
	inst.cmd == "FROM"
	base := _from_image(inst.value)
	parts := lib.split_image(base)
	lib.is_mutable_tag(parts.tag)
	msg := sprintf("FROM '%v' uses an unpinned/moving base tag '%v'; pin to a SemVer or digest for reproducible builds", [base, parts.tag])
}

# --- Running as root ---------------------------------------------------------

# Warn when no non-root USER is ever declared: the build runs as root by default.
warn contains msg if {
	_is_containerfile
	not has_nonroot_user
	msg := "Containerfile never sets a non-root USER; the image runs as root by default — add `USER <non-root>` where the workload allows (ADR-0008)"
}

# Warn when the LAST USER instruction puts the runtime user back to root.
warn contains msg if {
	_is_containerfile
	last_user := _last_user
	last_user != ""
	lower(last_user) == "root"
	msg := "the final USER in the Containerfile is root; drop privileges before the image's default command runs (ADR-0008)"
}

# --- helpers ----------------------------------------------------------------

# _from_image(value) strips an `AS <stage>` suffix and `--platform=` flags from a FROM line.
_from_image(value) := img if {
	toks := split(trim_space(value), " ")
	img := _first_non_flag(toks)
}

_first_non_flag(toks) := t if {
	some i
	t := toks[i]
	not startswith(t, "--")

	# the image ref is the first non-flag token
	count([x | some j; x := toks[j]; j < i; not startswith(x, "--")]) == 0
}

# user_instructions: every USER value, keyed by its instruction index.
user_instructions[idx] := val if {
	some idx
	inst := instructions[idx]
	inst.cmd == "USER"
	val := trim_space(inst.value)
}

has_nonroot_user if {
	some idx
	val := user_instructions[idx]
	lower(val) != "root"
	val != ""
}

# _last_user returns the value of the last USER instruction, or "" if none.
_last_user := val if {
	idxs := [i | some i; user_instructions[i]]
	count(idxs) > 0
	max_idx := max(idxs)
	val := user_instructions[max_idx]
}

_last_user := "" if {
	count([i | some i; user_instructions[i]]) == 0
}
