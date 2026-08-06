import { testDnsToolPage } from "../dns-tools/shared/dns-tool-page";

testDnsToolPage({
  route: "/caa-checker",
  title: "CAA Policy Checker",
  heading: "CAA Policy Checker: who can issue your certificates?",
  button: "Check CAA policy",
  sections: 5,
});
