import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/marker-art";
import { LessonLink, LessonPage } from "../course";
import { calmOsPathArt } from "./art/calm-os-path";

const lesson = getLesson("pick-your-operating-system");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          The safe pick for almost everyone starting out is boring on purpose: a plain Linux, Ubuntu
          Server or Debian, with Docker on top. It runs every app in this guide, and when something
          breaks, someone has already hit the same wall and written down the fix.
        </p>

        <p>
          That last part is the real reason. Nearly every tutorial assumes Ubuntu or Debian, so when
          you paste an error into a search box at 11pm, the answer is already there. Pick something
          clever and unusual and you're on your own, debugging the platform on top of the actual
          problem. (I run Debian myself; Ubuntu Server is the more common pick in guides. Either is
          safe.)
        </p>

        <p>
          The other options aren't wrong. They trade some control for a friendlier setup or stronger
          storage, and the trap is reaching for one before you've run a single app. Here's the
          landscape:
        </p>

        <ul>
          <li>
            <strong>Ubuntu Server or Debian, plus Docker:</strong> the default, and what this guide
            uses. Fixes are easy to find because everyone runs it. Start here.
          </li>
          <li>
            <strong>CasaOS and similar dashboards:</strong> a friendly web UI that installs apps for
            you. Fine to use, but it hides what's happening, so you learn less and can get stuck
            inside it when an app misbehaves.
          </li>
          <li>
            <strong>TrueNAS or Unraid:</strong> built around storing and protecting files across
            several drives, with apps as a bonus. A strong choice if storage is your main goal.
          </li>
          <li>
            <strong>Proxmox:</strong> splits one machine into several virtual servers. Genuinely
            useful later, but a thick extra layer to learn on day one. Skip it for now.
          </li>
        </ul>

        <p>
          Plenty of people end up with both eventually, a plain box for apps and a NAS for storage,
          and that's a fine place to land. Two quick notes whichever you choose: pick the LTS or
          stable release so you're not reinstalling every few months for security updates, and don't
          install a full desktop on a server you'll never plug a monitor into, it just eats memory
          your apps could use.
        </p>

        <MarkerArt
          caption="Start with Debian or Ubuntu Server, then add Docker for apps."
          svg={calmOsPathArt}
        />

        <p>
          So: Ubuntu Server or Debian, plus Docker. Deciding is the easy part. Next you actually put
          it on the machine and get it online, the step most guides skip and where beginners get
          stranded. Let's{" "}
          <LessonLink slug="install-your-os">install the OS and get the server online</LessonLink>.
        </p>
    </LessonPage>
  );
}
