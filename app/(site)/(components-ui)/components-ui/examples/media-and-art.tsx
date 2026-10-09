import { siteDoodlePlantArt } from "@/app/(site)/art/site--doodle-plant";
import { siteDoodleSparkArt } from "@/app/(site)/art/site--doodle-spark";
import { siteDoodleStarArt } from "@/app/(site)/art/site--doodle-star";
import { backup321Art } from "@/app/ui/art/backup-321";
import { Doodle } from "@/app/ui/site/doodle";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { MediaFigure } from "@/app/ui/site/media-figure";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

export function MediaAndArtExamples() {
  return (
    <>
      <Example components={["MediaFigure"]} note="A screenshot or photo with a caption. Give it alt text that says what it shows." source="app/ui/site/media-figure.tsx" title="Image">
        <MediaFigure
          alt="Jellyfin library page with a grid of movie posters."
          caption="A media library after the first scan."
          height={542}
          kind="image"
          src="/course-images/self-hosting-for-beginners/jellyfin-media-library.jpg"
          width={1024}
        />
      </Example>

      <Example components={["MarkerArt"]} note="Hand-drawn art for a concept that is hard to explain in words. Plan it with the marker art skills." source="app/ui/site/marker-art.tsx" title="Marker art">
        <div className={styles.markerExample}>
          <MarkerArt caption="One source needs a local and an off-site backup target." svg={backup321Art} />
        </div>
      </Example>

      <Example components={["Doodle"]} note="Decoration only, hidden from screen readers. Inline doodles fill empty states. Corner doodles hide below 1100px." source="app/ui/site/doodle.tsx" title="Doodles">
        <div className={styles.doodleRow}>
          <Doodle svg={siteDoodleSparkArt} />
          <Doodle svg={siteDoodleStarArt} />
          <Doodle svg={siteDoodlePlantArt} />
        </div>
      </Example>
    </>
  );
}
