import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MediaFigure } from "@/app/media-figure";
import { MarkerArt } from "../../../marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { osOnlineChecklistArt } from "./art/os-online-checklist";

const lesson = getLesson("install-your-os");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          You've picked a machine and picked an OS. Now the part most guides skip straight over:
          actually getting that OS onto the machine, onto your network, and reachable.
        </p>

        <p>
          By the end of this you'll have a server that's on, sitting on your network at an address
          that won't change, quietly waiting for you to connect. No app yet, just a solid base.
        </p>

        <h2>Put the installer on a USB stick</h2>
        <p>
          The OS comes as a single file called an image. You write that image onto a USB stick,
          then boot the machine from the stick to install it. Download the image from the OS's site
          first, Ubuntu Server or Debian if you're following along, then write it with a free tool:{" "}
          <a href="https://etcher.balena.io/" rel="noreferrer" target="_blank">
            balenaEtcher
          </a>{" "}
          works on any computer,{" "}
          <a href="https://rufus.ie/" rel="noreferrer" target="_blank">
            Rufus
          </a>{" "}
          is the common one on Windows. Point it at the image, point it at the USB stick, hit go.
        </p>

        <MediaFigure
          alt="balenaEtcher showing Flash from file, Select target, and Flash steps for writing a server OS image to a USB stick"
          caption="balenaEtcher starts by choosing the OS image, then the USB target, then flashing the installer."
          height={774}
          kind="image"
          src="/course-images/self-hosting-for-beginners/balena-etcher-usb-installer.jpg"
          title="balenaEtcher USB installer screen for writing an OS image"
          width={1200}
        />

        <Callout tone="note" title="On a Raspberry Pi it's even easier">
          <p>
            If your server is a Pi, use{" "}
            <a href="https://www.raspberrypi.com/software/" rel="noreferrer" target="_blank">
              Raspberry Pi Imager
            </a>{" "}
            instead. It writes straight to the SD
            card or SSD, and before it does, it lets you set your username, password, Wi-Fi, and
            turn on SSH. That means the Pi can boot up ready to connect with no monitor ever
            plugged in. If you're on a Pi, do this and skip most of the next section.
          </p>
        </Callout>

        <h2>Boot the machine and run the installer</h2>
        <p>
          For a mini PC or an old PC, plug in a monitor and keyboard for now. You'll unplug them
          once SSH works; this is just for the install. Put the USB stick in and turn the machine
          on, and as it starts, tap the boot-menu key so it boots from the stick instead of its
          internal drive. That key is different on every machine, usually F12, F11, Esc, or Del,
          and the screen often flashes it for a second. If it boots normally into nothing, restart
          and try the next key.
        </p>

        <p>
          From there the installer walks you through it: language, keyboard, disk. Two choices in
          the middle matter more than the rest.
        </p>

        <ul>
          <li>
            <strong>Create your user.</strong> A username and a password you'll remember. This is
            the account you'll log in with from now on.
          </li>
          <li>
            <strong>Turn on the SSH server.</strong> Ubuntu Server literally shows a checkbox for
            "Install OpenSSH server", tick it. This is the switch that lets you connect from your
            own computer later. Forget it and you'll be stuck typing on the machine directly.
          </li>
        </ul>

        <p>
          Let it finish, remove the USB stick when it asks, and let it reboot into the fresh
          system.
        </p>

        <h2>Get it on the network and find its address</h2>
        <p>
          Plug the server into your router with an Ethernet cable. You can do Wi-Fi, but a cable is
          one less thing to configure and more reliable for something that runs all the time. It'll
          join the network on its own.
        </p>

        <p>
          If Ethernet genuinely isn't an option, say your server is a laptop living in another room,
          set Wi-Fi up inside the installer when it offers (Ubuntu's installer has a network step,
          and Raspberry Pi Imager sets it before first boot). Adding Wi-Fi from the command line
          after the fact is far more fiddly, so do it now, not later.
        </p>

        <p>
          Now you need the server's IP address, the number your own computer will use to reach it.
          Log in right on the machine with the username and password you just created. What you land
          in is a terminal: a plain text screen that takes typed commands, and the thing the next
          lesson makes you comfortable with. For now, type exactly this and press enter:
        </p>

        <pre className="lesson-code">
          <code>ip a</code>
        </pre>

        <p>
          Look for a line under your Ethernet connection like{" "}
          <code>inet 192.168.1.50</code>. That <code>192.168.1.50</code> is your server. If you'd
          rather not touch the machine, open your router's page in a browser and look at its list
          of connected devices; the server will be in there by its hostname.
        </p>

        <h2>Make the address stop moving</h2>
        <p>
          Here's the catch: by default your router can hand the server a different address every
          time it reboots. You're about to depend on that address for everything, so pin it down.
          The setting lives on your router and is usually called a DHCP reservation or a static
          lease. You reach your router's settings by typing its address into a browser, usually{" "}
          <code>192.168.1.1</code> or whatever is printed on the router's label, and logging in.
          Find your server in the device list, reserve its current address, and save.
        </p>

        <Callout tone="warning" title="Don't skip the reservation">
          <p>
            If you skip this, everything will work fine for days, then one power cut later your
            server comes back on a new address and every bookmark, every app, and your SSH
            connection all point at nothing. Five minutes now saves a confusing afternoon later.
          </p>
        </Callout>

        <p>
          That's the whole foundation. The server is on, at{" "}
          <code>192.168.1.50</code> for good, with SSH ready. You can unplug the monitor and
          keyboard now, it's headless from here. Next we actually connect to it and learn the{" "}
          <LessonLink slug="linux-ssh-basics">handful of commands</LessonLink> you'll use to run it.
        </p>

        <MarkerArt
          caption="The OS install is done only after SSH works and the server IP is reserved."
          svg={osOnlineChecklistArt}
        />
    </LessonPage>
  );
}
