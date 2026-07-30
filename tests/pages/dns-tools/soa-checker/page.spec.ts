import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/soa-checker",
  title: "SOA Consistency Checker",
  heading: "SOA Consistency Checker: compare zone serials across nameservers",
  button: "Compare SOA records",
  sections: 4,
});
