import Link from "next/link";
import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { LessonLink, LessonPage } from "../course";
import { repeatSafeAppsArt } from "./art/repeat-safe-apps";
import { CodeBlock } from "@/app/ui/site/code-block";

const lesson = getLesson("best-first-apps");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          You've got Excalidraw running and you understand roughly how. The best thing you can do
          now is repeat the pattern a few times on low-stakes apps, until making a folder, writing a
          compose file, and opening a port feels like nothing. Here are the ones I'd reach for.
        </p>

        <p>
          None of these hold anything you can't rebuild in a few minutes, which is the point. Feel
          free to break them, wipe them, and reinstall them. That's how the muscle memory forms,
          and it's far more relaxed to learn on a bookmarks app than on your photo library.
        </p>

        <MarkerArt
          caption="Repeat the install pattern on safe apps before trusting the server with serious data."
          svg={repeatSafeAppsArt}
        />

        <h2>Homepage, a front door for everything</h2>
        <p>
          Once you have more than two apps, typing IP-and-port every time gets old.{" "}
          <a href="https://gethomepage.dev/" rel="noreferrer" target="_blank">
            Homepage
          </a>{" "}
          is a single dashboard that links to all your apps, and it can even show little live stats
          from them. It becomes the one bookmark you keep. Setting it up also gives you good
          practice with config files.
        </p>

        <h2>Memos, for quick notes</h2>
        <p>
          <a href="https://www.usememos.com/" rel="noreferrer" target="_blank">
            Memos
          </a>{" "}
          is a fast, no-nonsense place to jot things, like a private, self-hosted version of those
          quick-note apps. It's genuinely useful day to day, and small enough that it's a relaxing
          install. Good candidate for your second or third app.
        </p>

        <h2>Linkwarden, for bookmarks worth keeping</h2>
        <p>
          <a href="https://linkwarden.app/" rel="noreferrer" target="_blank">
            Linkwarden
          </a>{" "}
          saves links and, importantly, a copy of the page, so a bookmark still works even if the
          site later dies. If you're the kind of person with 400 open tabs "to read later", this one
          earns its place quickly.
        </p>

        <h2>FreshRSS, to follow sites directly</h2>
        <p>
          <a href="https://freshrss.org/" rel="noreferrer" target="_blank">
            FreshRSS
          </a>{" "}
          is a reader for blogs and news feeds, so you follow sites straight instead of hoping an
          algorithm shows them to you. It's a slightly bigger install than the others, which makes
          it a good step up once the simple ones feel easy.
        </p>

        <h2>Uptime Kuma, to monitor your other apps</h2>
        <p>
          <a href="https://github.com/louislam/uptime-kuma" rel="noreferrer" target="_blank">
            Uptime Kuma
          </a>{" "}
          watches your other apps and tells you the moment one falls over. Make it a habit: every
          new app you add, add a monitor for it. We'll install this one together below, because it's
          the ideal second install.
        </p>

        <h2>How to install anything from here</h2>
        <p>
          Here's the part that makes you independent. So far the compose files have been provided
          for you; out in the wild, projects publish their own. Look for a "Docker" or
          "Installation" section in a project's README or docs, and there it is, a compose block
          ready to copy.
        </p>

        <p>
          Let's do one for real, and Uptime Kuma is the perfect second install because it's also
          your first app that keeps data:
        </p>

        <CodeBlock>{`mkdir -p ~/apps/uptime-kuma && cd ~/apps/uptime-kuma
nano docker-compose.yml`}</CodeBlock>

        <CodeBlock>{`services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    restart: unless-stopped`}</CodeBlock>

        <p>
          <code>docker compose up -d</code>, open <code>server-ip:3001</code>, create your account,
          and add a monitor pointing at Excalidraw. Notice the <code>./data</code> line quietly
          doing the job the <LessonLink slug="storage-and-volumes">storage lesson</LessonLink>{" "}
          explained: your monitors survive any update or rebuild.
        </p>

        <p>Every other app on this page, and most apps anywhere, is those same moves:</p>

        <ol>
          <li>
            Make the app its own folder: <code>mkdir -p ~/apps/the-app && cd ~/apps/the-app</code>.
          </li>
          <li>
            Copy the project's compose block into a <code>docker-compose.yml</code> there.
          </li>
          <li>
            Read the <code>image</code>, <code>ports</code>, and <code>volumes</code> lines so you
            know what you're running, which port it wants, and where its data will live. If the
            data volume isn't a folder next to the file, change it to the{" "}
            <code>./data</code> style so backups stay easy.
          </li>
          <li>
            If the left side port is already taken by another app, change it to a free one.
          </li>
          <li>
            <code>docker compose up -d</code>, open <code>server-ip:port</code>, done. Add it to
            Homepage and give it an Uptime Kuma monitor while you're there.
          </li>
        </ol>

        <p>
          And when an app doesn't earn its keep, removing it is just as clean:{" "}
          <code>docker compose down</code> inside its folder, then delete the folder. That's the
          whole uninstall. No leftovers, no registry ghosts, which is half the charm of running
          everything this way.
        </p>

        <p>
          You'll find plenty more candidates, with links and details, in the{" "}
          <Link href="/self-host-apps">self-host apps directory</Link>. Install two or three, live
          with them for a week, and you'll notice the installs stop feeling like a tutorial and
          start feeling routine.
        </p>

        <p>
          And that's exactly the moment to get serious about safety. Because the next apps you'll
          want, photos, passwords, are the ones you cannot afford to lose, and there's one thing to
          set up first: <LessonLink slug="backups-before-serious-apps">backups</LessonLink>.
        </p>
    </LessonPage>
  );
}
