import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "../../../marker-art";
import { Faq, LessonLink, LessonPage } from "../course";
import { backupRestoreProofArt } from "./art/backup-restore-proof";

const lesson = getLesson("backups-before-serious-apps");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          This is the boring lesson that lets you relax. Once backups run on their own and you've
          seen a restore actually work, you can hand your server real things, photos, passwords,
          documents, without that nagging feeling.
        </p>

        <p>
          Here's the mindset that matters most: a single drive is not a backup. If your data only
          exists on the server, then a dead disk, a bad update, or a fat-fingered{" "}
          <code>down -v</code> takes it with no undo. A backup is a second copy, somewhere else, that
          you can actually restore from.
        </p>

        <MarkerArt
          caption="A backup only counts after the data is copied elsewhere and restored once."
          svg={backupRestoreProofArt}
        />

        <h2>What you're actually backing up</h2>
        <p>
          Because you kept every app in its own folder under <code>~/apps</code>, with its compose
          file and its <code>data</code> folder together, "back up my server" mostly means "copy
          those folders". That's the whole payoff of setting things up tidily. Three things go in a
          backup:
        </p>

        <ul>
          <li>
            <strong>The compose files.</strong> Tiny, but they're the recipe to rebuild every app.
          </li>
          <li>
            <strong>The data folders and volumes.</strong> The actual contents, settings, photos,
            files.
          </li>
          <li>
            <strong>Databases, done properly.</strong> If an app runs a database, copying its files
            while it's live can give you a corrupt copy. Use the app's own backup or export where it
            offers one, or stop the container briefly before copying. Many small apps just use plain
            files and don't need this, but it's the one gotcha worth knowing.
          </li>
        </ul>

        <h2>The simplest real setup: a drive and a nightly copy</h2>
        <p>
          Plug an external USB drive into the server. On a server OS it won't mount itself, so this
          one-time dance introduces two commands: <code>lsblk</code> lists the drives the machine
          can see (your USB drive will show up with a name like <code>sda1</code>), and{" "}
          <code>mount</code> attaches it to a folder so you can use it.
        </p>

        <pre className="lesson-code">
          <code>{`lsblk                             # find the drive, e.g. sda1
sudo mkdir -p /mnt/backup
sudo mount /dev/sda1 /mnt/backup  # attach it at /mnt/backup`}</code>
        </pre>

        <p>
          A plain <code>mount</code> only lasts until the next reboot, and a backup that quietly
          dies at the first power cut is exactly the trap we're here to avoid. So make it permanent
          while you're at it. Ask the drive for its ID and type:
        </p>

        <pre className="lesson-code">
          <code>sudo blkid /dev/sda1</code>
        </pre>

        <p>
          Copy the <code>UUID</code> and <code>TYPE</code> values it prints, then{" "}
          <code>sudo nano /etc/fstab</code> (the file Linux reads at boot to know what to mount
          where) and add one line at the bottom:
        </p>

        <pre className="lesson-code">
          <code>UUID=paste-your-uuid-here  /mnt/backup  ext4  defaults,nofail  0  2</code>
        </pre>

        <p>
          Swap <code>ext4</code> for whatever TYPE blkid showed, and keep <code>nofail</code>: it
          means the server still boots normally if the drive is ever unplugged. Save, run{" "}
          <code>sudo mount -a</code>, and silence means it worked. Ubuntu's{" "}
          <a href="https://help.ubuntu.com/community/Fstab" rel="noreferrer" target="_blank">
            fstab guide
          </a>{" "}
          goes deeper if your drive is unusual.
        </p>

        <p>
          The copy itself is one command. <code>rsync</code> mirrors a folder and, after the first
          run, only copies what changed:
        </p>

        <pre className="lesson-code">
          <code>rsync -a ~/apps/ /mnt/backup/apps/</code>
        </pre>

        <p>
          Run it once and check the files landed. Then make the server do it every night instead of
          you: <code>crontab -e</code> opens your schedule file, and this line runs the same command
          at 3am daily.
        </p>

        <pre className="lesson-code">
          <code>0 3 * * * mountpoint -q /mnt/backup && rsync -a /home/yourname/apps/ /mnt/backup/apps/</code>
        </pre>

        <p>
          Those five fields are minute, hour, day, month, weekday;{" "}
          <a href="https://crontab.guru/" rel="noreferrer" target="_blank">
            crontab.guru
          </a>{" "}
          decodes any schedule you can dream up. Three deliberate choices in that line: full paths
          (cron doesn't know what <code>~</code> means as reliably as you do), the{" "}
          <code>mountpoint</code> check, which skips the copy entirely if the drive somehow isn't
          attached rather than dumping files onto the wrong disk, and no <code>--delete</code>{" "}
          flag, so if you fat-finger something away at home, the backup still has last night's copy
          instead of faithfully deleting it too.
        </p>

        <p>
          This setup has one honest limit: it keeps exactly one copy, last night's state. If
          something corrupts quietly and you only notice next week, the backup has the corrupted
          version too. That's what{" "}
          <a href="https://restic.net/" rel="noreferrer" target="_blank">
            restic
          </a>{" "}
          (command line) and{" "}
          <a href="https://www.duplicati.com/" rel="noreferrer" target="_blank">
            Duplicati
          </a>{" "}
          (web UI) solve: versioned snapshots, so you can step back to any point, plus encryption
          and cloud targets. Start with the rsync line tonight; graduate to one of these when the
          data starts mattering.
        </p>

        <h2>What a restore actually looks like</h2>
        <p>
          Until you've done a restore, you only believe you have backups. Prove yours works on a
          throwaway app, it takes two minutes. Pick any app with a <code>data</code> folder, run
          your rsync line, then simulate the disaster:
        </p>

        <pre className="lesson-code">
          <code>{`cd ~/apps/the-app
docker compose down
mv data data-broken                     # "lose" the data
cp -r /mnt/backup/apps/the-app/data .   # pull it back from the backup
docker compose up -d`}</code>
        </pre>

        <p>
          Open the app. If your stuff is there, your backup is real, and you now know the restore
          moves by heart. Delete <code>data-broken</code> and sleep better. Plenty of people
          discover their backups were broken on the exact day they needed them; you just checked on
          a calm Tuesday instead.
        </p>

        <h2>The 3-2-1 idea</h2>
        <p>
          The rule people repeat, and it's a good one: three copies of anything you care about, on
          two different kinds of storage, with one of them off-site. In home terms that's often the
          live copy on your server, a backup on an external drive, and a copy in cheap cloud storage
          or at a relative's house. You don't need all three on day one, but a backup that sits in
          the same box as the original won't save you from a fire or a theft.
        </p>

        <Faq
          items={[
            {
              q: "How often should I back up?",
              a: "Nightly and automated is the sweet spot for home data. The cron line above does exactly that. Anything you'd genuinely cry about losing between backups (a day of new photos, say) is a sign to back up more often or sync that data separately.",
            },
            {
              q: "Do I need to back up the containers or images?",
              a: "No. Images are redownloaded from the internet in seconds, and containers are rebuilt from your compose files. The compose files and the data folders are everything; that's why they live together under ~/apps.",
            },
            {
              q: "Where should backups go?",
              a: "An external drive is the right first step. The upgrade path is an off-site copy, cheap cloud storage through restic or Duplicati, or a drive that lives at a relative's place, because a fire or a burglary takes the server and the drive next to it together.",
            },
          ]}
        />

        <p>
          With backups running and tested, the guard rail is up. Now you can host the good stuff.
          And the natural next want is reaching it when you're out, so let's talk about{" "}
          <LessonLink slug="access-apps-safely-at-home">getting to your apps</LessonLink>, starting
          at home.
        </p>
    </LessonPage>
  );
}
