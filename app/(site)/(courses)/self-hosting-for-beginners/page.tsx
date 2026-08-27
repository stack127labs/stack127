import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/marker-art";
import { Callout, Faq, LessonLink, LessonPage } from "./course";
import { cloudOrHomeArt } from "./art/cloud-or-home";

const lesson = getLesson("");

export default function SelfHostingCoursePage() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          Normally, the apps you use are connected to the cloud, a.k.a somebody else's server.
          Your notes stay on Notion's servers, your passwords stay on Apple's, and so on. That's
          why you can reach them from anywhere with just your account.
        </p>

        <p>
          With self-hosting, instead of sending all that to someone else's server, you send it to a
          little box that lives inside your closet. That's the entire pitch, really.
        </p>

        <p>
          For example, instead of Google Photos, you can run something like{" "}
          <LessonLink slug="what-you-can-host">Immich</LessonLink>. It backs up the photos and
          videos from your phone the same way the Google Photos app does, but it sends them to your
          own machine in your home. Basically, you'll be running your own little server for the apps
          you use.
        </p>

        <MarkerArt
          caption="The same app can run in a company cloud or on a server you own at home."
          svg={cloudOrHomeArt}
        />

        <p>Let me start with the three simple questions I always get asked.</p>

        <h2>Why would anyone do this?</h2>
        <p>
          It's a reasonable thing to ask. Why go through any of this to run apps that are already
          sitting there, free, in the cloud? People come to it for different reasons. Some care
          about privacy and aren't comfortable with their photos and notes being mined. Some are
          tired of paying a monthly fee for every little thing. I personally just like to tweak
          things and understand how they work. And once you've built something that quietly runs
          and costs nothing each month, it tends to stick.
        </p>

        <p>
          There's also the plain practical bit: apps you host don't get worse overnight because a
          company changed its pricing or killed a feature. And you can run things nobody really
          sells you, like an ad blocker for every device in the house, or one dashboard that ties
          all your other apps together.
        </p>

        <p>
          It isn't free, to be clear. You trade the monthly bill for a bit of your own time, the
          occasional evening spent figuring out why something broke, and the fact that your backups
          are now your job. For me that trade is easily worth it. For you it might come down to how
          much you enjoy the tinkering.
        </p>

        <h2>Is this going to be complicated?</h2>
        <p>
          There's definitely some tinkering, some debugging, and a bit of learning involved. But
          it's not that complicated, especially if you're already a little geeky. You don't need to
          know how to program. You do need to get comfortable with a few ideas: how a server works,
          a little networking, ports, DNS, that kind of thing.
        </p>

        <p>
          And if you're already comfortable with AI tools, especially agents like Codex or Claude
          Code, this gets even easier, they can do a lot of the heavy lifting for you. One pro tip
          though: understand what's actually happening before you hand all the work off to them.
        </p>

        <p>
          If those words sound like a foreign language right now, that's completely fine. That's the
          exact gap this guide is here to close.
        </p>

        <Callout tone="note" title="You won't need all of this up front">
          <p>
            You don't have to know Linux, Docker, DNS, Tailscale, or anything about server hardware
            to start. I'll introduce each one inside the lesson where it first matters. For now,
            forget they exist.
          </p>
        </Callout>

        <h2>So how do you actually get started?</h2>
        <p>
          Here's the path, and it's shorter than it looks. First I'll show you what people actually
          run, so you have something to aim at. Then you pick a cheap little server, get an
          operating system onto it, and learn the handful of commands you need to drive it. After
          that you install a real app and open it from your own phone. That's the win this guide is
          built to get you to.
        </p>

        <p>
          The heavier topics, reaching your apps from outside the house, understanding Docker
          properly, doing backups right, all come after that, once the basics feel normal. No point
          learning remote access before you have anything running to reach.
        </p>

        <p>
          One thing worth knowing early so you don't worry about it: an app on your server doesn't
          automatically get thrown onto the public internet. By default it only works inside your
          home. Opening it up to the outside world is a separate, deliberate step you take later.
          Starting home-only is the relaxed way to learn, and it keeps you out of trouble while
          you're still finding your feet.
        </p>

        <Faq
          items={[
            {
              q: "Do I have to leave the computer on all the time?",
              a: "For apps you want available whenever you reach for them, yes, that's what makes it a server. It's less dramatic than it sounds: a mini PC idles at around 10 to 15 watts, pennies a month. Some people do shut theirs down overnight, and that's fine too, the apps are just asleep until it's back.",
            },
            {
              q: "Is self-hosting cheaper than subscriptions?",
              a: "Usually, after the first year. You pay once for a small machine (or nothing, using an old PC) plus a little electricity, instead of monthly fees for storage, photos, notes, and passwords separately. The honest part of the trade is time: you're the one doing updates and backups.",
            },
            {
              q: "Can I try it without buying anything?",
              a: (
                <>
                  Yes, and that's exactly how I'd start. An old laptop or desktop you already own is
                  a perfectly good first server; the{" "}
                  <LessonLink slug="pick-your-first-server">server lesson</LessonLink> starts from
                  that assumption.
                </>
              ),
            },
          ]}
        />

        <p>
          Ready? Let's look at{" "}
          <LessonLink slug="what-you-can-host">the stuff I actually run</LessonLink>.
        </p>
    </LessonPage>
  );
}
