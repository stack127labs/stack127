import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MediaFigure } from "@/app/media-figure";
import { MarkerArt } from "../../../marker-art";
import { Callout, LessonLink, LessonPage } from "../course";
import { sshRunsThereArt } from "./art/ssh-runs-there";
import { CodeBlock } from "../../../code-block";

const lesson = getLesson("linux-ssh-basics");

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          You'll connect to your server over SSH and control it by typing commands into a terminal.
          That's why Linux commands and SSH basics are worth learning: not to become a pro, but
          because knowing your way around pays off every time you install, fix, or update something.
          This lesson covers the small set you'll actually use.
        </p>

        <h2>Getting onto the server</h2>
        <p>
          Your server won't have a monitor plugged in. You drive it from your own computer over
          SSH, which is just a secure way to type commands on another machine. Start by opening a
          terminal on your computer: Terminal on Mac and Linux, PowerShell or Windows Terminal on
          Windows. Then connect using your server username and the IP address you pinned down in the
          install lesson:
        </p>

        <CodeBlock>ssh yourname@192.168.1.50</CodeBlock>

        <p>
          Two first-time moments are worth knowing about so they don't throw you. The server will
          ask you to confirm its fingerprint, and typing <code>yes</code> is the right answer; it's
          the two machines introducing themselves, and it only happens once. Then it asks for your
          password, and the terminal shows nothing while you type, not even dots. That's normal.
          Type it blind and press enter.
        </p>

        <MediaFigure
          alt="Terminal showing the first SSH connection prompt with the server IP address and fingerprint value blurred"
          caption="The first SSH login looks scarier than it is: check that you typed the right server address, type yes, then enter your password."
          height={590}
          kind="image"
          src="/course-images/self-hosting-for-beginners/ssh-first-login-blurred.jpg"
          title="First SSH connection prompt with sensitive values blurred"
          width={1200}
        />

        <p>
          Once you're in, the prompt changes to show the server's name, and that's your cue that
          everything you type now runs on the server, not your laptop. Forgetting which machine
          you're on is the classic beginner slip, so glance at the prompt when in doubt.
        </p>

        <MarkerArt
          caption="After SSH connects, the commands you type on your laptop run on the server."
          svg={sshRunsThereArt}
        />

        <h2>Skip the password with a key</h2>
        <p>
          Typing a password on every connection gets old fast, and an SSH key is both quicker and
          more secure. It takes two commands, run on your own computer, not the server. First,
          generate the key pair:
        </p>

        <CodeBlock>ssh-keygen</CodeBlock>

        <p>
          Press enter through every question it asks; the defaults are fine. Then hand your public
          key to the server:
        </p>

        <CodeBlock>ssh-copy-id yourname@192.168.1.50</CodeBlock>

        <p>
          It asks for your server password one last time, and from then on{" "}
          <code>ssh yourname@192.168.1.50</code> logs you straight in. Windows doesn't ship{" "}
          <code>ssh-copy-id</code>, so there PowerShell does the same job in one line, using
          whatever <code>.pub</code> filename <code>ssh-keygen</code> just printed:
        </p>

        <CodeBlock>{`type $env:USERPROFILE\\.ssh\\id_ed25519.pub | ssh yourname@192.168.1.50 "cat >> ~/.ssh/authorized_keys"`}</CodeBlock>

        <h2>Looking around</h2>
        <p>
          The whole system is just folders inside folders, and a small set of commands covers
          everyday life in there:
        </p>

        <CodeBlock>{`pwd                  # print where you are right now
ls                   # list what's in this folder
ls -la               # list everything, including hidden files
cd apps              # go into the "apps" folder
cd ..                # go back up one folder
cd ~                 # jump to your home folder from anywhere
mkdir backups        # create a folder
cp file.txt copy.txt # copy a file
mv old.txt new.txt   # move or rename a file
rm file.txt          # delete a file (no recycle bin)
cat file.txt         # print a file's contents`}</CodeBlock>

        <p>
          The one idea worth getting straight is a path: the address of a folder or file. Paths
          starting with <code>/</code> are absolute, they spell out the location from the very top
          of the system, like <code>/home/yourname/apps</code>. Paths without it are relative, they
          start from wherever you're standing: if you're in <code>/home/yourname</code>, then{" "}
          <code>cd apps</code> takes you to the same place. The <code>~</code> is a shortcut that
          always means your home folder. Half of all "no such file or directory" head-scratching is
          just an absolute path where a relative one was meant, or the other way around.
        </p>

        <h2>Keeping it updated</h2>
        <p>
          On Ubuntu or Debian, two commands refresh the list of available updates and then install
          them:
        </p>

        <CodeBlock>{`sudo apt update
sudo apt upgrade`}</CodeBlock>

        <p>
          <code>sudo</code> means "do this as the administrator," so it'll ask for your password.
          Running these every so often is basically the entire routine maintenance a small server
          needs. But that little word deserves respect.
        </p>

        <Callout tone="warning" title="Be careful with sudo">
          <p>
            <code>sudo</code> can change or delete anything on the machine, no confirmation, no undo,
            no recycle bin. So only run <code>sudo</code> commands you actually understand or got
            from a source you trust, and never paste a long one-liner you found somewhere without
            reading it first, especially anything containing <code>rm -rf</code>. That one deletes
            folders permanently, and it does not ask twice.
          </p>
        </Callout>

        <h2>Editing a file</h2>
        <p>
          Every so often you'll need to tweak a config file. <code>nano</code> is the friendly
          editor. (The file in this example, <code>docker-compose.yml</code>, is one you'll meet
          properly in <LessonLink slug="install-your-first-app">a couple of lessons</LessonLink>.)
        </p>

        <CodeBlock>nano docker-compose.yml</CodeBlock>

        <p>
          Arrow keys move the cursor, you type like normal, <kbd>Ctrl</kbd>+<kbd>O</kbd> then{" "}
          <kbd>Enter</kbd> saves, and <kbd>Ctrl</kbd>+<kbd>X</kbd> gets you out. Editors like{" "}
          <a href="https://code.visualstudio.com/" rel="noreferrer" target="_blank">
            VS Code
          </a>{" "}
          and{" "}
          <a href="https://zed.dev/" rel="noreferrer" target="_blank">
            Zed
          </a>{" "}
          can also edit files on the server remotely, which is lovely once you're editing a lot,
          but the setup is overkill for homelab needs. <code>nano</code> covers everything this
          course does.
        </p>

        <p>
          One habit ties all of this together: a lot of self-hosting is pasting commands from a
          project's official install page, and the skill is doing it carefully. Read what a command
          does before you run it, change the parts meant for you like a folder or a password, and
          paste one block at a time so you can see it worked before moving on.
        </p>

        <p>
          Before you can install anything, though, you need the one tool every app runs on. Let's{" "}
          <LessonLink slug="install-docker">meet Docker and get it installed</LessonLink>.
        </p>
    </LessonPage>
  );
}
