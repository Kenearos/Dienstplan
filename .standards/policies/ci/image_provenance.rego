# Image provenance: every image a pipeline pulls or deploys must come from a trusted
# registry and carry an immutable, convention-conformant tag.
#
# Enforces:  docs/adr/0004-policy-as-code-opa-conftest.md
#            docs/adr/0008-container-runtime-podman-quadlet.md
# SOP:       sops/SOP-002-release-process.md  (release publishes `image:vX.Y.Z`)
# Input:     a descriptor carrying one or more image references plus the target env:
#   {
#     "environment": "prod",
#     "images": ["ghcr.io/acme/api:v1.4.0", "docker.io/library/redis:7.2.4"]
#   }
#   A single image may also be given as: { "image": "ghcr.io/acme/api:v1.4.0", ... }.
#
# Rules:
#   deny  - image from a registry not on the allow-list (standards.lib.trusted_registries)
#   deny  - image tag is neither SemVer vX.Y.Z nor a digest/sha pin
#   deny  - moving tag (`latest`, `edge`, ...) used in a production environment
#   warn  - moving tag used in a non-prod environment (tolerated, flagged)
package standards.ci.image

import rego.v1

import data.standards.lib

prod_envs := {"prod", "production"}

is_prod if {
	prod_envs[lower(input.environment)]
}

# Normalise: collect every image reference whether given as `images[]` or `image`.
images contains ref if {
	ref := input.images[_]
}

images contains ref if {
	ref := input.image
	is_string(ref)
}

# --- Provenance: trusted registry only --------------------------------------

deny contains msg if {
	some ref in images
	not lib.trusted_registry(ref)
	parts := lib.split_image(ref)
	msg := sprintf("image '%v' comes from untrusted registry '%v' (allow-list: %v)", [ref, parts.registry, lib.trusted_registries])
}

# --- Tag convention: pinned (SemVer or digest) ------------------------------

deny contains msg if {
	some ref in images
	parts := lib.split_image(ref)
	not lib.is_pinned_tag(parts.tag)

	# `latest` gets its own, clearer message below; don't double-report it here.
	not lib.is_mutable_tag(parts.tag)
	msg := sprintf("image '%v' tag '%v' is not a pinned reference (expected vX.Y.Z or a sha digest)", [ref, parts.tag])
}

# --- Moving tags: hard-deny in prod, warn elsewhere -------------------------

deny contains msg if {
	is_prod
	some ref in images
	parts := lib.split_image(ref)
	lib.is_mutable_tag(parts.tag)
	msg := sprintf("image '%v' uses moving tag '%v' in a production environment (pin to vX.Y.Z or a digest)", [ref, parts.tag])
}

warn contains msg if {
	not is_prod
	some ref in images
	parts := lib.split_image(ref)
	lib.is_mutable_tag(parts.tag)
	msg := sprintf("image '%v' uses moving tag '%v'; acceptable in '%v' but pin before promoting to prod", [ref, parts.tag, input.environment])
}
