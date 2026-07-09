import Link from "next/link";
import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "../../../marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { fullLoopArt } from "./art/full-loop";
import { CodeBlock } from "../../../code-block";

const lesson = getLesson("full-walkthrough");

const memosCompose = `services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    ports:
      - "5230:5230"
    volumes:
      - ./data:/var/opt/memos
    restart: unless-stopped`;

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          Let's run the whole path once, top to bottom, so you can see how the pieces connect
          instead of as separate lessons. First the map, then the same run as one sitting with real
          commands, using Memos, a small notes app that actually holds data, so the backup step
          means something.
        </p>

        <MarkerArt
          caption="The full self-hosting loop goes from machine to app, then data, backup, and remote access."
          svg={fullLoopArt}
        />

        <h2>The path, as a map</h2>
        <ol>
          <li>
            <strong>Know what you're aiming at.</strong> Pick one app you actually want, ideally
            something low-stakes for the first run. If you need ideas, that's{" "}
            <LessonLink slug="what-you-can-host">what I host</LessonLink> and{" "}
            <LessonLink slug="best-first-apps">the apps I'd start with</LessonLink>.
          </li>
          <li>
            <strong>Get a machine.</strong> A cheap mini PC, or an old PC you already own. See{" "}
            <LessonLink slug="pick-your-first-server">picking a server</LessonLink>.
          </li>
          <li>
            <strong>Choose and install the OS.</strong> Debian or Ubuntu Server, then{" "}
            <LessonLink slug="install-your-os">flash it, install it, turn on SSH, and pin its
            address</LessonLink> so the server sits at a fixed IP on your network.
          </li>
          <li>
            <strong>Connect in.</strong> SSH from your own computer and update the system, using the{" "}
            <LessonLink slug="linux-ssh-basics">handful of commands</LessonLink> from the Linux
            lesson.
          </li>
          <li>
            <strong>Install Docker.</strong> One script and you're ready to run anything. See{" "}
            <LessonLink slug="install-docker">meeting Docker</LessonLink>.
          </li>
          <li>
            <strong>Run the app.</strong> A folder, a{" "}
            <LessonLink slug="install-your-first-app">compose file, and{" "}
            <code>docker compose up -d</code></LessonLink>, then open it at{" "}
            <code>server-ip:port</code>.
          </li>
          <li>
            <strong>Make sure the data is safe.</strong> Confirm the app maps a{" "}
            <LessonLink slug="storage-and-volumes">volume for its data</LessonLink> so an update
            can't wipe it.
          </li>
          <li>
            <strong>Set up backups.</strong> Automate a copy of your <code>~/apps</code> folders and{" "}
            <LessonLink slug="backups-before-serious-apps">test a restore</LessonLink> before you
            trust the app with anything important.
          </li>
          <li>
            <strong>Reach it from anywhere.</strong> Use it at home first, then add{" "}
            <LessonLink slug="access-apps-remotely-with-tailscale">Tailscale</LessonLink> to get to
            it from your phone without exposing anything.
          </li>
        </ol>

        <h2>The same run, as one sitting</h2>
        <p>
          Steps one to three are the physical part, choosing a machine and{" "}
          <LessonLink slug="install-your-os">getting the OS onto it</LessonLink>, and their lessons
          walk every screen. From the first SSH prompt onward, here's the entire rest of the path
          as real commands. This run installs{" "}
          <a href="https://www.usememos.com/" rel="noreferrer" target="_blank">
            Memos
          </a>{" "}
          (its compose file comes straight from the official docs). Connect and get current:
        </p>

        <CodeBlock>{`ssh yourname@192.168.1.50
sudo apt update && sudo apt upgrade`}</CodeBlock>

        <p>Give the app a home and write its compose file:</p>

        <CodeBlock>{`mkdir -p ~/apps/memos && cd ~/apps/memos
nano docker-compose.yml`}</CodeBlock>

        <CodeBlock>{memosCompose}</CodeBlock>

        <p>Start it and open it:</p>

        <CodeBlock>docker compose up -d</CodeBlock>

        <p>
          In a browser, go to <code>http://192.168.1.50:5230</code> (your server's IP, port 5230),
          create the admin account, and jot a first note. Notice the compose file already passed
          the safety check from the map: the <code>./data</code> volume line means your notes live
          on the server's disk, not inside the container.
        </p>

        <p>
          Back it up with the rsync line from the{" "}
          <LessonLink slug="backups-before-serious-apps">backups lesson</LessonLink>, and do the
          two-minute restore test while the stakes are still zero. Then, if you want your notes on
          the go, <code>tailscale up</code> on the server, the app on your phone, and Memos opens
          from anywhere at the Tailscale address. That's the entire loop: nine steps on the map,
          maybe twenty minutes at the keyboard once the OS is installed.
        </p>

        <Callout tone="recommend" title="Run the loop twice">
          <p>
            Do this exact Memos run once, including the backup and the restore test, even if you
            don't keep the app. Then run the same loop for the app you actually care about. The
            second pass is where you'll notice none of it is scary anymore.
          </p>
        </Callout>

        <h2>The habit that keeps it alive</h2>
        <p>
          A home server mostly runs itself, but a short monthly routine catches problems while
          they're small. Mine is about fifteen minutes:
        </p>

        <ul>
          <li>
            <strong>Update the system:</strong> <code>sudo apt update && sudo apt upgrade</code>.
          </li>
          <li>
            <strong>Update apps you care about:</strong> in each app's folder,{" "}
            <code>docker compose pull && docker compose up -d</code>.
          </li>
          <li>
            <strong>Glance at the safety nets:</strong> is Uptime Kuma green, and does the backup
            drive show fresh files from last night?
          </li>
          <li>
            <strong>Check disk space:</strong> <code>df -h</code> shows how full each disk is; keep
            an eye on the <code>/</code> line, and start cleaning up or planning a bigger disk when
            it passes about 80%.
          </li>
        </ul>

        <h2>Where to go from here</h2>
        <p>
          That's the entire beginner path. From here, more apps are just repeats of the same loop,
          and the "advanced" topics, reverse proxies, a NAS for storage, Proxmox, public access with
          a domain, are things you'll pick up naturally when a specific need shows up, not before.
        </p>

        <p>
          You've gone from "self-hosting sounds hard" to running, backing up, and reaching your own
          apps from anywhere. That's the whole game. Everything else is just more of what you already
          know. When you want your next app, the{" "}
          <Link href="/self-host-apps">directory</Link> is a good place to browse.
        </p>
    </LessonPage>
  );
}
