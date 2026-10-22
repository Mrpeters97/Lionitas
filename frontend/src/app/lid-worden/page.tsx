import type { Metadata } from "next";
import AanmeldFormulier from "@/components/aanmelden/AanmeldFormulier";
import NavCard from "@/components/NavCard";
import { findTrail } from "@/lib/navigation";
import { getNavigation } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Lid worden",
  description: "Meld je aan bij AV Lionitas. Voor Nijntje (3 t/m 5 jaar), pupillen (6 t/m 11 jaar), junioren en senioren.",
};

export default async function LidWordenPage() {
  // Subpagina's uit het menu (Informatie & Tarieven, Proeftraining) blijven onder het formulier vindbaar.
  const subpages = findTrail(await getNavigation(), "/lid-worden")?.at(-1)?.children ?? [];

  return (
    <div className="flex flex-col">
      <AanmeldFormulier>
        {subpages.length > 0 && (
          <div className="mt-section">
            <h2 className="h3">Meer over lid worden</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {subpages.map((link) => (
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
