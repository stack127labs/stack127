import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/nameserver-checker",
  title: "Nameserver Delegation Checker",
  button: "Check nameservers",
  sections: 5,
});
