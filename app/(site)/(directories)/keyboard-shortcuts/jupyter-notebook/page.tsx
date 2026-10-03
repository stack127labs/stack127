import app from "@/lib/shortcuts/apps/jupyter-notebook";
import { KeyboardShortcutsAppPage } from "../keyboard-shortcuts-app-page";

export default function KeyboardShortcutsPage() {
  return <KeyboardShortcutsAppPage app={app} />;
}
