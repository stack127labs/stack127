import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./nfs-firewall-rules.module.css";

const versionBranches = [
  {
    scenario: "NFSv3 server",
    fixed: "TCP 111 and 2049",
    verified: "mountd, statd, lockd, and optional rquotad",
    boundary: "Legacy UDP is added only when selected.",
  },
  {
    scenario: "NFSv3 client",
    fixed: "TCP 111",
    verified: "statd and lockd",
    boundary: "Server-only nfs and mountd listeners are excluded.",
  },
  {
    scenario: "NFSv4.0",
    fixed: "Server TCP 2049",
    verified: "Client callback TCP port",
    boundary: "Plan the server and client host firewalls separately.",
  },
  {
    scenario: "NFSv4.1 or later",
    fixed: "Server TCP 2049",
    verified: "None in this model",
    boundary: "The client uses its established session for callbacks.",
  },
] as const;

export function NfsFirewallRulesGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>What changes between NFSv3 and NFSv4</h2>
      <div className={styles.guideTableWrap} role="region" aria-label="NFS firewall listener branches" tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Protected scenario</th>
              <th>Fixed by the protocol</th>
              <th>Assigned locally</th>
              <th>Important boundary</th>
            </tr>
          </thead>
          <tbody>
            {versionBranches.map((branch) => (
              <tr key={branch.scenario}>
                <td>{branch.scenario}</td>
                <td>{branch.fixed}</td>
                <td>{branch.verified}</td>
                <td>{branch.boundary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Verify NFSv3 helper ports on the protected host</h2>
      <p>
        NFSv3 helper programs can use ports assigned by the local system. Read the relevant
        <code>mountd</code>, <code>statd</code>, and <code>lockd</code> settings from the host, then
        confirm active listeners with <code>rpcinfo -p</code> and <code>ss -lntup</code>. The
        <a href="https://man7.org/linux/man-pages/man5/nfs.conf.5.html"> nfs.conf manual</a> names
        the configuration keys. Treat port numbers in articles as examples, not local facts.
      </p>
      <p>
        Leave a helper field empty until its value is verified. An incomplete result shows only
        the protocol-fixed rows and names the missing facts. It deliberately withholds firewall
        syntax and copy output, so a partial set cannot look ready to apply.
      </p>

      <h2>Treat the output as a review plan</h2>
      <p>
        The listener table is the neutral result. It identifies the protected host, inbound
        direction, allowed peer, service, protocol, destination port, and whether that port is
        fixed by the protocol or supplied from the real host. Review this table before the selected
        firewall syntax.
      </p>
      <p>
        Firewalld output needs the active zone. UFW output assumes the matching address family is
        enabled. Nftables output is an expression for an existing <code>inet</code> input chain, not
        a new table, hook, policy, or complete ruleset. These are review fragments, not apply
        scripts, and existing rule order can change their effect.
      </p>

      <h2>What the planner cannot verify</h2>
      <p>
        The planner does not read your listeners, firewall, routes, exports, permissions, SELinux
        policy, identity mapping, NAT, or cloud controls. It cannot prove that a rule is active,
        that an export is allowed, or that a mount is reachable. Routed firewalls, security groups,
        clustered NFS, Kerberos, RDMA, TLS, and vendor-specific NAS services are outside this model.
      </p>
      <p>
        Entered values stay in this browser and are not added to the URL or saved by the planner.
        Follow the verification steps shown with the result from the NFS client, and compare the
        real listeners with the
        <a href="https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/deploying-an-nfs-server_configuring-and-using-network-file-services"> RHEL NFS server documentation</a>.
        See the <a href="/privacy">privacy policy</a> for the sitewide boundary.
      </p>
    </article>
  );
}
