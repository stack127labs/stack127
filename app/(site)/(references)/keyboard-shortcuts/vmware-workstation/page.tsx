import app from "@/lib/shortcuts/apps/vmware-workstation";
import { KeyboardShortcutsAppPage } from "../keyboard-shortcuts-app-page";

export default function KeyboardShortcutsPage() {
  return <KeyboardShortcutsAppPage app={app} />;
}
