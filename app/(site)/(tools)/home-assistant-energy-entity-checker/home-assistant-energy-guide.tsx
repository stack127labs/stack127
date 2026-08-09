import Link from "next/link";
import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./home-assistant-energy-entity-checker.module.css";

const roleRequirements = [
  {
    role: "Grid import, grid export, solar production, battery charge, battery discharge, individual device",
    deviceClass: <code>energy</code>,
    stateClass: <><code>total</code> or <code>total_increasing</code></>,
    unit: "Energy",
  },
  {
    role: "Optional power",
    deviceClass: <code>power</code>,
    stateClass: <code>measurement</code>,
    unit: "Power",
  },
  {
    role: "Gas",
    deviceClass: <><code>gas</code> or <code>energy</code></>,
    stateClass: <><code>total</code> or <code>total_increasing</code></>,
    unit: "Gas volume with gas; energy with energy",
  },
  {
    role: "Water",
    deviceClass: <code>water</code>,
    stateClass: <><code>total</code> or <code>total_increasing</code></>,
    unit: "Water volume",
  },
] as const;

export function HomeAssistantEnergyGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Choose the Energy field before judging the sensor</h2>
      <p>
        Accumulated energy fields describe a quantity collected over time. The optional power
        field describes the current rate instead. That distinction changes the accepted device
        class, state class, and unit family.
      </p>
      <p>
        Start with the exact field where the entity is missing. Changing that choice changes only
        the Energy comparison. It does not rewrite the separate long-term-statistics conclusion.
      </p>

      <h3>Each Energy field accepts a specific attribute combination</h3>
      <div
        aria-label="Home Assistant Energy field requirements"
        className={styles.guideTableWrap}
        role="region"
        tabIndex={0}
      >
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Energy field</th>
              <th>Device class</th>
              <th>State class</th>
              <th>Unit family</th>
            </tr>
          </thead>
          <tbody>
            {roleRequirements.map((requirement) => (
              <tr key={requirement.role}>
                <td data-label="Energy field">{requirement.role}</td>
                <td data-label="Device class">{requirement.deviceClass}</td>
                <td data-label="State class">{requirement.stateClass}</td>
                <td data-label="Unit family">{requirement.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Energy and statistics answer different questions</h2>
      <p>
        Energy applies the matrix for the field you selected. Long-term statistics checks the
        current numeric <code>sensor</code> against its own supported state-class boundary. It
        still cannot see recorder inclusion, stored metadata, or historical unit changes.
      </p>
      <p>
        For example, <code>power</code>, <code>measurement</code>, and <code>W</code> can match the
        statistics attribute contract while failing grid import&apos;s accumulated-energy rules.
        Counter suitability also stays separate: an unknown or decreasing counter never becomes
        an automatic recommendation for <code>total_increasing</code>.
      </p>

      <h2>A matching result still needs Home Assistant</h2>
      <p>
        A local match means the current attributes cleared the pinned comparison. It cannot
        guarantee that the entity appears. The
        <a href="https://www.home-assistant.io/docs/energy/faq/"> Home Assistant Energy FAQ</a>
        covers missing entities, and the
        <a href="https://developers.home-assistant.io/docs/core/entity/sensor/"> Home Assistant sensor documentation</a>
        explains state classes and counters. Entered attributes stay in this browser; the
        <Link href="/privacy"> version127 privacy policy</Link> covers ordinary page requests and
        site analytics separately.
      </p>
      <ol>
        <li>Check Developer Tools &gt; Statistics for issues and the stored unit.</li>
        <li>Confirm recorder inclusion for the entity and its integration.</li>
        <li>Return to Energy settings and validate the intended field in the live instance.</li>
      </ol>
    </article>
  );
}
