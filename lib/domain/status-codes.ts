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
    meaning: "No nameserver delegation is associated with the domain, so it will not resolve in DNS. The registration itself may still be active.",
    action: "Add nameservers at your registrar or DNS host if the domain is meant to be in use.",
    removesFromDns: true,
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
    meaning: "Your registrar blocked renewal, usually for a legal dispute or because the domain is set for deletion.",
    action: "Contact your registrar to learn why renewal is blocked and what to do next.",
  },
  {
    rdap: "client hold",
    epp: "clientHold",
    group: "registrar_lock",
    meaning: "Your registrar has told the registry not to publish the domain in DNS. The registration may still exist, but the site and email will not resolve.",
    action: "Contact your registrar to find out why the hold was set and how to remove it.",
    removesFromDns: true,
  },

  {
    rdap: "server transfer prohibited",
    epp: "serverTransferProhibited",
    group: "registry_lock",
    meaning: "The registry has blocked transfers. Common reasons include disputes, your request, or a redemption period.",
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
    meaning: "The registry blocked deletion, usually for a legal dispute, your request, or a redemption period.",
    action: null,
  },
  {
    rdap: "server renew prohibited",
    epp: "serverRenewProhibited",
    group: "registry_lock",
    meaning: "The registry has told your registrar not to renew the domain. This may be due to a dispute or because the domain is subject to deletion.",
    action: "Contact your registrar promptly to learn why renewal is blocked and whether you can keep the domain.",
  },
  {
    rdap: "server hold",
    epp: "serverHold",
    group: "registry_lock",
    meaning: "The registry has stopped publishing the domain in DNS. The site and email go dark while the registration still exists.",
    action: "Ask your registrar why it was set and how to remove it.",
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
    meaning: "A request to transfer the domain to another registrar is being processed.",
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
    meaning: "After redemption ends without a restore, the domain stays pending deletion for several days before the registry releases it.",
    action: "Contact your registrar immediately if you want to keep the domain; options may be limited.",
  },

  {
    rdap: "add period",
    epp: "addPeriod",
    group: "lifecycle",
    meaning: "Recently registered. If deleted during this window, the registry may credit the registrar.",
    action: null,
  },
  {
    rdap: "auto renew period",
    epp: "autoRenewPeriod",
    group: "lifecycle",
    meaning: "The registry renewed the domain automatically after expiry. Your registrar may still delete it during the auto-renew grace period.",
    action: "Contact your registrar to confirm whether you need to renew or pay to keep it.",
  },
  {
    rdap: "renew period",
    epp: "renewPeriod",
    group: "lifecycle",
    meaning: "Recently renewed. If deleted during this window, the registry credits the registrar for the renewal.",
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
    action: "If it was yours, contact your registrar now to ask about restoring it.",
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
