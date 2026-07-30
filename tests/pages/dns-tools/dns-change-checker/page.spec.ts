import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/dns-change-checker",
  title: "DNS Change Checker",
  heading: "DNS Change Checker: has your change propagated?",
  button: "Check DNS change",
  sections: 4,
});
