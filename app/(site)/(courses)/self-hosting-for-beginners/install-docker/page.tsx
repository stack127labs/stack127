import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { imageContainerPortArt } from "./art/image-container-port";
import { CodeBlock } from "@/app/code-block";

const lesson = getLesson("install-docker");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          Almost every app you'll run is packaged with Docker, and most of your self-hosting life
          happens through it: running containers, reading their logs, editing their compose files.
          It's the one tool genuinely worth getting comfortable with, so let's meet it properly and
          get it installed.
        </p>

        <h2>The whole idea, in plain words</h2>
        <p>
          Three words carry most of it. An <strong>image</strong> is an app packaged up with
          everything it needs to run, downloaded ready-made from the internet. A{" "}
          <strong>container</strong> is a running copy of that image, and the useful part is that
          it's disposable: you can stop it, delete it, and start a fresh one whenever you like. A{" "}
          <strong>port</strong> is how you reach the running app, the number you'll type after the
          server's address to open it in a browser.
        </p>

        <MarkerArt
          caption="Docker runs an image as a container, and the container is reached through a port."
          svg={imageContainerPortArt}
        />

        <p>
          Why bother with all this instead of just installing apps the normal way? Because it makes
          installs repeatable and clean. No hunting down the right version of a database, no
          dependencies fighting each other, no leftover mess when you remove something. You get the
          app's image, you run it, and if it goes wrong you throw the container away and start
          fresh. That's the whole appeal.
        </p>

        <h2>Install it</h2>
        <p>
          On Ubuntu or Debian, Docker's own install script is the simplest way in (their{" "}
          <a href="https://docs.docker.com/engine/install/" rel="noreferrer" target="_blank">
            install docs
          </a>{" "}
          also have a step-by-step apt method if you prefer). SSH into your server and run:
        </p>

        <CodeBlock>curl -fsSL https://get.docker.com | sh</CodeBlock>

        <p>
          That installs Docker and the Compose plugin (the thing you'll actually use next lesson).
          One more step saves you real annoyance: add your user to the docker group so you don't
          have to type <code>sudo</code> before every command.
        </p>

        <CodeBlock>sudo usermod -aG docker $USER</CodeBlock>

        <p>
          Log out and back in for that to take effect. Then check the whole thing works by running
          a tiny test container:
        </p>

        <CodeBlock>docker run hello-world</CodeBlock>

        <p>
          If you see a friendly "Hello from Docker!" message, you're done. Docker downloaded a tiny
          image, ran it as a container, it printed its message, and exited. That's exactly the
          cycle every real app will follow, just bigger.
        </p>

        <Callout tone="note" title="You just ran your first container">
          <p>
            That hello-world was a real container, start to finish. Nothing you install after this
            is different in kind, only in size. If this worked, the machinery is all in place.
          </p>
        </Callout>

        <p>
          Docker's ready. Now let's point it at something you'll actually keep and{" "}
          <LessonLink slug="install-your-first-app">install your first real app</LessonLink>.
        </p>
    </LessonPage>
  );
}
