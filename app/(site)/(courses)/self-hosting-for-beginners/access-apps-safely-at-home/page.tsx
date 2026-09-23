import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { Callout, Faq, LessonLink, LessonPage } from "../course";
import { homeOnlyRoutingArt } from "./art/home-only-routing";

const lesson = getLesson("access-apps-safely-at-home");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          Before you rush to reach your apps from the outside world, it's worth appreciating how
          nice the home setup already is, and how safe. Everything you've built works over your own
          network, which means it's private by default: on a normal home router with no special
          setup, the internet has no way in.
        </p>

        <p>
          You've been opening apps at <code>server-ip:port</code> this whole time, and honestly,
          that's fine. It's not elegant, but it works, it's fast, and there's nothing exposed.
        </p>

        <h2>Why home-only is actually safe</h2>
        <p>
          This is the mental model that makes the whole safety story click. Your home has exactly
          one address the internet can see: the public IP your internet provider gives the router.
          Every device behind it, the server, your phone, the TV, gets a private address like{" "}
          <code>192.168.1.50</code> that only exists inside your network. Millions of homes reuse
          those same private numbers, because they mean nothing outside the front door.
        </p>

        <p>
          So when something on the internet pokes at your public IP, it reaches the router, and the
          router has nowhere to send it. It never asked for that traffic, no rule tells it which
          device should get it, so it drops it. That's why your apps are unreachable from outside:
          there is no path in until you deliberately create one. "Exposing an app" means exactly
          that, telling the router to forward a door to one device, and it's why this course keeps
          saying that step is a choice you make later, not something that happens by accident.
        </p>

        <p>
          That protection has three honest exceptions, all worth five minutes in your router's
          settings once. Old port forwards: if anyone ever set one up for a game server or a
          torrent client, it's still an open door, so glance at the forwarding list and delete what
          you don't recognise. UPnP: a convenience feature that lets apps open doors by themselves,
          handy for consoles, wrong for a network with a server on it, so turn it off if you can.
          And IPv6: some providers hand devices addresses that are reachable in principle, though
          nearly every home router still blocks unasked-for traffic to them by default. Check those
          three and the calm picture above genuinely holds.
        </p>

        <MarkerArt
          caption="Home apps stay private because the router has no public rule sending traffic to them."
          svg={homeOnlyRoutingArt}
        />

        <h2>Give yourself one front door</h2>
        <p>
          The one upgrade I'd make early is a dashboard. If you installed{" "}
          <LessonLink slug="best-first-apps">Homepage</LessonLink> earlier, point it at all your
          apps and bookmark just that. Now instead of remembering that Excalidraw is on{" "}
          <code>:3030</code> and something else is on <code>:8080</code>, you open one page and click
          through. It's a small thing that makes the whole setup feel like yours.
        </p>

        <h2>When you want real names, a reverse proxy</h2>
        <p>
          At some point <code>192.168.1.50:3030</code> stops feeling good and you want{" "}
          <code>draw.home</code> instead. That's a reverse proxy: one piece that sits in front of
          your apps, takes a friendly name, and quietly forwards it to the right app and port.{" "}
          <a href="https://nginxproxymanager.com/" rel="noreferrer" target="_blank">
            Nginx Proxy Manager
          </a>{" "}
          gives you a clickable UI for it;{" "}
          <a href="https://caddyserver.com/" rel="noreferrer" target="_blank">
            Caddy
          </a>{" "}
          does it from a tiny text file and handles HTTPS almost by itself.
        </p>

        <p>
          Names bring in DNS, so here's the two-sentence version of that word the course promised
          to explain. DNS is the internet's phonebook: it turns a name like stack127.com into the
          IP address your browser actually connects to. Public websites are listed in public DNS
          servers; a made-up home name like <code>draw.home</code> works only if something on your
          own network answers for it, which is the extra step a reverse proxy setup pulls in. That's
          why I'd call this optional polish rather than a beginner requirement: reach for it when
          ip-and-port genuinely annoys you, not because a tutorial said you're incomplete without it.
        </p>

        <Callout tone="note" title="Home-only is the calm default">
          <p>
            Keeping apps on your home network means the attack surface is basically nothing, there's
            no door to the internet to secure. That's the calm default this whole course is built
            around. Only open things up when you have a real reason, and even then, do it the private
            way first.
          </p>
        </Callout>

        <Faq
          items={[
            {
              q: "Can people on the internet see my home server?",
              a: "Not unless a door was opened. The internet only sees your router's public IP, and traffic nobody asked for gets dropped because no rule says where to send it. The doors worth checking once: old port forwards in the router settings, and UPnP, covered in the section above.",
            },
            {
              q: "Do I need a firewall on the server itself?",
              a: "For a home-only setup, your router is already doing the important filtering. A firewall on the server (Ubuntu ships one called ufw) is a nice later hardening step, and it matters much more if you ever expose the machine directly to the internet.",
            },
            {
              q: "Why did my apps stop loading at the old address?",
              a: "Almost always: the server's IP changed after a reboot because there's no DHCP reservation. Set one on the router, the install lesson covers it, and the address stops moving for good.",
            },
          ]}
        />

        <p>
          Which brings us to the thing you probably do eventually want: getting to your apps when
          you're not home, at work, on your phone, at a friend's place, without throwing open a door
          to the whole internet. There's a genuinely easy way to do it, so let's{" "}
          <LessonLink slug="access-apps-remotely-with-tailscale">reach your apps from anywhere</LessonLink>.
        </p>
    </LessonPage>
  );
}
