import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/nameserver-checker",
  title: "Nameserver Delegation Checker",
  heading: "Nameserver Delegation Checker: test NS and glue records",
  button: "Check nameservers",
  sections: 5,
});
