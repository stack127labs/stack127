import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/dnssec-checker",
  title: "DNSSEC Chain Checker",
  heading: "DNSSEC Chain Checker: validate DS, DNSKEY, and RRSIG",
  button: "Validate DNSSEC",
  sections: 5,
});
