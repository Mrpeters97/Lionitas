import type { Metadata } from "next";
import ClubrecordsExplorer from "@/components/clubrecords/ClubrecordsExplorer";
import PageHero from "@/components/PageHero";
import PillLink from "@/components/PillLink";
import Section from "@/components/Section";
import { getClubRecords } from "@/lib/clubrecords";

export const metadata: Metadata = {
  title: "Clubrecords",
  description: "Alle clubrecords van AV Lionitas, outdoor en indoor — van pupil tot master.",
};

// Statisch, maar dagelijks opnieuw opgebouwd zodat het "Nieuw"-label meeschuift.
export const revalidate = 86400;

const RECORDS_CONTACT = { name: "Fokke Draaijer", email: "fokke.draaijer@gmail.com" };

export default function ClubrecordsPage() {
  const records = getClubRecords();

  const recent = new Date();
  recent.setFullYear(recent.getFullYear() - 1);
  const recentSince = recent.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col">
      <PageHero
        title="Club records"
        size="h1"
        centered
        tone="brand"
        overlap="var(--spacing-bleed-filter)"
        breadcrumbs={[{ label: "Over Lionitas", href: "/over-lionitas" }, { label: "Club records" }]}
      />

      {/* Filterpaneel valt deels in de blauwe kop (zelfde token als `overlap` hierboven). */}
      <Section bg="page" padTop={false} className="-mt-bleed-filter">
        {/* Smaller dan de paginabreedte: zelfde breedte als de header-pill (max-w-6xl). */}
        <div className="mx-auto max-w-6xl">
          <ClubrecordsExplorer records={records} recentSince={recentSince} />

          <div className="mt-section flex flex-col items-start gap-6 rounded-panel bg-surface-soft p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="h4">Nieuw clubrecord gevestigd?</h2>
              <p className="mt-2 max-w-xl text-body text-foreground">
                Een nieuw record, of een vraag of correctie over de lijst? Mail {RECORDS_CONTACT.name}.
              </p>
            </div>
            <PillLink href={`mailto:${RECORDS_CONTACT.email}`} variant="blue" className="shrink-0">
              Record doorgeven
            </PillLink>
          </div>
        </div>
      </Section>
    </div>
  );
}
