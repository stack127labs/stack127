import {
  Activity, ArrowLeftRight, BadgeCheck, BookOpen, Building2, CalendarClock,
  CalendarX, ChevronsRight, ClipboardList, Columns3, Database, FileClock,
  FileKey, FileSearch, GitBranch, Globe, HardDrive, HouseWifi, Image, Keyboard,
  Languages, Layers3, LayoutGrid, Network, RefreshCw, Route, Search,
  Server, ServerCog, ShieldCheck, SquareTerminal, TrendingUp, UserSearch,
  Wrench, type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  activity: Activity,
  "arrow-left-right": ArrowLeftRight,
  "badge-check": BadgeCheck,
  book: BookOpen,
  building2: Building2,
  "calendar-clock": CalendarClock,
  "calendar-x": CalendarX,
  "chevrons-right": ChevronsRight,
  "clipboard-list": ClipboardList,
  columns3: Columns3,
  database: Database,
  "file-clock": FileClock,
  "file-key": FileKey,
  "file-search": FileSearch,
  "git-branch": GitBranch,
  globe: Globe,
  "hard-drive": HardDrive,
  house: HouseWifi,
  image: Image,
  keyboard: Keyboard,
  languages: Languages,
  layers: Layers3,
  "layout-grid": LayoutGrid,
  network: Network,
  "refresh-cw": RefreshCw,
  route: Route,
  search: Search,
  server: Server,
  "server-cog": ServerCog,
  "shield-check": ShieldCheck,
  terminal: SquareTerminal,
  "trending-up": TrendingUp,
  "user-search": UserSearch,
  wrench: Wrench,
};

export function toolCatalogIcon(key: string | null | undefined) {
  return (key && icons[key]) || Wrench;
}
