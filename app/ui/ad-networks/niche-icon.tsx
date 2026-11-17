import {
  Baby, Briefcase, Car, Clapperboard, Dumbbell, Gamepad2, GraduationCap, Hammer, Heart, Laptop,
  Newspaper, PawPrint, PiggyBank, Plane, Scissors, Shirt, Sprout, Tent, Trophy, Utensils,
  type SketchIcon,
} from "@/app/ui/icons";
import type { AdNetworkNicheSlug } from "@/lib/ad-network-niches";

/**
 * The one icon for each ad network niche. Every page that shows a niche icon uses `NicheIcon`,
 * so a niche looks the same everywhere. A new niche fails type checks until it gets an icon here.
 */
export const nicheIcons: Record<AdNetworkNicheSlug, SketchIcon> = {
  food: Utensils,
  "home-diy": Hammer,
  travel: Plane,
  parenting: Baby,
  "personal-finance": PiggyBank,
  "health-fitness": Dumbbell,
  "beauty-fashion": Shirt,
  gaming: Gamepad2,
  tech: Laptop,
  crafts: Scissors,
  pets: PawPrint,
  outdoors: Tent,
  gardening: Sprout,
  sports: Trophy,
  entertainment: Clapperboard,
  lifestyle: Heart,
  education: GraduationCap,
  automotive: Car,
  business: Briefcase,
  news: Newspaper,
};

/** A niche's icon: monochrome in `currentColor`, hidden from screen readers. */
export function NicheIcon({ className, size = 15, slug }: { slug: AdNetworkNicheSlug; size?: number; className?: string }) {
  const Icon = nicheIcons[slug];
  return <Icon aria-hidden="true" className={className} size={size} />;
}
