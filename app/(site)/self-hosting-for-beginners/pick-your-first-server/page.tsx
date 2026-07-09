import { getLesson } from "@/lib/self-hosting-for-beginners";
import { MarkerArt } from "../../../marker-art";
import { Faq, LessonLink, LessonPage } from "../course";
import { firstServerChoiceArt } from "./art/first-server-choice";

const lesson = getLesson("pick-your-first-server");

const options = [
  {
    option: "A laptop or PC you already own",
    best: "Starting free and finding out if you enjoy this. The ideal first server.",
  },
  {
    option: "Mini PC",
    best: "The sweet spot when buying: an Intel N100, 16GB RAM, a 500GB SSD. Silent, around 10 to 15W, runs a dozen apps.",
  },
  {
    option: "Raspberry Pi",
    best: "One small app, or network-wide ad blocking with Pi-hole. Boot from an SSD, not the SD card.",
  },
  {
    option: "A NAS (bought or self-built)",
    best: "A dedicated box for storing files and keeping them safe across several drives. It can run apps too, but works better as a later addition than a first server.",
  },
  {
    option: "Rented VPS (e.g. Hetzner)",
    best: "No hardware to own, but your data lives in a data centre instead of your home.",
  },
];

export default function Page() {
  return (
    <LessonPage currentSlug={lesson.slug} heading={lesson.heading}>
        <p className="lesson-lede">
          If you're just starting out, the best server is one you already own: an old laptop, or a
          desktop you don't use much. Self-hosting runs on almost any machine with a decent
          processor, a few gigabytes of RAM, and some storage, and the one gathering dust in a
          drawer costs nothing to try.
        </p>

        <p>
          Starting on hardware you already have means you find out whether you enjoy this before
          spending a cent. Overbuying is the classic first mistake: a shiny new box, a couple of
          apps, and the novelty wears off. Prove the habit sticks, then upgrade once you know what
          you actually run.
        </p>

        <p>Here's the shortlist, from what you've already got to what you'd buy:</p>

        <table className="lesson-table">
          <thead>
            <tr>
              <th scope="col">Option</th>
              <th scope="col">Best for</th>
            </tr>
          </thead>
          <tbody>
            {options.map((row) => (
              <tr key={row.option}>
                <th scope="row">{row.option}</th>
                <td>{row.best}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <MarkerArt
          caption="Use hardware you already own first; buy a quiet mini PC only when the habit sticks."
          svg={firstServerChoiceArt}
        />

        <p>
          Four things matter more than raw speed, and honestly most apps barely stress any of them:
        </p>

        <ul>
          <li>
            <strong>RAM:</strong> how many apps run at once. 8GB is plenty to start; 16GB leaves
            room to grow.
          </li>
          <li>
            <strong>Storage:</strong> how much you can keep.
          </li>
          <li>
            <strong>Power draw:</strong> it runs day and night, so the watts add up on your bill.
          </li>
          <li>
            <strong>Noise:</strong> only matters if it'll sit near where you live.
          </li>
        </ul>

        <p>
          One catch with an old desktop: check its idle power before you commit. Some old towers pull
          60 to 100 watts doing nothing, which running around the clock can cost more per year than a
          new, efficient machine. The surest way to know is to measure it with a cheap plug-in power
          meter (a{" "}
          <a href="https://en.wikipedia.org/wiki/Kill_A_Watt" rel="noreferrer" target="_blank">
            Kill A Watt
          </a>
          -style monitor, around $20), plug the machine in and read the watts. Laptops rarely have
          this problem; big old towers often do.
        </p>

        <Faq
          items={[
            {
              q: "How much RAM does a home server need?",
              a: "8GB runs a comfortable handful of apps; 16GB gives you room to grow into photo libraries and databases without thinking about it. The light apps most people start with (notes, dashboards, ad blocking) use a few hundred megabytes each.",
            },
            {
              q: "Can I really use an old laptop as a server?",
              a: "Yes, and it's arguably the best first server: free, quiet, low power, and the battery rides out short power cuts. Keep the lid open a crack or set it to ignore the lid in settings, plug in Ethernet if you can, and it'll happily run for years.",
            },
            {
              q: "How much electricity does a home server use?",
              a: "A mini PC or laptop idling at 10 to 15 watts costs a few dollars a year in most places. The machines to watch are old desktop towers, which can idle at 60 to 100 watts; measure before committing one to 24/7 duty.",
            },
          ]}
        />

        <p>
          Whatever you land on, the next step is the same: getting an operating system onto it. Let's
          pick <LessonLink slug="pick-your-operating-system">which one to use</LessonLink>.
        </p>
    </LessonPage>
  );
}
