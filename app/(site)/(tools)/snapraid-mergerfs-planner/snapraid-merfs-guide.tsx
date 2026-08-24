import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./snapraid-mergerfs-planner.module.css";

const responsibilities = [
  ["SnapRAID", "Parity and content metadata", "Data mounts, parity mounts, and content paths", "Not a live pooled mount"],
  ["mergerfs", "One path over selected branches", "The ordered data mounts", "Not parity or backup"],
] as const;

export function SnapraidMergerfsGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Keep parity outside the pool</h2>
      <p>
        SnapRAID and mergerfs can use the same data mount paths, but they solve different problems. SnapRAID records parity and content metadata for independent disks. mergerfs presents selected branches as one pool. The generated fstab line contains data mounts only, so a parity mount cannot become a storage branch by accident.
      </p>
      <div className={styles.guideTableWrap} role="region" aria-label="SnapRAID and mergerfs responsibilities" tabIndex={0}>
        <table className={styles.guideTable}>
          <thead><tr><th>Layer</th><th>Role</th><th>Planner input</th><th>Boundary</th></tr></thead>
          <tbody>{responsibilities.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>

      <h2>Choose paths and verify boundaries</h2>
      <p>
        Use the mount roots and content locations that exist on the real host. The planner can compare path relationships and capacities, but it cannot know physical disk separation, current mounts, permissions, installed versions, filesystem health, recovery state, or whether the layout is a backup.
      </p>
      <ol>
        <li>Use <code>findmnt</code> and <code>lsblk</code> to confirm mount paths and physical disk boundaries.</li>
        <li>Compare the selected blocksize, excludes, and mergerfs policy with the installed manuals. Check whether FUSE permits <code>allow_other</code>.</li>
        <li>Review permissions and the backup plan before saving either file under <code>/etc</code> or starting a first sync.</li>
      </ol>

      <h2>What happens to entered paths?</h2>
      <p>
        The calculation stays in this browser. This tool does not save or send entered paths, serialize them into the URL, inspect a SnapRAID daemon, or run host commands. For syntax and option details, compare the result with the <a href="https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html">SnapRAID manpage</a> and <a href="https://trapexit.github.io/mergerfs/2.41.1/quickstart/">mergerfs QuickStart</a>, then read the site <a href="/privacy">privacy notes</a>.
      </p>
    </article>
  );
}
