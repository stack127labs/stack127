import Link from "next/link";
import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./storage-growth-planner.module.css";

export function StorageGrowthGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Choose inputs that match your homelab</h2>
      <p>
        Use a measured average draw for the complete system, not drive watts alone. Enter the data you have today, an annual growth assumption, and a reserve you do not want to fill. Mirror, single parity, and dual parity are equal-drive planning models, so the route rejects impossible member counts.
      </p>
      <p>
        Drive and enclosure prices, electricity rate, replacement reserve, and backup budget are your assumptions. Growth compounds once per year. Seasonal bursts, changing growth rates, and live hardware prices are outside this version.
      </p>

      <h2>Know what this model leaves out</h2>
      <p>
        The result is not installed filesystem free space, a reliability forecast, a performance estimate, or financial advice. It does not prove a backup exists or restores. Array redundancy is not an independent backup, and the model does not include labor, cooling, tax, migration, cloud retrieval, or currency conversion.
      </p>

      <h2>Verify the plan before buying</h2>
      <p>
        Use the estimate to choose a capacity envelope, then check technology-specific behavior in the <Link href="/zfs-capacity-calculator">ZFS capacity calculator</Link> and the <Link href="/zfs-padding-calculator">ZFS padding calculator</Link>. Before relying on the plan, verify an independent backup copy and a real restore path using the <a href="https://www.cisa.gov/stopransomware/back-up-business-data">CISA backup guidance</a>.
      </p>
    </article>
  );
}
