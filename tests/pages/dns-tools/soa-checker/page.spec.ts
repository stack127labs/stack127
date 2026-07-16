import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/soa-checker",
  title: "SOA Consistency Checker",
  button: "Compare SOA records",
  sections: 4,
});
