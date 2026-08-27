import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { containerDataSplitArt } from "./art/container-data-split";

const lesson = getLesson("storage-and-volumes");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          This is the lesson that saves you from the worst beginner mistake: wiping data you can't
          get back. The rule is simple once it clicks. The container is disposable. Your data is
          not. The whole job is keeping those two apart.
        </p>

        <p>
          Your first app, Excalidraw, was simple enough to keep everything in your browser, so
          there was nothing on the server to lose. But the moment you install something that has to
          remember things, notes, photos, accounts, its data lives inside the container, and you
          have to make sure it lands somewhere safe. That's the whole job of a volume.
        </p>

        <p>
          Take that <code>./data:/app/data</code> line you saw in the last lesson. Inside the
          container, the app writes to <code>/app/data</code>. That line maps it to a real{" "}
          <code>data</code> folder on your server's disk, outside the container. So when you delete
          and recreate the container, the app comes back and finds all its stuff exactly where it
          left it.
        </p>

        <MarkerArt
          caption="The container can be replaced, but the mapped data folder must survive."
          svg={containerDataSplitArt}
        />

        <h2>Two ways to keep data, and which to use</h2>
        <p>
          You'll see both in the wild. A <strong>bind mount</strong> is a real folder you can see
          and open, like the <code>./data</code> in your app's folder. A <strong>named volume</strong>{" "}
          is storage Docker manages for you, written like <code>app-data:/app/data</code> with a
          matching <code>volumes:</code> block at the bottom of the file. Both persist your data.
        </p>

        <p>
          As a beginner, I'd lean toward bind mounts, the <code>./data</code> style, because you
          can actually see the files, copy them, and back them up without any Docker commands. Named
          volumes are tidier and a bit safer from accidental edits, but they're less obvious to find
          when you want to grab a backup. Either is fine; just know which one an app is using so you
          know where its data actually sits.
        </p>

        <h2>Config, media, and databases</h2>
        <p>
          Not all data is the same weight. An app's <strong>config</strong> is small but annoying to
          recreate, your settings, accounts, preferences. <strong>Media</strong> like photos or
          videos is big and often the whole reason you're hosting. A <strong>database</strong> is
          the app's memory, and it needs a little extra care: copying its files while it's running
          can give you a broken copy, so proper backups of a database use a dump instead of a plain
          file copy. More on that in the{" "}
          <LessonLink slug="backups-before-serious-apps">backups lesson</LessonLink>, two stops from
          here.
        </p>

        <Callout tone="warning" title="The mistake that eats data">
          <p>
            An app with no volume line stores its data inside the container. The moment you recreate
            that container, to update it, to change a setting, the data is gone. If you install
            something and its instructions don't map a volume for its data, that's a red flag. Add
            one before you put anything you care about into it.
          </p>
        </Callout>

        <p>
          Keep every app in its own folder under something like <code>~/apps</code>, with its
          compose file and its <code>data</code> folder together. Then "back up my apps" just means
          "copy these folders", which is exactly where this course is headed. The path there runs
          through one more stop on purpose: practice the install pattern on{" "}
          <LessonLink slug="best-first-apps">a few low-stakes apps</LessonLink> first, so by the
          time backups matter, you have real folders worth protecting.
        </p>
    </LessonPage>
  );
}
