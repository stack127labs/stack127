import { Activity, BarChart3, CreditCard, Database, Headset, KeyRound, LayoutGrid, Mail, Server, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  payments: CreditCard,
  hosting: Server,
  databases: Database,
  "error-monitoring": Activity,
  "customer-support": Headset,
  email: Mail,
  analytics: BarChart3,
  auth: KeyRound,
};

export function CategoryIcon({ slug, size }: { slug: string; size?: number }) {
  const Icon = icons[slug] ?? LayoutGrid;
  return <Icon aria-hidden="true" size={size} strokeWidth={2.2} />;
}
