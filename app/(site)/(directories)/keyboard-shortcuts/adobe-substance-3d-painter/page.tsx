import app from "@/lib/shortcuts/apps/adobe-substance-3d-painter";
import { KeyboardShortcutsAppPage } from "../keyboard-shortcuts-app-page";
import Intro from "./content/intro.mdx";

export default function KeyboardShortcutsPage() {
  return <KeyboardShortcutsAppPage app={app} intro={<Intro />} />;
}
