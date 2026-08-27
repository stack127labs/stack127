import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/marker-art";
import { Callout, Faq, LessonLink, LessonPage } from "../course";
import { privateRemoteAccessArt } from "./art/private-remote-access";
import { CodeBlock } from "@/app/code-block";

const lesson = getLesson("access-apps-remotely-with-tailscale");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          The obvious way to reach your apps from outside, opening a hole in your router to the
          internet, is also the one most likely to get you hacked. There's a far easier and safer
          way that I reach for every time:{" "}
          <a href="https://tailscale.com/" rel="noreferrer" target="_blank">
            Tailscale
          </a>
          . It makes your phone and your server behave as if they're on the same home network,
          wherever you are.
        </p>

        <p>
          The trick is that nothing gets exposed to the public internet at all. Tailscale builds a
          small private network just between your own devices. Your apps stay invisible to everyone
          else, but you can reach them from your laptop on hotel Wi-Fi as if you were sitting at
          home.
        </p>

        <MarkerArt
          caption="Use Tailscale for private remote access, and expose an app publicly only when others need it."
          svg={privateRemoteAccessArt}
        />

        <h2>Setting it up</h2>
        <p>
          You make a free Tailscale account, then install it on the server and on any device you
          want to reach it from. On the server:
        </p>

        <CodeBlock>{`curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up`}</CodeBlock>

        <p>
          That second command prints a link; open it, log in, and the server joins your private
          network. Then install the Tailscale app on your phone and laptop and log in with the same
          account. That's it, they can all see each other now.
        </p>

        <p>
          Tailscale gives the server its own address on this private network. Run{" "}
          <code>tailscale ip -4</code> on the server to see it, and with{" "}
          <a href="https://tailscale.com/kb/1081/magicdns" rel="noreferrer" target="_blank">
            MagicDNS
          </a>{" "}
          the machine's plain name works too, DNS doing its{" "}
          <LessonLink slug="access-apps-safely-at-home">phonebook job</LessonLink> with zero setup
          on your side. So from a hotel on the other side of the world, the whiteboard you installed
          is just <code>http://server-name:3030</code> in your phone's browser. No ports opened, no
          router touched.
        </p>

        <Callout tone="recommend" title="This is the one I'd tell a friend to use">
          <p>
            For reaching your own apps on your own devices, Tailscale is hard to beat: minutes to
            set up, nothing exposed, and it works through almost any network. Unless you have a
            specific reason to do otherwise, start here.
          </p>
        </Callout>

        <h2>The other options, honestly</h2>
        <p>
          You'll run into these, so here's where each fits. <strong>Cloudflare Tunnel</strong> is
          the pick when you want an app genuinely public, say a blog other people visit, without
          opening your router. It needs a domain name and points the public at your app through
          Cloudflare. Great for sharing, more than you need for private access.
        </p>

        <p>
          <strong>WireGuard</strong> is the technology Tailscale is built on. You can run it
          yourself for the same private-network result, but you're doing by hand what Tailscale
          automates. Worth knowing exists; not where I'd start.
        </p>

        <p>
          <strong>Port forwarding plus a domain</strong> is the old-school route: open a port on
          your router, point a domain at your home connection with dynamic DNS, and usually put a
          reverse proxy with HTTPS in front. It works, and it's how public self-hosting was done for
          years, but it exposes your apps directly to the internet, which means every one of them has
          to be locked down and kept patched. For a beginner, that's a lot of risk for something
          Tailscale solves in ten minutes.
        </p>

        <Callout tone="warning" title="Only expose what truly needs to be public">
          <p>
            The rule I'd hold onto: if only you and your household use an app, keep it private with
            Tailscale. Only reach for a public route when strangers genuinely need to visit it, and
            even then, only that one app, never your whole server.
          </p>
        </Callout>

        <Faq
          items={[
            {
              q: "Is Tailscale free for home use?",
              a: (
                <>
                  Yes, the personal plan is free and comfortably covers a home setup with your own
                  devices and family. Details are on their{" "}
                  <a href="https://tailscale.com/pricing" rel="noreferrer" target="_blank">
                    pricing page
                  </a>
                  .
                </>
              ),
            },
            {
              q: "Do I need to open ports on my router for Tailscale?",
              a: "No, and that's the whole point. Both your server and your phone make outgoing connections, so nothing on your network is exposed and your router config stays untouched.",
            },
            {
              q: "What if Tailscale the company disappears?",
              a: (
                <>
                  Your setup keeps working day to day; their coordination service mostly matters
                  for adding devices and logins. And because the underlying tech is open WireGuard,
                  there's a self-hosted replacement called{" "}
                  <a href="https://github.com/juanfont/headscale" rel="noreferrer" target="_blank">
                    Headscale
                  </a>{" "}
                  for the day you want to own that piece too. Advanced territory, but nice to know
                  the exit exists.
                </>
              ),
            },
          ]}
        />

        <p>
          At this point you've got the full picture: a server, apps, storage, backups, and access
          both at home and away. Let's put the whole thing together in one go and{" "}
          <LessonLink slug="full-walkthrough">host a real app start to finish</LessonLink>.
        </p>
    </LessonPage>
  );
}
