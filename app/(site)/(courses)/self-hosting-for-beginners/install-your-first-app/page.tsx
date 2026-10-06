import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MediaFigure } from "@/app/ui/site/media-figure";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { firstAppLoopArt } from "./art/first-app-loop";
import { CodeBlock } from "@/app/ui/site/code-block";

const compose = `services:
  excalidraw:
    image: excalidraw/excalidraw:latest
    container_name: excalidraw
    ports:
      - "3030:80"
    restart: unless-stopped`;

export default async function Page() {
  const lesson = await getLesson("install-your-first-app");
  return (
    <LessonPage currentSlug={lesson.slug} title={lesson.title}>
        <p className="lesson-lede">
          This is the one. Everything so far has been setup; now you run a real app on your own
          server and open it in your browser. We'll use{" "}
          <a href="https://excalidraw.com/" rel="noreferrer" target="_blank">
            Excalidraw
          </a>
          , a whiteboard for sketching diagrams and ideas. You'll get what it's for the second it
          loads, which makes it a perfect first win.
        </p>

        <MarkerArt
          caption="A first app is just a folder, a compose file, one start command, and a browser URL."
          svg={firstAppLoopArt}
        />

        <h2>Make a home for it</h2>
        <p>
          SSH into your server. Give the app its own folder and move into it, this keeps each app
          tidy and separate:
        </p>

        <CodeBlock>{`mkdir -p ~/apps/excalidraw
cd ~/apps/excalidraw`}</CodeBlock>

        <h2>Write the compose file</h2>
        <p>
          Open a new file called <code>docker-compose.yml</code> with nano:
        </p>

        <CodeBlock>nano docker-compose.yml</CodeBlock>

        <p>Type or paste in exactly this, then save with Ctrl+O, Enter, and exit with Ctrl+X:</p>

        <CodeBlock>{compose}</CodeBlock>

        <MediaFigure
          alt="Nano editor showing a docker-compose.yml file for Excalidraw with image, container name, ports, and restart settings"
          caption="This is the compose file open in nano. Save it, exit, and Docker will have the instructions it needs."
          height={640}
          kind="image"
          src="/course-images/self-hosting-for-beginners/nano-docker-compose-excalidraw.jpg"
          title="Editing docker-compose.yml for Excalidraw in nano"
          width={1200}
        />

        <p>
          Don't worry about what every line means yet; the next lesson reads this file line by
          line. In short: it says which app image to run, and the <code>ports</code> line connects
          two doors. The right number is the port the app listens on inside its container, and the
          left is the port your server opens for it, the one you'll type in the browser. That's all
          Excalidraw needs, it's about as simple as an app gets.
        </p>

        <h2>Start it</h2>
        <p>One command brings it to life:</p>

        <CodeBlock>docker compose up -d</CodeBlock>

        <p>
          Docker downloads the image the first time (give it a moment), then starts the container
          in the background. The <code>-d</code> just means "run it detached", so it keeps running
          after you close your terminal.
        </p>

        <h2>Open it</h2>
        <p>
          On any device on your home network, open a browser and go to your server's address
          followed by the port:
        </p>

        <CodeBlock>http://192.168.1.50:3030</CodeBlock>

        <p>
          Swap in your own server's IP. That <code>:3030</code> is the port from the compose file,
          it's how the browser knows which app on the server you want. Excalidraw's blank canvas
          should load, and you can start drawing straight away. That's it. You're running a
          self-hosted app.
        </p>

        <Callout tone="recommend" title="Take a second to enjoy this">
          <p>
            That whiteboard is being served by a container on a machine in your home, reachable from
            your phone, costing you nothing a month. Every other app you install follows this same
            shape: a folder, a compose file, <code>docker compose up -d</code>, open the port. You've
            now done the hard part once.
          </p>
        </Callout>

        <Callout tone="note" title="This one saves in your browser">
          <p>
            One quirk worth knowing: this simple Excalidraw image keeps your drawings in your
            browser, not on the server, so there's nothing here to back up yet. That's fine, it keeps
            your first app dead simple. The moment you install something that has to remember things
            across devices, like notes or photos, that changes, and that's exactly what the storage
            lesson is about.
          </p>
        </Callout>

        <h2>If it didn't load</h2>
        <p>
          Nine times out of ten it's one of three things. Check the container is actually running
          with <code>docker compose ps</code>. Make sure you used the server's real IP, not{" "}
          <code>localhost</code> (that would mean "this device", not the server). And confirm you
          typed the port. If it's still stuck, <code>docker compose logs</code> shows what the app
          is complaining about, we'll get comfortable reading those next lesson.
        </p>

        <p>
          One more you might hit: if the start command fails with an error like{" "}
          <code>port is already allocated</code>, something else on the server is already using
          3030. Remember the two doors in the ports line: keep the app's side (<code>80</code>) as
          it is and change your server's side to something free, so <code>"3031:80"</code>. Run{" "}
          <code>docker compose up -d</code> again and open <code>:3031</code> in your browser
          instead.
        </p>

        <p>
          You have a running app you followed blind. Now let's turn that into understanding and
          read the <LessonLink slug="understand-docker-compose">compose file line by line</LessonLink>,
          so the next app isn't copy-paste but something you actually get.
        </p>
    </LessonPage>
  );
}
