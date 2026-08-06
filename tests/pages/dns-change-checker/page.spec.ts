import { testDnsToolPage } from "../dns-tools/shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-change-checker",
  title: "DNS Change Checker",
  heading: "DNS Change Checker: has your change propagated?",
  button: "Check DNS change",
  sections: 4,
});
