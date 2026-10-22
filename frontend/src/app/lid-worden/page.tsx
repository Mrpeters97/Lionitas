import type { Metadata } from "next";
import AanmeldFormulier from "@/components/aanmelden/AanmeldFormulier";
import NavCard from "@/components/NavCard";
import { findTrail, type NavItem } from "@/lib/navigation";
import { getNavigation } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Lid worden",
  description: "Meld je aan bij AV Lionitas. Voor Nijntje (3 t/m 5 jaar), pupillen (6 t/m 11 jaar), junioren en senioren.",
};

// "Lid worden" staat niet in het menu (het is de header-CTA); deze pagina's wel, onder Trainingen.
const RELATED_PATHS = ["/trainingen/informatie-en-tarieven", "/trainingen/proeftraining"];

export default async function LidWordenPage() {
  const navigation = await getNavigation();
  const related = RELATED_PATHS.map((path) => findTrail(navigation, path)?.at(-1)).filter(
    (link): link is NavItem => link != null,
  );

  return (
    <div className="flex flex-col">
      <AanmeldFormulier>
        {related.length > 0 && (
          <div className="mt-section">
            <h2 className="h3">Meer over lid worden</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {related.map((link) => (
                <li key={link.id}>
                  <NavCard link={link} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </AanmeldFormulier>
    </div>
  );
}
