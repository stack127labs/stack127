import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { proseClassName, proseSectionFlowClassName } from "../../../prose";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import styles from "../../storage-tools/storage-tools.module.css";
import { RaidCalculator } from "./raid-calculator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

const comparisonRows = [
  ["RAID 0", "2", "N × smallest", "None", "1"],
  ["RAID 1", "2", "Smallest", "Any N - 1", "N mirror writes"],
  ["RAID 5", "3", "(N - 1) × smallest", "Any 1", "4"],
  ["RAID 6", "4", "(N - 2) × smallest", "Any 2", "6"],
  ["RAID 10", "4, even", "Sum of mirror pair minima", "Any 1", "2"],
  ["RAID 50", "6", "Sum of RAID 5 groups", "Any 1", "4 per group"],
  ["RAID 60", "8", "Sum of RAID 6 groups", "Any 2", "6 per group"],
  ["Linear", "1", "Sum of all drives", "None", "1"],
  ["JBOD", "1", "Sum of all drives", "None in this model", "1"],
] as const;

export default async function RaidCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="RAID capacity calculator"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="raid" />}
      sidebarLabel="RAID calculator sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <HardDrive strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            RAID capacity <mark>calculator</mark> for mixed drives and nested groups
          </h1>
          <p>
            See theoretical usable capacity, what redundancy costs you, and how much space unequal
            drives strand. RAID 10, RAID 50, and RAID 60 show their exact groups because placement
            changes both capacity and what can fail. Everything is calculated in your browser.
          </p>
        </header>

        <RaidCalculator initialState={firstValue(params.state)} />

        <article className={`${styles.reference} ${proseClassName} ${proseSectionFlowClassName}`}>
          <section>
            <h2>Compare RAID levels</h2>
            <p>
              Capacity patterns use the smallest drive inside each striped or redundant group. The
              write column is the classic backend operation count for one small random write. It is
              not an IOPS forecast.
            </p>
            <div className={styles.tableScroll}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th scope="col">Layout</th>
                    <th scope="col">Minimum drives</th>
                    <th scope="col">Theoretical usable</th>
                    <th scope="col">Guaranteed tolerance</th>
                    <th scope="col">Small random write</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row[0]}>
                      <th scope="row">{row[0]}</th>
                      <td>{row[1]}</td>
                      <td><code>{row[2]}</code></td>
                      <td>{row[3]}</td>
                      <td>{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>The smallest drive sets the size of every group</h2>
            <p>
              Striped and parity layouts write fixed-width stripes across every drive at the same
              offset, so each drive can contribute only as much as the smallest one in its group
              holds. Pair a 4 TB drive with an 8 TB drive in a mirror and you get 4 TB of protected
              space. The other 4 TB stays visible above as size mismatch because it is real capacity
              you paid for and could recover by changing the layout or the drives.
            </p>
            <p>
              Linear and JBOD are the exceptions. They concatenate members rather than striping
              across them, so every supplied byte counts.
            </p>
            <p>
              Nested layouts apply the rule per group, not across the whole array. In RAID 10 each
              mirror pair is capped by its own smaller drive, so the order you enter drives changes
              the answer. Four drives of 4, 4, 8, and 8 TB give 12 TB when paired as 4 + 4 and 8 + 8,
              and 8 TB when paired as 4 + 8 and 4 + 8. RAID 50 and RAID 60 behave the same way inside
              each parity group.
            </p>
            <p>
              Linux md can use unequal devices in RAID 0 with layout-specific remainder zones, and
              that behavior has changed across kernel versions. This calculator uses the portable
              smallest-member model rather than emulating those layouts.
            </p>
          </section>

          <section>
            <h2>Failure tolerance belongs to the topology, not to one number</h2>
            <p>
              A single tolerance number hides the thing that matters in nested layouts. RAID 10
              always survives one drive failure. It may survive one failure in every mirror pair,
              which on eight drives means four simultaneous failures. It never survives both members
              of the same pair. Those situations differ entirely because of which drives fail.
            </p>
            <p>
              RAID 50 and RAID 60 work the same way one level up. Each RAID 5 group tolerates one
              failure, each RAID 6 group tolerates two, and the stripe across groups tolerates the
              loss of no complete group. Lose one group and the array is gone.
            </p>
            <p>
              That is why the topology above is part of the result rather than decoration. A capacity
              figure without the grouping is only half the answer.
            </p>
          </section>

          <section>
            <h2>The number stops before the filesystem starts</h2>
            <p>
              This is array-level theoretical capacity. It is the size of the block device the array
              presents before anything is written to it.
            </p>
            <p>
              Not included: array metadata, partition alignment, filesystem metadata, reserved
              blocks, snapshots, and application-level allocation. On a NAS appliance, also account
              for the system partition and swap the operating system takes from every drive.
            </p>
            <p>
              Also not included: rebuild time, IOPS, throughput, or the probability of data loss.
              Those depend on hardware, workload, and drive health. A capacity calculator that
              invents them would be guessing.
            </p>
            <p>
              Drives are sold in decimal terabytes, where 1 TB is 1,000,000,000,000 bytes. Operating
              systems often report binary tebibytes, where 1 TiB is 1,099,511,627,776 bytes. That is
              where roughly 9% of the numerical difference appears before RAID takes any capacity.
              Use the result unit control to see both.
            </p>
          </section>

          <section>
            <h2>Common RAID capacity questions</h2>

            <h3>Can I mix different drive sizes in RAID?</h3>
            <p>
              Yes, in every layout listed here. RAID 0, RAID 1, RAID 5, RAID 6, RAID 10, RAID 50, and
              RAID 60 cap every drive at the size of the smallest one in its group. Linear and JBOD
              use every byte but provide no array-level redundancy.
            </p>

            <h3>How much usable space do four 4 TB drives give in RAID 5?</h3>
            <p>
              12 TB, which is about 10.91 TiB. One drive&apos;s worth of capacity holds parity so the
              array can rebuild after a single drive failure.
            </p>

            <h3>Why does my array show less space than this calculator?</h3>
            <p>
              Decimal TB against binary TiB accounts for roughly 9% of the numerical difference.
              Filesystem metadata and reserved blocks come next, followed by array metadata and any
              system partitions. This page stops before those software-specific deductions.
            </p>

            <h3>Does the order I enter drives matter?</h3>
            <p>
              For RAID 10, yes. Adjacent drives form mirror pairs, and each pair is capped by its
              smaller member. For RAID 50 and RAID 60, the order decides which drives share a parity
              group. The order is irrelevant for every other layout in this calculator.
            </p>

            <h3>Should I use RAID 5 with large drives?</h3>
            <p>
              The concern is the rebuild window. After one drive fails, the remaining members must be
              read to reconstruct it, which can take many hours on high-capacity drives. A second
              drive failure during that window loses a RAID 5 array. RAID 6 can survive that second
              failure at the cost of one more drive&apos;s capacity.
            </p>

            <h3>What is the difference between Linear and JBOD?</h3>
            <p>
              In this calculator, nothing. Both concatenate every member and return the sum of all
              drives with no array-level redundancy. Vendors use JBOD inconsistently, and some use it
              to mean passing drives through individually, so check what your implementation means.
            </p>

            <h3>Is RAID a backup?</h3>
            <p>
              No. RAID keeps storage available through specific drive failures. Deletion, corruption
              written through to every copy, ransomware, theft, and fire still affect the array.
            </p>

            <h3>Does this send my drive list anywhere?</h3>
            <p>
              The calculation runs in your browser without a separate calculation request. After you
              change an input, the versioned state is placed in the URL so the layout can be restored.
              Anyone you share that URL with can read the encoded drive sizes.
            </p>
          </section>
        </article>
      </div>
    </AppShell>
  );
}
