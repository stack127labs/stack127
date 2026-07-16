import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/dns-change-checker",
  title: "DNS Change Checker",
  button: "Check DNS change",
  sections: 4,
});
