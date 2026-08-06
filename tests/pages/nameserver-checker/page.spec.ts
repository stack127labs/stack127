import { testDnsToolPage } from "../dns-tools/shared/dns-tool-page";

testDnsToolPage({
  route: "/nameserver-checker",
  title: "Nameserver Delegation Checker",
  heading: "Nameserver Delegation Checker: test NS and glue records",
  button: "Check nameservers",
  sections: 5,
});
