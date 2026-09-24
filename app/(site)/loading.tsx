import { AppShell } from "../ui/site/app-shell";
import { PageCanvas } from "../ui/site/page-canvas";

export default function Loading() {
  return <AppShell mainLabel="Opening page"><PageCanvas><p role="status">Opening page…</p></PageCanvas></AppShell>;
}
