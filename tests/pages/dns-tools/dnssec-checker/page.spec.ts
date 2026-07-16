import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/dnssec-checker",
  title: "DNSSEC Chain Checker",
  button: "Validate DNSSEC",
  sections: 5,
});
