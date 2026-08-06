# Domain Transfer Readiness

Route: `/transfer-readiness`

Publication state: controlled by the exact `transfer-readiness` row in `public.version127_pages`.

Status: plan.

## Purpose

Answer one practical question: can this domain be transferred to another registrar right now, and if not, what is blocking it?

The pieces of the answer are public but scattered. Registrars explain their own transfer process, ICANN publishes the policy, and domain tools print status codes without connecting them to a transfer. This page assembles them into one answer and is explicit about the parts it cannot see.

## Input

One domain name, normalized as elsewhere.

There is no second input. Everything we can check is public, and everything we cannot check is in the reader's registrar account. That split defines the page.

## What the result shows

Lead with the conclusion in a sentence, then the evidence for it as an ordered list of checks.

```
version127.com cannot be transferred right now. Its registrar has set client
transfer prohibited, the standard domain lock, which you can remove yourself
in your registrar account. It was also registered on 3 July 2026, and ICANN
policy blocks a transfer for a period after registration.
```

The checks, each shown as a finding with its evidence, following the finding pattern already used by Nameserver Delegation Checker:

**Transfer locks.** `client transfer prohibited` from the registrar, removable by the reader. `server transfer prohibited` from the registry, not removable by the reader. `pending transfer`, meaning one is already in progress. `pending delete` or `redemption period`, meaning transfer is not possible at all.

**Time since registration.** Show the registration date, the elapsed time, and the result under the policy currently in force. See the policy section below for how that is computed and versioned.

**Time since a previous transfer.** `transfer` is a registered RDAP event action, so when a registry publishes it we can date the last registrar change and evaluate the lock properly. It is optional and many registries omit it. When it is absent, say the domain's transfer history is not published rather than implying no transfer has occurred. Absence is unknown, never zero.

**Expiry proximity.** Show days until expiry. Transfers near expiry are risky because the transfer takes up to five days and registrars vary in whether they allow one at all in the final stretch. Frame it as a risk, not a block.

**DNSSEC.** When `delegationSigned` is true, a transfer can break resolution if the DS record is not handled at both ends. Link to DNSSEC Chain Checker. This is the most commonly missed transfer failure and it belongs here.

**Nameservers.** Show the registry nameservers, and note that a transfer does not move DNS hosting. Domains go dark after a transfer when the old registrar was also the DNS host. Link to Nameserver Delegation Checker.

**Registrant email.** Not visible to us because of redaction. Say that the transfer authorization goes to the registrant email on record, and that an outdated one is the most common reason a transfer stalls.

Then, separately and clearly labelled, the things we cannot check at all: auth code availability, registrar account access, unpaid balance, whether the registrar's own transfer-out process has extra steps.

## Policy accuracy: version the rule, do not freeze it

The transfer lock periods are changing, and the tool has to handle a policy that is adopted but not yet in force. Verified against primary sources on 28 July 2026:

- The **currently effective** ICANN Transfer Policy applies a 60 day lock after a new registration, after a transfer between registrars, and after a change of registrant.
- The Transfer Policy Review working group reached consensus on 47 recommendations, and the **GNSO Council approved all 47 on 12 March 2025**.
- The **ICANN Board adopted them on 7 June 2026**, in resolution `2026.06.07.04`, directing implementation "subject to prioritization" and taking the feasibility assessment into account.
- Implementation has **not** happened. The resolution rationale describes drafting policy with an Implementation Review Team and producing a separate Change of Registrant Data policy. The approved resolutions page states no effective date.
- When implemented, the registration and transfer locks become 720 hours, which is 30 days, and the change of registrant lock is removed.

So the tool does compute a present-policy result. Refusing to answer would be its own kind of inaccuracy, since the 60 day rule is genuinely in force today.

`lib/domain/transfer-policy.ts` holds this as a versioned rule set, not a constant:

- Each policy version carries its lock durations, an effective date or `null` when not yet in force, and the source URL and verification date.
- The engine selects the version in force at request time and names it in the result.
- The adopted-but-pending version is present in the file with `effectiveDate: null`, so switching over is a one line change and the history stays readable.
- A test asserts that exactly one version is in force and that every version carries a source and a verification date.

On the page, state which policy version the answer used, and note that a shorter lock has been adopted and is awaiting implementation. Do not print a specific future date on which a lock lifts: registrars apply the clock from different reference points, and the pending change makes any projected date unreliable. Give the elapsed time, the rule applied, and let the reader see the arithmetic.

Getting this wrong is how the page becomes actively harmful. A reader planning around a wrong date misses a renewal.

## Engine

One registry RDAP query, optionally the registrar hop for the abuse and contact route. No new data source. The value is entirely in the composition, which is why it comes after the basic tools are built.

Each check produces a finding with a state of blocked, risk, ok, or unknown, plus the evidence it came from. Unknown is a first-class state here and appears often. Never collapse a set of findings into a score, a percentage, or a single badge.

## What this tool cannot do

- **It cannot always see a previous transfer.** The `transfer` event is optional and many registries omit it. When it is missing, a lock from a prior transfer is invisible to us and the page says the history is not published.
- **It cannot see a change of registrant**, so a lock arising from one is invisible. That lock is removed by the adopted policy but is still in force today.
- **It cannot get you an auth code.** That is in the registrar account and is deliberately not public.
- **It cannot see your registrar account state**, including unpaid invoices, unverified contact email, or an account level lock the registrar applies outside EPP.
- **It cannot start or complete a transfer.**
- **It cannot tell you the exact date a lock lifts**, both because the policy is mid-change and because registrars apply it from different reference points.
- **It cannot check a TLD with no RDAP service**, and ccTLD transfer rules are entirely their own. `.uk`, `.de`, and `.nl` all work differently from gTLDs and none of the ICANN policy above applies to them. Read coverage from `coverageSummary()`; do not hardcode a count.

## What the page must tell the reader

- Which blockers they can clear themselves and which they cannot. This is the most useful distinction on the page.
- That the tool sees public registry data only, with an explicit list of the things it cannot see.
- Which policy version the answer used, and that ICANN adopted a shorter lock on 7 June 2026 that has not yet been implemented.
- That a transfer does not move DNS hosting or email, and that this is the most common way a transfer takes a site down.
- That DNSSEC needs handling on both sides.
- That ccTLDs do not follow this policy.

## Content flow

1. Title and a paragraph on what the tool checks and what it cannot see.
2. The form.
3. The conclusion, then the findings with evidence, then the explicit list of unchecked items.
4. One divider.
5. What a transfer actually involves, as a short sequence: unlock, get the auth code, start it at the new registrar, approve the email, wait up to five days.
6. The blockers explained in the order people hit them.
7. What breaks after a transfer, specifically DNS hosting, email, and DNSSEC, with links to the DNS tools.
8. A short note that ccTLDs are different, with two named examples.
9. Coverage, freshness, privacy, and links to EPP Status Code Explainer and Domain Registration Lookup.
