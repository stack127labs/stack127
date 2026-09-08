# Brief: CAA Policy Checker

## September 6 content maintenance

Keep the inheritance explanation and field table. Clarify that an empty issuer does not override another authorization, link the CAA standard, and describe remote-query limits. The database remains the only live prose source. Keep the current tool behavior and publication state unchanged.

## Who is here

A domain owner or certificate operator needs to know which certificate authorities may issue for one hostname, including wildcard issuance and inherited policy.

## The job

They leave with the effective CAA policy, the exact lookup path that produced it, and a clear distinction between normal and wildcard issuance.

## Show vs say

The form and conclusion come first. A compact tree shows requested names, aliases, and parent lookup levels; tables carry every policy record and raw response. Sentences explain inheritance, `issuewild`, malformed records, and why an allowed authority is not an issuance promise.
