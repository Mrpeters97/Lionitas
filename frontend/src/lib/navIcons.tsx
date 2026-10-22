import {
  Accessibility,
  CalendarDays,
  ChevronRight,
  Clock,
  Euro,
  Footprints,
  GraduationCap,
  HandHeart,
  History,
  Images,
  Landmark,
  ListOrdered,
  Mail,
  MapPin,
  Medal,
  Newspaper,
  PersonStanding,
  Route,
  Shirt,
  ShieldCheck,
  Sprout,
  Timer,
  Trophy,
  Users,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";
import type { NavItem } from "@/lib/navigation";

// Icoon per menu-item, op slug: het laatste deel van het pad, of (bij externe links en
// items zonder URL) het label als slug. Werkt zo ook voor het menu uit WordPress,
// zolang de pagina's dezelfde paden houden. Nieuw item zonder icoon → ChevronRight.
const ICONS: Record<string, LucideIcon> = {
  // Over Lionitas
  "wie-zijn-wij": Users,
  geschiedenis: History,
  "veilig-sporten": ShieldCheck,
  clubrecords: Trophy,
  "club-records": Trophy,
  "bestuur-en-commissies": Landmark,
  vrijwilligers: HandHeart,
  ereleden: Medal,
  "clubtenue-webshop": Shirt,
  "atletiekbaan-en-faciliteiten": MapPin,
  "lopen-in-leeuwarden": Route,
  // Actueel
  nieuws: Newspaper,
  agenda: CalendarDays,
  uitslagen: ListOrdered,
  fotos: Images,
  nieuwsbrieven: Mail,
  // Trainingen
  jeugd: Sprout,
  jeugdtrainingen: Sprout,
  volwassenen: PersonStanding,
  "frame-running": Accessibility,
  clinics: GraduationCap,
  trainingsrooster: Clock,
  "informatie-en-tarieven": Euro,
  proeftraining: Footprints,
  "baan-atletiek": Timer,
  "weg-atletiek": Route,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function iconFor(link: NavItem): LucideIcon {
  const pathSlug = link.href && !link.external ? link.href.split("/").filter(Boolean).at(-1) : undefined;
  return (pathSlug && ICONS[pathSlug]) || ICONS[slugify(link.label)] || ChevronRight;
}

/** Klein geel lijnicoon links naast een menu-item (mega menu + mobiel menu). Decoratief. */
export function NavIcon({ link, ...props }: { link: NavItem } & LucideProps) {
  return createElement(iconFor(link), {
    "aria-hidden": true,
    size: 18,
    strokeWidth: 1.75,
    className: "mt-[3px] shrink-0 text-yellow",
    ...props,
  });
}
