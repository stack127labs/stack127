import {
  Activity,
  Bookmark,
  Box,
  Code2,
  FileText,
  FolderSync,
  HousePlug,
  Images,
  KeyRound,
  LayoutDashboard,
  Network,
  Newspaper,
  PencilRuler,
  Tv,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  activity: Activity,
  bookmark: Bookmark,
  "code-2": Code2,
  "file-text": FileText,
  "folder-sync": FolderSync,
  "house-plug": HousePlug,
  images: Images,
  "key-round": KeyRound,
  "layout-dashboard": LayoutDashboard,
  network: Network,
  newspaper: Newspaper,
  "pencil-ruler": PencilRuler,
  tv: Tv,
  utensils: Utensils,
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
