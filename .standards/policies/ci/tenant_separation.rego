# Tenant (Mandant) separation: a deploy/manifest artifact belonging to one Mandant
# must never reference another Mandant's resources, paths, or age recipients.
#
# Enforces:  docs/adr/0006-multi-tenant-separation.md
# SOP:       sops/SOP-005-secrets-management.md  (per-Mandant SOPS+age key sets)
# Input:     a deploy/manifest descriptor carrying the owning Mandant and the
#            resources it references:
#   {
#     "mandant": "gmbh-a",
#     "resources": ["secrets-gmbh-a/db.env", "ops-gmbh-a/deploy.yml"],
#     "paths":     ["/srv/gmbh-a/data"],
#     "age_recipients": ["age1aaa...gmbh-a-key"]
#   }
#   `resources` and `paths` are referenced artifact paths; `age_recipients` are the
#   age public keys a SOPS-encrypted secret is sealed to.
#
# Model: every Mandant owns a namespace token `gmbh-<x>`. A reference is cross-tenant
# when it names ANOTHER Mandant's namespace (e.g. a `gmbh-b` path in a `gmbh-a`
# artifact) or an age recipient that is not in this Mandant's allowed recipient set.
#
# Rules (default-deny cross-tenant):
#   deny  - the artifact declares no Mandant (cannot be attributed -> reject)
#   deny  - a referenced resource/path names a foreign Mandant namespace
#   deny  - an age recipient is not on this Mandant's allowed set
package standards.ci.tenant

import rego.v1

import data.standards.lib

# Only evaluate inputs that are actually tenant descriptors (carry a Mandant marker).
# This keeps the package quiet under conftest --all-namespaces for unrelated inputs
# (k8s/compose/Quadlet objects), while still default-denying an unattributed artifact
# that DOES look like a tenant descriptor (has resources/paths/age_recipients).
_is_tenant_input if {
	lib.has_key(input, "mandant")
}

_is_tenant_input if {
	lib.has_key(input, "resources")
}

_is_tenant_input if {
	lib.has_key(input, "age_recipients")
}

# All known Mandant namespace tokens. Grounded in ADR-0006's example tenants; the
# set is the universe of foreign namespaces a reference may accidentally point at.
known_mandanten := {"gmbh-a", "gmbh-b"}

# The owning Mandant of this artifact, lower-cased, or "" when absent/empty.
# object.get with a default keeps this total even when the key is missing entirely,
# so the `mandant == ""` default-deny below fires for an unattributed artifact.
mandant := m if {
	raw := object.get(input, "mandant", "")
	lib.non_empty_string(raw)
	m := lower(raw)
}

mandant := "" if {
	raw := object.get(input, "mandant", "")
	not lib.non_empty_string(raw)
}

# Allowed age recipients for the owning Mandant (from input.allowed_age_recipients,
# keyed by Mandant). When the artifact provides no allow-list we cannot vouch for any
# recipient, so every declared recipient is treated as foreign (default-deny).
allowed_recipients := r if {
	all := object.get(input, "allowed_age_recipients", {})
	r := object.get(all, mandant, [])
}

# Every referenced path/resource string, collected from the supported fields.
references contains ref if {
	ref := object.get(input, "resources", [])[_]
}

references contains ref if {
	ref := object.get(input, "paths", [])[_]
}

# --- Default-deny: an unattributed artifact ---------------------------------

deny contains msg if {
	_is_tenant_input
	mandant == ""
	msg := "artifact declares no 'mandant'; cross-tenant separation cannot be enforced — every Mandant artifact must be attributed (ADR-0006, SOP-005)"
}

# --- Cross-tenant reference: a foreign Mandant namespace --------------------

deny contains msg if {
	_is_tenant_input
	mandant != ""
	some ref in references
	is_string(ref)
	some foreign in known_mandanten
	foreign != mandant
	_references_namespace(ref, foreign)
	msg := sprintf("mandant '%v' artifact references foreign tenant resource '%v' (matches '%v'); tenants must not share resources (ADR-0006, SOP-005)", [mandant, ref, foreign])
}

# --- Cross-tenant age recipient: not on this Mandant's allowed set ----------

deny contains msg if {
	_is_tenant_input
	mandant != ""
	some rcpt in object.get(input, "age_recipients", [])
	is_string(rcpt)
	not _recipient_allowed(rcpt)
	msg := sprintf("mandant '%v' seals a secret to age recipient '%v' which is not in its allowed recipient set; each Mandant must use only its own age keys (ADR-0006, SOP-005)", [mandant, rcpt])
}

# --- helpers ----------------------------------------------------------------

# _references_namespace(ref, ns) is true when a path/resource string carries the
# foreign Mandant namespace, either as a `secrets-<ns>` / `ops-<ns>` prefix or as a
# path segment `<ns>` anywhere in the reference.
_references_namespace(ref, ns) if {
	contains(lower(ref), sprintf("secrets-%v", [ns]))
}

_references_namespace(ref, ns) if {
	contains(lower(ref), sprintf("ops-%v", [ns]))
}

_references_namespace(ref, ns) if {
	parts := split(lower(ref), "/")
	parts[_] == ns
}

# _recipient_allowed(rcpt) is true when the age recipient is on this Mandant's set.
_recipient_allowed(rcpt) if {
	some allowed in allowed_recipients
	allowed == rcpt
}
