/**
 * Domain status codes.
 *
 * RDAP does not return EPP codes verbatim. It returns values from the IANA RDAP
 * JSON Values registry, which are lowercase and space separated, so a registry
 * returns "client transfer prohibited" where a registrar dashboard or an old
 * WHOIS output shows "clientTransferProhibited". Readers arrive having seen the
 * camel case spelling, so both are kept.
 */

export type StatusGroup = "normal" | "registrar_lock" | "registry_lock" | "in_progress" | "lifecycle";

export type StatusCode = {
  rdap: string;
  epp: string | null;
  group: StatusGroup;
  /** What it means, in one sentence, for someone who has not seen it before. */
  meaning: string;
  /** What to do about it, or null when there is nothing to do. */
  action: string | null;
  /** True when this code stops the domain resolving in DNS. */
  removesFromDns?: boolean;
};

export const STATUS_CODES: StatusCode[] = [
  {
    rdap: "active",
    epp: "ok",
    group: "normal",
    meaning: "The domain is registered and nothing is restricting it. EPP calls this ok and RDAP calls it active.",
    action: null,
  },
  {
    rdap: "inactive",
    epp: "inactive",
    group: "normal",
    meaning: "The domain has no nameservers on record, so nothing can resolve under it. The registration itself is fine.",
    action: "Add nameservers at your registrar or DNS host if the domain is meant to be in use.",
  },

  {
    rdap: "client transfer prohibited",
    epp: "clientTransferProhibited",
    group: "registrar_lock",
    meaning: "Your registrar has locked the domain against moving to another registrar. This is the normal lock most registrars apply by default, and it is a good thing.",
    action: "Turn it off in your registrar account, usually shown as a domain lock, when you actually want to transfer.",
  },
  {
    rdap: "client update prohibited",
    epp: "clientUpdateProhibited",
    group: "registrar_lock",
    meaning: "Your registrar has locked the record against changes, including nameservers and contacts.",
    action: "Remove it in your registrar account before editing the domain.",
  },
  {
    rdap: "client delete prohibited",
    epp: "clientDeleteProhibited",
    group: "registrar_lock",
    meaning: "Your registrar has blocked deletion of the domain. It is a safety catch against losing a name by accident.",
    action: null,
  },
  {
    rdap: "client renew prohibited",
    epp: "clientRenewProhibited",
    group: "registrar_lock",
    meaning: "Your registrar has blocked manual renewal. It is uncommon and usually means a billing or account issue.",
    action: "Contact your registrar, because this one can quietly lead to losing the domain.",
  },
  {
    rdap: "client hold",
    epp: "clientHold",
    group: "registrar_lock",
    meaning: "Your registrar has told the registry to stop publishing the domain in DNS. The registration is valid but the site and email go dark.",
    action: "Contact your registrar. This is almost always unpaid invoices or unverified contact details.",
    removesFromDns: true,
  },

  {
    rdap: "server transfer prohibited",
    epp: "serverTransferProhibited",
    group: "registry_lock",
    meaning: "The registry itself has blocked transfers. It can come from a dispute, a court order, registry policy, or a security lock you asked for.",
    action: "Ask your registrar to find out why. You cannot remove this yourself.",
  },
  {
    rdap: "server update prohibited",
    epp: "serverUpdateProhibited",
    group: "registry_lock",
    meaning: "The registry has blocked changes to the record.",
    action: "Ask your registrar. You cannot remove this yourself.",
  },
  {
    rdap: "server delete prohibited",
    epp: "serverDeleteProhibited",
    group: "registry_lock",
    meaning: "The registry has blocked deletion. It is often applied to domains in a dispute, and also to some reserved names.",
    action: null,
  },
  {
    rdap: "server renew prohibited",
    epp: "serverRenewProhibited",
    group: "registry_lock",
    meaning: "The registry has blocked renewal, which usually means the domain is on its way out.",
    action: "Ask your registrar urgently if you want to keep the name.",
  },
  {
    rdap: "server hold",
    epp: "serverHold",
    group: "registry_lock",
    meaning: "The registry has stopped publishing the domain in DNS. The site and email go dark while the registration still exists.",
    action: "Ask your registrar why. This is usually a legal or abuse action.",
    removesFromDns: true,
  },

  {
    rdap: "pending create",
    epp: "pendingCreate",
    group: "in_progress",
    meaning: "A registration request has been made and the registry has not finished it.",
    action: null,
  },
  {
    rdap: "pending transfer",
    epp: "pendingTransfer",
    group: "in_progress",
    meaning: "A transfer to another registrar is under way. Transfers usually complete in up to five days.",
    action: "If you did not start this, contact your registrar immediately, because a transfer can be refused while it is pending.",
  },
  {
    rdap: "pending update",
    epp: "pendingUpdate",
    group: "in_progress",
    meaning: "A change to the record is being processed.",
    action: null,
  },
  {
    rdap: "pending renew",
    epp: "pendingRenew",
    group: "in_progress",
    meaning: "A renewal has been requested and the registry has not finished applying it. The new expiry date appears once it completes.",
    action: null,
  },
  {
    rdap: "pending restore",
    epp: "pendingRestore",
    group: "in_progress",
    meaning: "Someone has asked to bring the domain back from redemption and the registry is processing it.",
    action: null,
  },
  {
    rdap: "pending delete",
    epp: "pendingDelete",
    group: "lifecycle",
    meaning: "The domain is in the last stage before release. It can no longer be restored, and after about five days anyone can register it.",
    action: "Nothing can be done at this point. If you want the name, it becomes available when this ends.",
  },

  {
    rdap: "add period",
    epp: "addPeriod",
    group: "lifecycle",
    meaning: "The domain was registered very recently. Deleting it during this short window usually gets a refund.",
    action: null,
  },
  {
    rdap: "auto renew period",
    epp: "autoRenewPeriod",
    group: "lifecycle",
    meaning: "The registry renewed the domain automatically when it expired. Your registrar now decides whether to bill you or delete it, and it has up to 45 days to choose.",
    action: "Renew through your registrar if you want to keep it. Do not read this as the domain being safe.",
  },
  {
    rdap: "renew period",
    epp: "renewPeriod",
    group: "lifecycle",
    meaning: "The domain was renewed recently. Deleting it in this window may get a refund.",
    action: null,
  },
  {
    rdap: "transfer period",
    epp: "transferPeriod",
    group: "lifecycle",
    meaning: "The domain moved registrar recently.",
    action: null,
  },
  {
    rdap: "redemption period",
    epp: "redemptionPeriod",
    group: "lifecycle",
    meaning: "The domain was deleted and is being held for about 30 days. The previous owner can still get it back by paying a redemption fee, and nobody else can register it.",
    action: "If it was yours, contact your registrar now. Restoring costs considerably more than a renewal.",
  },
];

const byRdap = new Map(STATUS_CODES.map((code) => [code.rdap, code]));
const byEpp = new Map(STATUS_CODES.filter((code) => code.epp).map((code) => [code.epp as string, code]));

/** Registries occasionally publish values outside the registry. Show those as returned. */
export function lookupStatus(value: string): StatusCode | null {
  const trimmed = value.trim();
  return byRdap.get(trimmed.toLowerCase()) ?? byEpp.get(trimmed) ?? null;
}

export function eppSpellingFor(rdapValue: string): string | null {
  return lookupStatus(rdapValue)?.epp ?? null;
}

export const STATUS_GROUP_TITLES: Record<StatusGroup, string> = {
  normal: "Nothing is wrong",
  registrar_lock: "Locks your registrar set, which you can usually remove",
  registry_lock: "Locks the registry set, which you cannot remove",
  in_progress: "Something is in progress",
  lifecycle: "Where the domain sits in its life cycle",
};
