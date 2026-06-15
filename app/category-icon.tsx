import {
  Activity,
  Box,
  Code2,
  FileText,
  FolderSync,
  HousePlug,
  Images,
  KeyRound,
  Network,
  Newspaper,
  Tv,
  type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  activity: Activity,
  "code-2": Code2,
  "file-text": FileText,
  "folder-sync": FolderSync,
  "house-plug": HousePlug,
  images: Images,
  "key-round": KeyRound,
  network: Network,
  newspaper: Newspaper,
  tv: Tv,
};

export function CategoryIcon({
  iconKey,
  className,
}: {
  iconKey: string | null | undefined;
  className?: string;
}) {
  const Icon = categoryIcons[iconKey ?? ""] ?? Box;

  return <Icon aria-hidden="true" className={className} size={16} strokeWidth={2.2} />;
}
