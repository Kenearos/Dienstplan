# Shared helpers for the `standards` policy packages.
#
# Enforces (supports): docs/adr/0004-policy-as-code-opa-conftest.md
# Used by: standards.ci.*, standards.quadlet.*, standards.containerfile.*
#
# Keep this package side-effect free: ONLY pure helper functions/rules, no `deny`/`warn`.
# One concept per helper so the call sites in the policy files stay readable and testable.
#
# Written in Rego v1 (`import rego.v1`): rules use `contains`/`if`, which is what the
# installed OPA 1.x and conftest's bundled OPA require. The Conftest contract is
# unchanged — policies still expose `deny`/`warn` partial sets of message strings.
package standards.lib

import rego.v1

# ---------------------------------------------------------------------------
# Object / key helpers
# ---------------------------------------------------------------------------

# has_key(obj, k) is true when object `obj` contains key `k`.
has_key(obj, k) if {
	_ := obj[k]
}

# get_default(obj, k, fallback) returns obj[k] if present, else `fallback`.
get_default(obj, k, _) := v if {
	has_key(obj, k)
	v := obj[k]
}

get_default(obj, k, fallback) := v if {
	not has_key(obj, k)
	v := fallback
}

# non_empty_string(x) is true when x is a string with length > 0.
non_empty_string(x) if {
	is_string(x)
	count(x) > 0
}

# ---------------------------------------------------------------------------
# String helpers
# ---------------------------------------------------------------------------

# to_lower_safe(x) lower-cases a string; passes non-strings through unchanged so
# call sites can stay defensive about heterogeneous input.
to_lower_safe(x) := out if {
	is_string(x)
	out := lower(x)
}

to_lower_safe(x) := out if {
	not is_string(x)
	out := x
}

# contains_any(haystack, needles) is true if any needle is a substring of haystack.
contains_any(haystack, needles) if {
	some i
	contains(haystack, needles[i])
}

# ---------------------------------------------------------------------------
# Semver / tag helpers
# ---------------------------------------------------------------------------

# is_semver(tag) matches OUR release-tag convention `vX.Y.Z` (docs/00-overview.md:
# git tags `vX.Y.Z`). Pre-release/build suffixes are allowed, e.g. v1.2.3-rc.1 or
# v1.2.3+build.5. The leading `v` is REQUIRED — this is the form the deploy gate
# enforces on a release tag. For accepting third-party pins like `redis:7.2.4`,
# use is_pinned_tag (which also accepts a bare X.Y.Z).
is_semver(tag) if {
	regex.match(`^v[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.\-]+)?$`, tag)
}

# is_bare_semver(tag) matches a SemVer WITHOUT the leading `v`, e.g. `7.2.4`.
# Upstream images (redis, postgres, ...) tag this way; such a tag is still an
# immutable, reproducible pin even though it is not OUR `vX.Y.Z` release form.
is_bare_semver(tag) if {
	regex.match(`^[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.\-]+)?$`, tag)
}

# is_sha_tag(tag) matches an immutable content tag: a (short or long) hex digest,
# optionally `sha-` / `sha256-` / `sha256:` prefixed, e.g. `sha-1a2b3c4`,
# `sha256:...`, `a1b2c3d4`.
is_sha_tag(tag) if {
	regex.match(`^(sha-|sha256-|sha256:)?[0-9a-f]{7,64}$`, tag)
}

# is_pinned_tag(tag) is true when the tag is an immutable, reproducible reference:
# our `vX.Y.Z` release form, a bare upstream `X.Y.Z`, or a sha digest. Never a
# moving tag like `latest`.
is_pinned_tag(tag) if {
	is_semver(tag)
}

is_pinned_tag(tag) if {
	is_bare_semver(tag)
}

is_pinned_tag(tag) if {
	is_sha_tag(tag)
}

# is_mutable_tag(tag) flags the well-known moving tags that break reproducibility.
is_mutable_tag(tag) if {
	mutable := {"latest", "edge", "main", "master", "stable", "nightly", "dev"}
	mutable[lower(tag)]
}

# ---------------------------------------------------------------------------
# Image reference helpers
# ---------------------------------------------------------------------------

# split_image(ref) decomposes an image reference into {registry, repo, tag}.
# Rules (Docker/OCI semantics):
#   - if the first path segment contains a "." or a ":" (or is "localhost"),
#     it is the registry; otherwise the registry defaults to "docker.io".
#   - the tag is the part after the LAST ":" that is not part of the registry host.
# Digest pins (`@sha256:...`) are normalised so the digest is returned as the tag.
split_image(ref) := parts if {
	# Digest form: repo@sha256:hex
	contains(ref, "@")
	name := split(ref, "@")[0]
	digest := split(ref, "@")[1]
	reg := _registry_of(name)
	repo := _repo_of(name, reg)
	parts := {"registry": reg, "repo": repo, "tag": digest}
}

split_image(ref) := parts if {
	# Tagged form: [registry/]repo:tag (no digest)
	not contains(ref, "@")
	reg := _registry_of(ref)
	rest := _strip_registry(ref, reg)
	_has_tag(rest)
	repo := split(rest, ":")[0]
	tag := split(rest, ":")[1]
	parts := {"registry": reg, "repo": repo, "tag": tag}
}

split_image(ref) := parts if {
	# Untagged form: [registry/]repo  -> tag defaults to "latest" (Docker behaviour)
	not contains(ref, "@")
	reg := _registry_of(ref)
	rest := _strip_registry(ref, reg)
	not _has_tag(rest)
	parts := {"registry": reg, "repo": rest, "tag": "latest"}
}

# _has_tag is true when the repo portion (registry already stripped) carries a `:tag`.
_has_tag(rest) if {
	contains(rest, ":")
}

# _first_segment returns the substring before the first "/".
_first_segment(ref) := seg if {
	contains(ref, "/")
	seg := split(ref, "/")[0]
}

_first_segment(ref) := seg if {
	not contains(ref, "/")
	seg := ref
}

# _looks_like_host(seg) is true when a path segment is a registry host:
# it contains a "." (domain) or ":" (port) or equals "localhost".
_looks_like_host(seg) if {
	contains(seg, ".")
}

_looks_like_host(seg) if {
	contains(seg, ":")
}

_looks_like_host(seg) if {
	seg == "localhost"
}

# _registry_of(ref) returns the registry host, defaulting to docker.io.
_registry_of(ref) := reg if {
	seg := _first_segment(ref)
	_looks_like_host(seg)
	reg := seg
}

_registry_of(ref) := reg if {
	seg := _first_segment(ref)
	not _looks_like_host(seg)
	reg := "docker.io"
}

# _strip_registry(ref, reg) removes an explicit registry prefix, leaving repo[:tag].
_strip_registry(ref, reg) := rest if {
	startswith(ref, concat("", [reg, "/"]))
	rest := substring(ref, count(reg) + 1, -1)
}

_strip_registry(ref, reg) := rest if {
	not startswith(ref, concat("", [reg, "/"]))
	rest := ref
}

# _repo_of(name, reg) returns the repo path with any registry prefix removed.
_repo_of(name, reg) := repo if {
	repo := _strip_registry(name, reg)
}

# ---------------------------------------------------------------------------
# Trusted registry policy data
# ---------------------------------------------------------------------------

# trusted_registries is the allow-list of registries images may come from.
# Grounded in the ecosystem (docs/00-overview.md §3): our own GHCR namespace,
# the self-hosted Forgejo registry target, Docker Hub for vetted upstreams, and
# `mypods/*` first-party images that are built locally (registry resolves to docker.io).
trusted_registries := {
	"ghcr.io",
	"registry.forgejo.local",
	"docker.io",
	"localhost",
}

# trusted_registry(ref) is true when the image reference resolves to a registry on
# the allow-list above.
trusted_registry(ref) if {
	parts := split_image(ref)
	trusted_registries[parts.registry]
}

# ---------------------------------------------------------------------------
# Secret-shaped value detection
# ---------------------------------------------------------------------------

# secret_name_pattern matches env var NAMES that conventionally hold secrets.
secret_name_pattern := `(?i)(SECRET|PASSWORD|PASSWD|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY|PRIVATE[_-]?KEY|CREDENTIAL|PASSPHRASE)`

# looks_like_secret_name(name) flags an env key whose name implies a secret.
looks_like_secret_name(name) if {
	regex.match(secret_name_pattern, name)
}

# looks_like_secret_value(val) flags a VALUE that looks like an inlined secret:
# long high-entropy-ish strings, known token prefixes, or PEM private-key markers.
looks_like_secret_value(val) if {
	is_string(val)
	regex.match(`-----BEGIN [A-Z ]*PRIVATE KEY-----`, val)
}

looks_like_secret_value(val) if {
	is_string(val)

	# Common token prefixes: GitHub (ghp_/gho_/ghs_), Slack (xox...), AWS (AKIA...).
	regex.match(`^(gh[pousr]_[0-9A-Za-z]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|AKIA[0-9A-Z]{16})`, val)
}

looks_like_secret_value(val) if {
	is_string(val)

	# Long opaque string with no spaces -> likely a baked-in credential, not a flag.
	count(val) >= 24
	not contains(val, " ")
	regex.match(`^[A-Za-z0-9+/=_-]{24,}$`, val)
}

# is_placeholder(val) recognises references/placeholders that are NOT plaintext
# secrets: env-substitution (${VAR}, $VAR, %VAR%), Quadlet specifiers (%h), or the
# empty string. Used to avoid false positives on indirection.
is_placeholder(val) if {
	is_string(val)
	regex.match(`^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?$`, val)
}

is_placeholder(val) if {
	is_string(val)
	regex.match(`^%[A-Za-z_][A-Za-z0-9_]*%$`, val)
}

is_placeholder(val) if {
	val == ""
}
