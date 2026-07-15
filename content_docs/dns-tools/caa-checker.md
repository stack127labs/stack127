# CAA Policy Checker

Route: `/dns-tools/caa-checker`

Publication state: controlled by the exact `dns-tools/caa-checker` row in `public.version127_pages`.

The input is the exact hostname a certificate will cover. Query its CAA records through a recursive resolver. If an alias has to be followed, query that alias target exactly. When neither the original name nor its alias yields a policy, resume the tree climb at the parent of the original certificate name. Do not climb through the alias target's parents. Stop at the first non-empty CAA record set. If one level fails, the policy is undetermined; do not silently skip upward.

Explain normal and wildcard issuance separately. `issuewild` overrides `issue` for wildcard requests; without `issuewild`, `issue` applies. A policy containing only `issuewild` does not restrict normal issuance. Preserve empty issuer values, additive issuers, the critical flag, unknown tags, and malformed records. Validate the syntax of `iodef` destinations without contacting them.

Each search level records whether it is the requested name, an alias, or a parent. Keep the raw response at that level. Show a favicon for the submitted hostname when one loads and export the effective records as CSV. Explain that this is a policy check, not certificate history or a promise that an allowed authority will issue.
