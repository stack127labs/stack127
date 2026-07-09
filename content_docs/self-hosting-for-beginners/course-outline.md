# Self-Hosting Course Outline

The ordered page plan for `/self-hosting-for-beginners`. This file is the source of truth for **what order the lessons go in and what each one covers**. Voice, page anatomy, and build conventions live in `README.md`.

## The narrative

A complete beginner should be able to start at lesson 1 knowing nothing and finish with a real app running, backed up, and reachable from their phone, without ever hitting a step that assumes something we skipped.

The old plan had a hole: it went from "pick an OS" straight to "SSH into the server", with nothing about actually installing that OS, getting the machine on the network, or finding its address. That is the moment beginners get stranded. This order fixes it by following the real path in sequence: understand it, get the machine ready, get onto it, run your first app, understand what you ran, then grow it and make it safe and reachable.

Rule for the whole course: never use a thing before the lesson that gives it. IP addresses show up when you go looking for the server, not before. Docker shows up right before the app that needs it. Volumes show up the moment you have one.

---

## Part 1 — Understand what this is

No setup yet. Give the reader the picture and the motivation before asking them to buy or install anything.

### 1. What self-hosting is, and why do you need it?
`self-hosting-for-beginners` (landing page)
- What self-hosting means in one plain idea: your apps run on a computer you own, you still open them in a browser.
- Why anyone bothers: privacy, no monthly subscriptions, control and tinkering. Honest about the cost (your time, your backups).
- How technical it really is: more than a Google account, less than programming. Names the things they'll meet (a server, a bit of networking, ports, DNS) and promises to explain each where it matters.
- Sets the path and says Linux, Docker, remote access, and hardware all come later.

### 2. The stuff I actually run on my server
`what-you-can-host`
- A personal, opinionated tour: what's actually running (photos with Immich, passwords with Vaultwarden, monitoring, ad-blocking with Pi-hole) and why.
- What the reader could run that I skipped (media with Jellyfin, Nextcloud) and why, so it's choices, not a catalog.
- The Pi-hole household warning, in context.
- Where to start: something low-stakes first, save irreplaceable data for after backups. Links to `/self-host-apps`.

### 3. The five pieces every self-hosting setup has
`basic-setup`
- The mental model: server, app, storage, network, access. One SVG diagram.
- What each piece is, in plain terms, and how they connect (your devices → router → server → app + storage).
- Why naming the pieces makes fixing things possible later (page won't load = network/access; lost settings = storage; slow = server).
- Flags the storage gotcha early: the app and its data are separate on purpose. Sets up everything that follows.

---

## Part 2 — Get the machine ready

The physical foundation. By the end of this part the reader has a running server they can reach, with no app on it yet.

### 4. Picking your first server without overthinking it
`pick-your-first-server`
- The recommendation up front: a small, quiet, low-power mini PC. Start on an old PC/laptop for free if you have one.
- What actually matters: memory, storage, power draw (it runs 24/7), noise. Raw speed rarely does.
- The options with honest takes: mini PC, old PC/laptop, Raspberry Pi (with the SD-card warning), NAS, rented VPS.
- How much memory is enough, and why Proxmox/virtualization is a later concern.

### 5. Which OS I'd put on your first server
`pick-your-operating-system`
- The pick: a plain Linux (Debian or Ubuntu Server) plus Docker, and why boring is right (every tutorial assumes it).
- Honest takes on the alternatives: CasaOS and friendly dashboards, TrueNAS and Unraid (storage-first), Proxmox (later).
- Prefer the LTS/stable release. Don't install a desktop on a server.
- This is the decision. The next lesson is actually putting it on the machine.

### 6. Getting the OS installed and onto your network  **(new — this is the missing step)**
`install-your-os`
- Download the OS image, and flash it to a USB stick (balenaEtcher or Rufus on a PC), or for a Raspberry Pi use Raspberry Pi Imager to write straight to the SD card or SSD.
- The Pi shortcut: Imager can preset your username, password, Wi-Fi, and enable SSH before first boot, so a Pi can go fully headless from the start.
- For a mini PC or old PC: plug in a monitor and keyboard just for the install, boot from the USB (the boot-menu key varies — F12, F11, Esc, Del), and walk through the installer.
- During install: create your user, and turn on the SSH server (Ubuntu has a checkbox for it). This is what lets you connect later.
- Get it on the network: Ethernet is the no-fuss choice. Then find the server's IP address, from the login screen or your router's list of connected devices.
- Make the address stop moving: set a DHCP reservation (static lease) on your router so the server keeps the same IP. You're about to depend on it.
- End state: a server that's on, on the network, at a known fixed address, with SSH waiting. You can unplug the monitor now.

### 7. Connecting in and learning to drive it
`linux-ssh-basics`
- SSH in from your own computer using the username and IP from the last lesson; the fingerprint prompt and password.
- Knowing which machine you're on: the prompt changes once you're in. This is where beginners get confused.
- Set up an SSH key so you stop typing passwords.
- The ten commands that matter: `pwd`, `ls`, `cd`, moving around, what a path is.
- Keeping it updated with `sudo apt update` / `upgrade`, and the `sudo` / `rm -rf` warning as one note.
- Editing a file with `nano`. Copying commands carefully from official docs.

---

## Part 3 — Your first app, and understanding it

The payoff, then the understanding so it isn't magic.

### 8. Meet Docker, and get it installed  **(new — replaces the old "understand Docker" slot)**
`install-docker`
- The one mental model, in plain words: an image is the app packaged up; a container is a running copy you can throw away and recreate; a port is how you reach it. That's enough to follow along.
- Why it's worth it: installs become repeatable, no hand-installing databases and dependencies.
- Install Docker and the Compose plugin on the server, and add your user to the docker group so you don't need `sudo` every time.
- Verify it works with a throwaway container. Deeper mechanics come after you've used it.

### 9. Installing your first app and making it real
`install-your-first-app`
- The first real win. Pick one beginner-safe app with a web UI.
- Make a folder for it, create a `docker-compose.yml` (we give you the exact file), and start it with `docker compose up -d`.
- Reach it in a browser at `http://server-ip:port` — this is where ports click, because you finally use one.
- Do the app's first-run setup and log in. It's running on your own machine.
- Light on theory on purpose: the next two lessons explain what you just did.

### 10. Docker Compose, explained
`understand-docker-compose`
- Read the file you just used, line by line: the service, `image`, `ports` (host:container), `volumes`, `environment`, `restart: unless-stopped`.
- The everyday commands: `up -d`, `down`, `logs`, checking `ps`, and updating an app by pulling a new image and bringing it back up.
- Why one file per app in its own folder keeps things sane. Now they can read any project's compose file.

### 11. Where your data actually lives, and why it matters
`storage-and-volumes`
- The container is disposable; the data is not. Named volumes and bind mounts (a real folder like `./data`) are where your stuff persists.
- Config vs media vs database, and which needs care.
- Why `docker compose down` is safe but deleting a volume isn't, and how to lose your data by accident if you get this wrong.
- Lands right when the reader has a real volume in front of them from lesson 9.

---

## Part 4 — Grow it, keep it safe, reach it

Turn one working app into a setup you'd actually trust and use from anywhere.

### 12. The apps I'd install next to build confidence
`best-first-apps`
- A short, opinionated menu of low-stakes, useful apps to stand up now that the pattern makes sense (Uptime Kuma, a dashboard like Homepage, Memos, Linkwarden, FreshRSS).
- What each is good for, and why these before the heavy ones. Reinforces the compose-file muscle.

### 13. Making backups boring before you trust anything important
`backups-before-serious-apps`
- What actually needs backing up: the app folders, named volumes, and databases (a proper dump, not a live copy).
- A simple approach that works, how to automate it, and keeping a copy off the box (the 3-2-1 idea).
- The step everyone skips: test a restore, so you know it works.
- The rule: don't host photos, passwords, or anything irreplaceable until this exists.

### 14. Reaching your apps at home, nicely
`access-apps-safely-at-home`
- How home access actually works and why `server-ip:port` is perfectly fine to start.
- Using your dashboard as the front door instead of a pile of bookmarks.
- Optional polish when you're ready: a reverse proxy (Nginx Proxy Manager or Caddy) to get real names and HTTPS at home, and local hostnames. Framed as a step up, not a requirement.
- Sets up the jump to reaching things from outside.

### 15. Reaching your apps from anywhere, the easy way
`access-apps-remotely-with-tailscale`
- The problem: getting to your apps when you're not home, without exposing them to the whole internet.
- Tailscale first: install it on the server and your phone, and reach the server from anywhere as if you were home. Why I reach for this before anything else.
- The alternatives in context, honestly: Cloudflare Tunnel, WireGuard, and the traditional port-forwarding + dynamic DNS + domain route, and its risks.
- Where DNS and domains actually come in, and when you'd genuinely expose something publicly.

### 16. Hosting a real app from start to finish
`full-walkthrough`
- The capstone: bare machine to a running, backed-up, remotely-reachable app, tying every lesson together.
- Server → OS install → on the network → SSH → Docker → app → understand it → storage → backup → remote access, as one continuous story with a checklist.
- Points back to the earlier lessons instead of re-explaining, so it reads as the victory lap.

---

## Where each concept is introduced

Proof that nothing is skipped and nothing shows up early. Each idea is taught in exactly one place, the first time it's needed.

| Concept | First introduced in |
| --- | --- |
| What an app / server / storage is | 3. The five pieces |
| Choosing hardware | 4. Pick a server |
| Flashing a USB, running an installer, enabling SSH | 6. Install the OS |
| Connecting the server to the network, finding its IP | 6. Install the OS |
| Fixing the server's address (DHCP reservation) | 6. Install the OS |
| SSH, the shell, paths, `sudo`, updates | 7. Connect in |
| Images, containers, ports (the idea) | 8. Meet Docker |
| Running a container, `docker compose up`, using a port | 9. First app |
| Reading a compose file, everyday Docker commands | 10. Compose explained |
| Volumes, bind mounts, keeping data safe | 11. Storage and volumes |
| Backups, restores, 3-2-1 | 13. Backups |
| Reverse proxy, local names and HTTPS | 14. Access at home |
| Tailscale, remote access, DNS, domains, port forwarding | 15. Remote access |

## Changes from the previous plan

- Added **6. Install the OS and get on your network** — the missing practical step between choosing an OS and using the server. Covers flashing, the installer, enabling SSH, Ethernet, finding the IP, and setting a DHCP reservation.
- Split Docker into **8. Meet Docker and install it** (the idea plus setup, before the first app) and **10. Docker Compose explained** (the deep read, after). Retires the standalone `understand-docker` page.
- Moved the server's fixed address out of the old "access at home" lesson and into **6**, where the reader first needs it.
- Reordered Part 4 so understanding (compose, storage) comes right after the first-app win, then more apps, then backups, then home and remote access.
- Result is 16 lessons in one continuous path, up from the earlier order that jumped over setup.

---

_Internal planning doc. Created 2026-07-04, last updated 2026-07-04._
