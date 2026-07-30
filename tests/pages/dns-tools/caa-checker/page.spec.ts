import { testDnsToolPage } from "../shared/dns-tool-page";

testDnsToolPage({
  route: "/dns-tools/caa-checker",
  title: "CAA Policy Checker",
  heading: "CAA Policy Checker: who can issue your certificates?",
  button: "Check CAA policy",
  sections: 5,
});
