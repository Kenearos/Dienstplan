# Quadlet hardening: lint podctl/mypods `.container` units (systemd --user Quadlet)
# for safe-by-default container settings.
#
# Enforces:  docs/adr/0008-container-runtime-podman-quadlet.md
#            docs/adr/0004-policy-as-code-opa-conftest.md
# SOP:       sops/SOP-004-environment-setup.md  (provisioning Quadlet units)
# Input:     a parsed Quadlet INI as a nested object. Section headers ([Container],
#            [Service], [Unit]) are top-level keys; each maps to an object of its
#            directives. Directives that may legally repeat (AddDevice, GroupAdd,
#            Volume, PublishPort, Environment) are arrays; single-valued directives
#            are scalars. Example (from podctl preset llama-gpt-oss-120b.container):
#   {
#     "Container": {
#       "ContainerName": "llama-gpt-oss-120b",
#       "Image": "docker.io/kyuz0/amd-strix-halo-toolboxes:vulkan-radv",
#       "Pull": "never",
#       "AddDevice": ["/dev/kfd", "/dev/dri"],
#       "GroupAdd": ["video", "render"]
#     },
#     "Service": { "Restart": "on-failure", "TimeoutStopSec": "30" }
#   }
#
# Rules:
#   deny  - container is privileged (PrivilegedTrue / extreme cap grants)
#   deny  - no Restart= in [Service] (units must be self-healing)
#   warn  - User=root (rootless Podman is the target; running as root in-container is a smell)
#   warn  - AddDevice present without any GroupAdd (device access usually needs a group, e.g. render/video)
package standards.quadlet.security

import rego.v1

container := object.get(input, "Container", {})

service := object.get(input, "Service", {})

# _is_quadlet gates every rule below so this package only fires on inputs that are
# actually parsed Quadlet units. A Quadlet INI is recognised by the presence of a
# [Container] section (every .container unit has one) or a [Unit] section. Without
# this guard, an unrelated YAML object (e.g. a k8s manifest with no [Service].Restart)
# would spuriously trip the "missing Restart" deny under conftest --all-namespaces.
_is_quadlet if {
	_has_key(input, "Container")
}

_is_quadlet if {
	_has_key(input, "Unit")
}

# --- Privileged containers are forbidden ------------------------------------

deny contains msg if {
	_is_quadlet
	val := object.get(container, "PrivilegedTrue", "")
	lower(format_int_or_string(val)) == "true"
	msg := "Quadlet runs a privileged container (PrivilegedTrue=true); privileged mode is forbidden (ADR-0008)"
}

# Granting all capabilities is equivalent to privileged.
deny contains msg if {
	_is_quadlet
	caps := object.get(container, "AddCapability", [])
	some c in _as_array(caps)
	upper(c) == "ALL"
	msg := "Quadlet grants AddCapability=ALL; this is equivalent to privileged and is forbidden (ADR-0008)"
}

# --- A unit must declare a restart policy ------------------------------------

deny contains msg if {
	_is_quadlet
	not _has_key(service, "Restart")
	msg := "Quadlet [Service] has no Restart= directive; units must be self-healing (e.g. Restart=on-failure)"
}

# Restart=no defeats the purpose; treat it as a violation.
deny contains msg if {
	_is_quadlet
	lower(format_int_or_string(object.get(service, "Restart", ""))) == "no"
	msg := "Quadlet [Service] sets Restart=no; declare a real restart policy (e.g. on-failure / always)"
}

# --- Advisory: running as root inside the container --------------------------

warn contains msg if {
	_is_quadlet
	lower(format_int_or_string(object.get(container, "User", ""))) == "root"
	msg := "Quadlet sets User=root inside the container; prefer a non-root User= where the image allows it (ADR-0008)"
}

# --- Advisory: device access without a supplementary group -------------------

warn contains msg if {
	_is_quadlet
	devices := object.get(container, "AddDevice", [])
	count(_as_array(devices)) > 0
	groups := object.get(container, "GroupAdd", [])
	count(_as_array(groups)) == 0
	msg := "Quadlet uses AddDevice without any GroupAdd; device nodes (e.g. /dev/dri) usually require a supplementary group such as render/video"
}

# --- helpers ----------------------------------------------------------------

_has_key(obj, k) if {
	_ := obj[k]
}

# _as_array(x) normalises a scalar-or-array directive into an array, so rules can
# iterate uniformly whether a directive appeared once or many times.
_as_array(x) := x if {
	is_array(x)
}

_as_array(x) := [x] if {
	not is_array(x)
}

# format_int_or_string(x) stringifies scalars (Quadlet values may be parsed as
# numbers, e.g. TimeoutStopSec=30) so `lower`/`upper` never see a non-string.
format_int_or_string(x) := out if {
	is_string(x)
	out := x
}

format_int_or_string(x) := out if {
	not is_string(x)
	out := sprintf("%v", [x])
}
