import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { LessonLink, LessonPage } from "../course";
import { fivePiecesArt } from "./art/five-pieces";

const lesson = getLesson("basic-setup");

const pieces = [
  {
    name: "Server",
    what: "The always-on computer your apps run on, 24/7. A cheap mini PC counts.",
  },
  {
    name: "The app (and how it runs)",
    what: "The software itself, plus the layer that packages and runs it so installs are clean and repeatable.",
  },
  {
    name: "Storage",
    what: "Where the app keeps your data: an internal disk, an external drive, or a storage box called a NAS.",
  },
  {
    name: "Network",
    what: "How your laptop and phone reach the apps running on your server.",
  },
  {
    name: "Access",
    what: "How you actually open the app: on your home network first, then from anywhere later.",
  },
];

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          To simplify it right down to the core, self-hosting is really just five things.
          Understanding them connects all the dots you need to get started, and every app you ever
          run sits on top of the same five.
        </p>

        <table className="lesson-table">
          <thead>
            <tr>
              <th scope="col">Piece</th>
              <th scope="col">What it is</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece) => (
              <tr key={piece.name}>
                <th scope="row">{piece.name}</th>
                <td>{piece.what}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <MarkerArt
          caption="Your devices reach the app through the router. The app and its data live on the server."
          svg={fivePiecesArt}
        />

        <h2>How the five connect</h2>
        <p>
          It's easier to feel with a real app, so take Firefly III. It's a budgeting tool you run
          yourself: you log your accounts, income, and spending, set budgets, and it gives you clear
          charts of where your money actually goes. Here's how the five show up in it.
        </p>

        <p>
          It runs on your <strong>server</strong>, the always-on box. But Firefly III doesn't run
          alone, it needs somewhere to keep your financial history, so it comes up as two containers
          side by side: the <strong>app</strong> itself and a small MariaDB database. Docker Compose
          starts both with one command. Containers and Compose are new words right now, and that's
          fine, they get <LessonLink slug="install-docker">their own lessons</LessonLink> soon. Just
          follow the shape: one app, a couple of moving parts, packaged to launch together.
        </p>

        <p>
          All your accounts and transactions live in that database, and the database writes to{" "}
          <strong>storage</strong>, a folder on the server's disk that sits outside the containers
          (attachments like receipts get their own folder too). So you can update or rebuild the app
          and years of records stay put, they were never inside the app to begin with. You reach it
          over your home <strong>network</strong> in a browser at something like{" "}
          <code>192.168.1.50:8051</code>, and <strong>access</strong> starts simple: you create a
          login, use it on your laptop and phone at home, and open it up to reach from anywhere later.
        </p>

        <p>
          Every other app you run works this same way. Only the details change, which database it
          needs, which port it opens, where its files live, and the five pieces stay underneath it
          all.
        </p>

        <p>
          The reason I'm making you memorise this is that it pays off the first time something
          breaks, which it will. When a page won't load, that's almost always the network or how
          you're reaching it. When an app forgets all your settings after an update, that's storage.
          When the whole thing crawls or crashes, that's the server. Naming the piece tells you
          where to look instead of staring at it hoping.
        </p>

        <p>
          Over the next lessons we take these one at a time, filling in each box until they're all
          real on your own setup. Speaking of which, let's go get you a{" "}
          <LessonLink slug="pick-your-first-server">server</LessonLink>.
        </p>
    </LessonPage>
  );
}
