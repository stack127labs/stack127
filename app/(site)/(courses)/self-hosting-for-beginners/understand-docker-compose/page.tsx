import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { composePartsArt } from "./art/compose-parts";
import { CodeBlock } from "@/app/ui/site/code-block";

const lesson = getLesson("understand-docker-compose");

const compose = `services:
  excalidraw:                            # a name you choose for this app
    image: excalidraw/excalidraw:latest  # which image to run
    container_name: excalidraw           # what the running container is called
    ports:
      - "3030:80"                        # your-side : app-side
    restart: unless-stopped              # start on boot, restart if it crashes`;

const extras = `    volumes:
      - ./data:/app/data       # your folder : the app's data folder
    environment:
      - TZ=Europe/London       # a setting the app reads on startup`;

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          You ran an app from a file you didn't fully understand. Let's fix that. Once you can read
          a compose file, you can install almost anything, because nearly every self-hosted project
          hands you one of these and says "run this."
        </p>

        <p>
          A compose file is just a plain-text description of how to run an app: which image, which
          ports, where any data goes, what settings it needs. Here's the exact file from last
          lesson, annotated.
        </p>

        <CodeBlock>{compose}</CodeBlock>

        <MarkerArt
          caption="A compose file tells Docker the image, port, data folder, settings, and restart rule."
          svg={composePartsArt}
        />

        <h2>What each line is doing</h2>
        <p>
          <strong>image</strong> is the app you're running. See that <code>:latest</code> on the
          end? It means "whatever's newest". That's fine for something simple like Excalidraw, but
          on bigger apps "newest" can change under you and break things, so many people pin a
          version instead, like <code>image: someapp/thing:2</code>, to keep updates on their own
          terms. Good habit to know about now, worth doing later.
        </p>

        <p>
          <strong>ports</strong> is the line people trip on, and yours is a great example because
          the two numbers differ. It reads <code>your-side:app-side</code>. The right number,{" "}
          <code>80</code>, is the port the app uses inside its container. The left,{" "}
          <code>3030</code>, is the port you open on the server. So you visit <code>:3030</code> and
          Docker quietly hands it to the app's <code>80</code>. When two apps both want the same
          inside port, you just change the left number and they stop fighting. That's also the fix
          when Docker refuses to start something with a <code>port is already allocated</code>{" "}
          error: pick a different left number and go again.
        </p>

        <p>
          <strong>restart: unless-stopped</strong> means the app comes back on its own after a
          reboot or a crash, unless you deliberately stopped it. You want this on basically
          everything, so your apps quietly return after a power cut.
        </p>

        <h2>The two lines you'll meet on almost everything else</h2>
        <p>
          Excalidraw was simple enough to skip them, but most apps add a <strong>volumes</strong>{" "}
          and an <strong>environment</strong> section, so they'll look like this tucked under the
          service:
        </p>

        <CodeBlock>{extras}</CodeBlock>

        <p>
          <strong>volumes</strong> reads just like ports, <code>your-folder:app-folder</code>. It
          connects a real folder on your server to the folder inside the container where the app
          writes its data, which is what keeps that data alive when the container is replaced. It
          matters enough that it gets{" "}
          <LessonLink slug="storage-and-volumes">its own lesson next</LessonLink>.{" "}
          <strong>environment</strong> is just a list of settings, a timezone, a password, a
          database connection, that the app reads when it starts. When an install guide says "set
          this value", that's where it goes.
        </p>

        <h2>The five commands you'll actually use</h2>
        <p>Run these from inside the app's folder, next to its compose file:</p>

        <CodeBlock>{`docker compose up -d      # start (or apply changes), in the background
docker compose ps         # is it running?
docker compose logs -f    # watch its output; Ctrl+C to stop watching
docker compose down       # stop and remove the container
docker compose pull       # download a newer image`}</CodeBlock>

        <p>
          Updating an app is just two of those together: <code>docker compose pull</code> to grab
          the newer image, then <code>docker compose up -d</code> to restart it on the new version.
          Docker replaces the container, and for apps with a volume, the data folder is untouched,
          so nothing is lost.
        </p>

        <Callout tone="note" title="down won't delete your data">
          <p>
            For an app with a volume, <code>docker compose down</code> removes the container but
            leaves its data folder sitting on the server's disk. That's exactly why you can tear an
            app down and bring it back with everything intact. The one command that also deletes
            volumes is <code>down -v</code>, so treat that <code>-v</code> with respect.
          </p>
        </Callout>

        <p>
          That's genuinely enough Compose to run a whole server's worth of apps. The one line worth
          understanding properly is that data folder, so let's look at{" "}
          <LessonLink slug="storage-and-volumes">where your data actually lives</LessonLink>.
        </p>
    </LessonPage>
  );
}
