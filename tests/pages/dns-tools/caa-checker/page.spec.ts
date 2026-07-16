import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/caa-checker",
  title: "CAA Policy Checker",
  button: "Check CAA policy",
  sections: 5,
});
