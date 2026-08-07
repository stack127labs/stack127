import Link from "next/link";
import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./dockerignore-tester.module.css";

const patterns = [
  [
    <code key="path">foo/bar</code>,
    <>Matches that context-relative path. Leading and trailing slashes are disregarded.</>,
  ],
  [
    <code key="one-level">*/temp*</code>,
    <>Matches names beginning with <code>temp</code> inside an immediate child directory.</>,
  ],
  [
    <code key="any-level">**/*.go</code>,
    <>Matches files ending in <code>.go</code> at any directory depth, including the context root.</>,
  ],
  [
    <code key="one-character">temp?</code>,
    <>Matches a root name such as <code>tempa</code>, where <code>?</code> stands for one character.</>,
  ],
  [
    <code key="exception">!README.md</code>,
    <>Creates an exception that includes the root <code>README.md</code> if an earlier rule excluded it.</>,
  ],
  [
    <code key="comment"># note</code>,
    <>Is a comment only when <code>#</code> is the first character in column 1.</>,
  ],
] as const;

const boundaries = [
  ["Path probes", <>Submitted paths are probes. They need not exist.</>],
  [
    "Matching",
    <>
      This is not a build or filesystem walk. It does not inspect symlinks, permissions, file
      sizes, or the source paths used by <code>COPY</code> and <code>ADD</code>.
    </>,
  ],
  ["Included", <><code>Included</code> is not a safety guarantee.</>],
  [
    "Builder control files",
    <>
      <code>Dockerfile</code>, <code>.dockerignore</code>, and Dockerfile-specific ignore files have separate builder transfer behavior.
    </>,
  ],
  [
    "Effective source",
    <>A Dockerfile-specific ignore file takes precedence over the root file. The files are not merged.</>,
  ],
  [
    "Compatibility",
    <>
      This TypeScript compatibility port is pinned to and fixture-tested against Moby <code>patternmatcher</code> v0.6.1, not a claim about every current Docker build.
    </>,
  ],
  [
    "Local handling",
    <>Pattern testing uses the rules and paths already in this browser. There is no repository or file upload.</>,
  ],
] as const;

export function DockerignoreGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Start with the file Docker will actually use</h2>
      <p>
        Use the root <code>.dockerignore</code> when Docker builds with the file at the build-context
        root. If the selected Dockerfile has a sibling such as
        <code>lint.Dockerfile.dockerignore</code>, that file takes precedence. Test it alone because
        Docker does not merge it with the root file.
      </p>
      <p>
        Useful probes sit around the boundary you are debugging: the directory named by a rule, a
        file below it, every exception, and the source of each <code>COPY</code> or <code>ADD</code>
        instruction you care about. Enter them relative to the build-context root.
      </p>

      <h2>Docker patterns are ordered, not combined</h2>
      <p>
        Docker evaluates active lines from top to bottom. The last matching line decides whether a
        path is Included or Excluded, and a line beginning with <code>!</code> creates an exception.
        Blank lines and the historical <code>.</code> pattern are inactive after preprocessing.
      </p>
      <div
        aria-label="Useful .dockerignore pattern forms"
        className={styles.guideTableWrap}
        role="region"
        tabIndex={0}
      >
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Pattern</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {patterns.map(([pattern, meaning], index) => (
              <tr key={index}>
                <td data-label="Pattern">{pattern}</td>
                <td data-label="What it does">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>The deciding rule is the answer; the trace explains it</h2>
      <p>
        Every path starts Included. A normal matching line makes it Excluded, while a matching
        exception makes it Included again. The deciding rule is the last line that changed that
        state. Earlier matches stay in the trace so the result can be audited.
      </p>
      <p>
        The built-in example uses <code>docs</code> followed by <code>!docs/README.md</code>.
        <code>Parent</code> means the first rule matched an ancestor while the submitted file was
        resolved. It is trace evidence, not the final verdict. The later Direct exception makes
        <code>docs/README.md</code> Included by line 2.
      </p>

      <h2>When a result surprises you, check these four things</h2>
      <ol>
        <li><strong>Effective source:</strong> confirm whether the build uses the root file or a Dockerfile-specific file.</li>
        <li><strong>Line order:</strong> a later matching rule can reverse every earlier match.</li>
        <li><strong>Normalized input:</strong> compare the displayed normalized path and pattern diagnostics with what you pasted.</li>
        <li><strong>Builder behavior:</strong> matcher verdicts for Docker control files do not describe all transfer or copy restrictions.</li>
      </ol>

      <h2>What this tester proves, and what it cannot</h2>
      <div
        aria-label=".dockerignore tester boundaries"
        className={styles.guideTableWrap}
        role="region"
        tabIndex={0}
      >
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Boundary</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            {boundaries.map(([boundary, meaning]) => (
              <tr key={boundary}>
                <td data-label="Boundary">{boundary}</td>
                <td data-label="What it means">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Confirm the final context with Docker</h2>
      <p>
        For end-to-end proof, run a real build against the actual context and verify the relevant
        <code>COPY</code> or <code>ADD</code> step. The
        <a href="https://docs.docker.com/build/concepts/context/#dockerignore-files"> official Docker documentation</a>
        explains file placement, pattern syntax, exceptions, and builder control files. If the
        machine is not ready yet, <Link href="/self-hosting-for-beginners/install-docker">install Docker</Link>
        first.
      </p>
    </article>
  );
}
