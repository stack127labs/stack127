# DNSSEC Chain Checker

Route: `/dns-tools/dnssec-checker`

Publication state: controlled by the exact `dns-tools/dnssec-checker` row in `public.version127_pages`.

The user enters a name and one ordinary answer type. The pure-TypeScript `@namefi/dnssec-audit` validator fetches the chain through a fixed DNS-over-HTTPS endpoint and verifies it from the root trust anchor. The result is secure, insecure, bogus, or indeterminate. Never derive that verdict from an AD flag alone.

The main result is the validator's real outcome and ordered `WalkStep` list. Preserve `secure-positive`, `secure-nodata`, and `secure-nxdomain` so the UI can distinguish a signed record, a signed proof that the type is absent, and a signed proof that the name is absent. Show the requested answer separately. Do not replace these results with a generic count of DS and DNSKEY records.

The page also retrieves DS and DNSKEY evidence for each zone in the chain. Those resolver responses help explain the result but do not replace validation. Keep the complete structured validator report as JSON and offer it as a download. If the validator is missing or cannot finish, return indeterminate instead of guessing. Show a favicon for the checked hostname when it loads.

The validator supports the current RSA/SHA-256, RSA/SHA-512, ECDSA P-256, ECDSA P-384, and Ed25519 DNSKEY algorithms. If it cannot handle an algorithm or complete the chain, return indeterminate instead of guessing.

The explanation must cover what the validator actually checks, what each verdict means, how DS, DNSKEY, and RRSIG connect, and where to start when a result is bogus. DNSSEC validates a specific answer or proof, not a generic domain health badge.

Show the inception and expiration time for each RRSIG used by the validator, along with the covered record type, signer, algorithm, key tag, and time remaining. Each signed record set has its own validity window, so the page must not invent one domain-wide DNSSEC expiry date.
