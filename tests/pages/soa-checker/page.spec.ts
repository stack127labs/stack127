import { testDnsToolPage } from "../dns-tools/shared/dns-tool-page";

testDnsToolPage({
  route: "/soa-checker",
  title: "SOA Consistency Checker",
  heading: "SOA Consistency Checker: compare zone serials across nameservers",
  button: "Compare SOA records",
  sections: 4,
});
