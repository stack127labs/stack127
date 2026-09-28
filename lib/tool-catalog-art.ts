import { backup321Art } from "@/app/(site)/(catalogs)/_components/art/backup-321";
import { caaArt } from "@/app/(site)/(catalogs)/_components/art/caa";
import { cephArt } from "@/app/(site)/(catalogs)/_components/art/ceph";
import { chmodCalculatorArt } from "@/app/(site)/(catalogs)/_components/art/chmod-calculator";
import { dnsChangeArt } from "@/app/(site)/(catalogs)/_components/art/dns-change";
import { dnsLookupArt } from "@/app/(site)/(catalogs)/_components/art/dns-lookup";
import { dnsTraceArt } from "@/app/(site)/(catalogs)/_components/art/dns-trace";
import { dnssecArt } from "@/app/(site)/(catalogs)/_components/art/dnssec";
import { dockerComposeCheckerArt } from "@/app/(site)/(catalogs)/_components/art/docker-compose-checker";
import { domainAgeArt } from "@/app/(site)/(catalogs)/_components/art/domain-age";
import { domainAvailabilityArt } from "@/app/(site)/(catalogs)/_components/art/domain-availability";
import { domainExpiryArt } from "@/app/(site)/(catalogs)/_components/art/domain-expiry";
import { domainLookupArt } from "@/app/(site)/(catalogs)/_components/art/domain-lookup";
import { domainOwnerArt } from "@/app/(site)/(catalogs)/_components/art/domain-owner";
import { domainRegistrarArt } from "@/app/(site)/(catalogs)/_components/art/domain-registrar";
import { domainReportArt } from "@/app/(site)/(catalogs)/_components/art/domain-report";
import { driveReliabilityArt } from "@/app/(site)/(catalogs)/_components/art/drive-reliability";
import { eppStatusArt } from "@/app/(site)/(catalogs)/_components/art/epp-status";
import { ipAsnLookupArt } from "@/app/(site)/(catalogs)/_components/art/ip-asn-lookup";
import { kdpBookSetupCalculatorArt } from "@/app/(site)/(catalogs)/_components/art/kdp-book-setup-calculator";
import { kdpImageDpiCheckerArt } from "@/app/(site)/(catalogs)/_components/art/kdp-image-dpi-checker";
import { kdpMetadataCheckerArt } from "@/app/(site)/(catalogs)/_components/art/kdp-metadata-checker";
import { kdpPageCountEstimatorArt } from "@/app/(site)/(catalogs)/_components/art/kdp-page-count-estimator";
import { kdpPaymentDateCalculatorArt } from "@/app/(site)/(catalogs)/_components/art/kdp-payment-date-calculator";
import { kdpPdfPreflightCheckerArt } from "@/app/(site)/(catalogs)/_components/art/kdp-pdf-preflight-checker";
import { kdpRoyaltyCalculatorArt } from "@/app/(site)/(catalogs)/_components/art/kdp-royalty-calculator";
import { kdpToolsArt } from "@/app/(site)/(catalogs)/_components/art/kdp-tools";
import { lxcIdmapCheckerArt } from "@/app/(site)/(catalogs)/_components/art/lxc-idmap-checker";
import { mqttDiscoveryCheckerArt } from "@/app/(site)/(catalogs)/_components/art/mqtt-discovery-checker";
import { multiTldArt } from "@/app/(site)/(catalogs)/_components/art/multi-tld";
import { nameserverArt } from "@/app/(site)/(catalogs)/_components/art/nameserver";
import { pixelsToPrintSizeArt } from "@/app/(site)/(catalogs)/_components/art/pixels-to-print-size";
import { punycodeArt } from "@/app/(site)/(catalogs)/_components/art/punycode";
import { raidArt } from "@/app/(site)/(catalogs)/_components/art/raid";
import { raidzExpansionArt } from "@/app/(site)/(catalogs)/_components/art/raidz-expansion";
import { rebuildArt } from "@/app/(site)/(catalogs)/_components/art/rebuild";
import { resticRetentionSimulatorArt } from "@/app/(site)/(catalogs)/_components/art/restic-retention-simulator";
import { rsyncFilterTesterArt } from "@/app/(site)/(catalogs)/_components/art/rsync-filter-tester";
import { selfHostedAppResourcePlannerArt } from "@/app/(site)/(catalogs)/_components/art/self-hosted-app-resource-planner";
import { shortcutsCheatsheetGeneratorArt } from "@/app/(site)/(catalogs)/_components/art/shortcuts-cheatsheet-generator";
import { shrArt } from "@/app/(site)/(catalogs)/_components/art/shr";
import { snapraidMergerfsArt } from "@/app/(site)/(catalogs)/_components/art/snapraid-mergerfs";
import { soaArt } from "@/app/(site)/(catalogs)/_components/art/soa";
import { storageGrowthArt } from "@/app/(site)/(catalogs)/_components/art/storage-growth";
import { storageLayoutArt } from "@/app/(site)/(catalogs)/_components/art/storage-layout";
import { tldDirectoryArt } from "@/app/(site)/(catalogs)/_components/art/tld-directory";
import { transferReadinessArt } from "@/app/(site)/(catalogs)/_components/art/transfer-readiness";
import { unraidArt } from "@/app/(site)/(catalogs)/_components/art/unraid";
import { zfsCapacityArt } from "@/app/(site)/(catalogs)/_components/art/zfs-capacity";
import { zfsPaddingArt } from "@/app/(site)/(catalogs)/_components/art/zfs-padding";
import { siteSpotDnsToolsArt } from "@/app/(site)/art/site--spot-dns-tools";
import { siteSpotDomainToolsArt } from "@/app/(site)/art/site--spot-domain-tools";
import { siteSpotStorageToolsArt } from "@/app/(site)/art/site--spot-storage-tools";
import { siteSpotSelfHostAppsArt } from "@/app/(site)/art/site--spot-self-host-apps";
import { siteSpotLabsArt } from "@/app/(site)/art/site--spot-labs";
import { siteSpotHomeAssistantEnergyArt } from "@/app/(site)/art/site--spot-home-assistant-energy";
import { siteSpotKeyboardShortcutsArt } from "@/app/(site)/art/site--spot-keyboard-shortcuts";
import { siteSpotDockerignoreArt } from "@/app/(site)/art/site--spot-dockerignore";
import { siteSpotNfsFirewallArt } from "@/app/(site)/art/site--spot-nfs-firewall";
import { siteSpotNginxProxyPassArt } from "@/app/(site)/art/site--spot-nginx-proxy-pass";

/** Approved generated SVGs keyed by references stored in the content tables. */
const art: Record<string, string> = {
  "backup-321": backup321Art,
  "caa": caaArt,
  "ceph": cephArt,
  "chmod-calculator": chmodCalculatorArt,
  "dns-change": dnsChangeArt,
  "dns-lookup": dnsLookupArt,
  "dns-trace": dnsTraceArt,
  "dnssec": dnssecArt,
  "docker-compose-checker": dockerComposeCheckerArt,
  "domain-age": domainAgeArt,
  "domain-availability": domainAvailabilityArt,
  "domain-expiry": domainExpiryArt,
  "domain-lookup": domainLookupArt,
  "domain-owner": domainOwnerArt,
  "domain-registrar": domainRegistrarArt,
  "domain-report": domainReportArt,
  "drive-reliability": driveReliabilityArt,
  "epp-status": eppStatusArt,
  "ip-asn-lookup": ipAsnLookupArt,
  "kdp-book-setup-calculator": kdpBookSetupCalculatorArt,
  "kdp-image-dpi-checker": kdpImageDpiCheckerArt,
  "kdp-metadata-checker": kdpMetadataCheckerArt,
  "kdp-page-count-estimator": kdpPageCountEstimatorArt,
  "kdp-payment-date-calculator": kdpPaymentDateCalculatorArt,
  "kdp-pdf-preflight-checker": kdpPdfPreflightCheckerArt,
  "kdp-royalty-calculator": kdpRoyaltyCalculatorArt,
  "kdp-tools": kdpToolsArt,
  "lxc-idmap-checker": lxcIdmapCheckerArt,
  "mqtt-discovery-checker": mqttDiscoveryCheckerArt,
  "multi-tld": multiTldArt,
  "nameserver": nameserverArt,
  "pixels-to-print-size": pixelsToPrintSizeArt,
  "punycode": punycodeArt,
  "raid": raidArt,
  "raidz-expansion": raidzExpansionArt,
  "rebuild": rebuildArt,
  "restic-retention-simulator": resticRetentionSimulatorArt,
  "rsync-filter-tester": rsyncFilterTesterArt,
  "self-hosted-app-resource-planner": selfHostedAppResourcePlannerArt,
  "shortcuts-cheatsheet-generator": shortcutsCheatsheetGeneratorArt,
  "shr": shrArt,
  "snapraid-mergerfs": snapraidMergerfsArt,
  "soa": soaArt,
  "storage-growth": storageGrowthArt,
  "storage-layout": storageLayoutArt,
  "tld-directory": tldDirectoryArt,
  "transfer-readiness": transferReadinessArt,
  "unraid": unraidArt,
  "zfs-capacity": zfsCapacityArt,
  "zfs-padding": zfsPaddingArt,
  "dns-tools": siteSpotDnsToolsArt,
  "domain-tools": siteSpotDomainToolsArt,
  "storage-tools": siteSpotStorageToolsArt,
  "hosting-cloud-tools": siteSpotSelfHostAppsArt,
  "developer-tools": siteSpotLabsArt,
  "home-automation-tools": siteSpotHomeAssistantEnergyArt,
  "productivity-tools": siteSpotKeyboardShortcutsArt,
  "dockerignore-tester": siteSpotDockerignoreArt,
  "home-assistant-energy-entity-checker": siteSpotHomeAssistantEnergyArt,
  "nfs-firewall-rules": siteSpotNfsFirewallArt,
  "nginx-proxy-pass-calculator": siteSpotNginxProxyPassArt,
};

export function toolCatalogArt(key: string | null | undefined) {
  return (key && art[key]) || null;
}
