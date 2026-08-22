import Link from "next/link";
import { proseClassName, proseSectionFlowClassName } from "../../../prose";
import styles from "./shortcuts-cheatsheet-generator.module.css";

export function ShortcutsCheatSheetGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseSectionFlowClassName}`}>
      <section>
        <h2>Build a sheet for the work you actually do</h2>
        <p>
          A useful cheat sheet is smaller than the reference it came from. Pick the apps that share your desk, keep the platform you are using, and remove groups that belong to a job you do not do. A focused page has a chance of staying beside the keyboard instead of becoming another document you never open.
        </p>
        <p>
          If you move between a terminal, an editor, and a browser, make one sheet for that loop. If you are learning one app, select only its groups and give yourself a page you can glance at without hunting through unrelated commands.
        </p>
      </section>

      <section>
        <h2>Choose the platform before you print</h2>
        <p>
          Windows, macOS, and Linux often share the action but change the modifier. Keep all platforms when the sheet is for a shared desk or a team. Choose one platform when you want a quieter page and know which keyboard will be in front of you.
        </p>
        <p>
          Some applications also use terminal settings, editor modes, or custom keymaps. The sheet keeps the documented default rows from this reference. It does not rewrite them for a personal binding file.
        </p>
      </section>

      <section>
        <h2>Read the paper as a task list</h2>
        <p>
          Each app keeps its own name and each group keeps its task heading. That matters when several apps share keys such as Ctrl+P or Cmd+K. The action beside the keys tells you which app context gives the combination its meaning.
        </p>
        <p>
          The live preview is the document that prints. If you remove an app, platform, or group, the count and the paper change with it. Groups that have no shortcut for the selected platform disappear from the sheet rather than leaving an empty heading behind.
        </p>
      </section>

      <section>
        <h2>What this sheet does not promise</h2>
        <p>
          This generator does not discover shortcuts from your installed apps, inspect custom bindings, or turn undocumented actions into guesses. It prints the rows in the stack127 keyboard reference for the choices you made. For a full app page, including notes about modes and sequences, use the <Link href="/keyboard-shortcuts">keyboard shortcuts directory</Link>.
        </p>
      </section>

      <section>
        <h2>Keep the first version deliberately short</h2>
        <p>
          Start with the keys that remove a repeated interruption today. When those become ordinary, make a second sheet or add another group. The point is to put the next useful action near your hand, not to turn every documented shortcut into homework.
        </p>
        <p>
          Your selections stay in this browser while you build the sheet. Printing uses the browser's own print dialog, so the final paper follows the page you can see here.
        </p>
      </section>
    </article>
  );
}
