import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./nginx-proxy-pass-calculator.module.css";

const staticCases = [
  { proxyPass: "http://backend", retained: "/api/users?id=42", final: "http://backend/api/users?id=42" },
  { proxyPass: "http://backend/", retained: "users?id=42", final: "http://backend/users?id=42" },
  { proxyPass: "http://backend/v2", retained: "users?id=42", final: "http://backend/v2users?id=42" },
  { proxyPass: "http://backend/v2/", retained: "users?id=42", final: "http://backend/v2/users?id=42" },
] as const;

const liveCases = [
  {
    input: "Regex or named location",
    reason: "There is no literal matched prefix that this page can safely replace.",
    next: "Inspect the effective location and proxy_pass without a URI.",
  },
  {
    input: "rewrite before proxy_pass",
    reason: "break can change URI handling, while last starts another location search.",
    next: "Trace the rewrite and later location in the running configuration.",
  },
  {
    input: "Variables or target arguments",
    reason: "Runtime values or argument-merging rules are missing from the static inputs.",
    next: "Resolve the variables and observe the upstream request.",
  },
  {
    input: "Encoded or normalization-sensitive path",
    reason: "NGINX location processing uses a normalized URI, which this page does not emulate.",
    next: "Compare the normalized URI with an upstream request log.",
  },
] as const;

export function NginxProxyPassGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Use the location NGINX actually matched</h2>
      <p>
        Copy the selected literal prefix or exact location, the incoming request target, and the
        URL written after <code>proxy_pass</code>. This calculator checks that the request fits the
        supplied location, but it does not choose among a full set of location blocks.
      </p>
      <p>
        Keep the request arguments after <code>?</code>. An omitted target URI and a target URI of
        <code>/</code> are different inputs, so preserve the directive exactly.
      </p>

      <h3>Common static cases</h3>
      <p>
        These rows use location <code>/api/</code> and request <code>/api/users?id=42</code>.
      </p>
      <div className={styles.guideTableWrap} role="region" aria-label="Common static proxy_pass cases" tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>proxy_pass</th>
              <th>Retained request</th>
              <th>Final upstream URL</th>
            </tr>
          </thead>
          <tbody>
            {staticCases.map((entry) => (
              <tr key={entry.proxyPass}>
                <td data-label="proxy_pass"><code>{entry.proxyPass}</code></td>
                <td data-label="Retained request"><code>{entry.retained}</code></td>
                <td data-label="Final upstream URL"><code>{entry.final}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Read the result as one replacement chain</h2>
      <p>
        With no target URI, the supported request path is retained. With a target URI, the matched
        location is removed, its suffix is appended to that URI, and the original request arguments
        follow the new path.
      </p>
      <p>
        Concatenation is literal. <code>/v2</code> plus <code>users</code> becomes
        <code>/v2users</code>; <code>/v2/</code> becomes <code>/v2/users</code>. The slash comparison
        shows both outcomes without recommending either one.
      </p>

      <h2>When the answer needs live NGINX</h2>
      <div className={styles.guideTableWrap} role="region" aria-label="Cases that need live NGINX" tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Input</th>
              <th>Why no URL is shown</th>
              <th>What to verify</th>
            </tr>
          </thead>
          <tbody>
            {liveCases.map((entry) => (
              <tr key={entry.input}>
                <td data-label="Input">{entry.input}</td>
                <td data-label="Why no URL is shown">{entry.reason}</td>
                <td data-label="What to verify">{entry.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The <a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass">official proxy_pass documentation</a>{" "}
        explains the URI replacement boundary. The <a href="https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite">NGINX rewrite documentation</a>{" "}
        covers the processing flags that need broader state.
      </p>

      <h2>Verify the target in the running configuration</h2>
      <p>
        A calculated URL does not prove that NGINX selected this location or reached the intended
        backend. Inspect the effective configuration with <code>nginx -T</code>, then observe
        <code>$request_uri</code> at a controlled upstream or in its request log. For an unknown
        result, include the relevant rewrite, variable values, and later location search in that
        check. Entered calculator values stay in this browser.
      </p>
    </article>
  );
}
