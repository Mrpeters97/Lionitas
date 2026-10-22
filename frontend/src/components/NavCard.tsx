import { ArrowUpRight } from "lucide-react";
import { NavAnchor } from "@/components/MegaMenu";
import { ArrowIcon } from "@/components/PillLink";
import type { NavItem } from "@/lib/navigation";

/** Doorklik-kaart naar een (sub)pagina op een lichte achtergrond — overzichtspagina's en "meer in deze sectie". */
export default function NavCard({ link }: { link: NavItem }) {
  return (
    <NavAnchor
      link={link}
      className={`group flex h-full items-start justify-between gap-6 rounded-panel bg-surface p-6 transition-shadow duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:p-8 ${
        link.href ? "hover:shadow-[0_20px_50px_rgba(0,14,53,0.1)]" : ""
      }`}
    >
      <span>
        <span className="h4 block">{link.label}</span>
        {link.description && <span className="mt-2 block text-body text-on-light-muted">{link.description}</span>}
      </span>
      {link.external ? (
        <ArrowUpRight aria-hidden size={22} strokeWidth={2} className="mt-1 shrink-0 text-blue" />
      ) : (
        link.href && (
          <span className="mt-1">
            <ArrowIcon variant="navy" />
          </span>
        )
      )}
    </NavAnchor>
  );
}
