import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavCard from "@/components/NavCard";
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";
import Section from "@/components/Section";
import { allNavPaths, findTrail } from "@/lib/navigation";
import { getNavigation } from "@/lib/wordpress";

// Vangt alle menu-paden (uit het WordPress-menu) op die (nog) geen eigen route hebben:
// - item met subpagina's → overzicht met kaarten naar die subpagina's
// - item zonder subpagina's → "in de maak"-pagina met de rest van de sectie
// Zodra een pagina een eigen map krijgt (zoals over-lionitas/clubrecords) wint die
// route automatisch. Paden die niet in het menu staan → 404. Nieuwe menu-items uit
// WordPress worden on-demand gerenderd (dynamicParams staat standaard aan).

// Paden met een eigen map onder app/ — die mag de catch-all niet óók prerenderen.
const DEDICATED_ROUTES = ["/over-lionitas/clubrecords", "/lid-worden"];

export async function generateStaticParams() {
  const navigation = await getNavigation();
  return allNavPaths(navigation)
    .filter((path) => !DEDICATED_ROUTES.includes(path))
    .map((path) => ({ slug: path.slice(1).split("/") }));
}

async function resolve(params: PageProps<"/[...slug]">["params"]) {
  const { slug } = await params;
  const trail = findTrail(await getNavigation(), `/${slug.join("/")}`);
  if (!trail) notFound();
  return trail;
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const page = (await resolve(params)).at(-1)!;
  return { title: page.label, description: page.description ?? undefined };
}

export default async function NavPage({ params }: PageProps<"/[...slug]">) {
  const trail = await resolve(params);
  const page = trail.at(-1)!;
  const parent = trail.at(-2);
  const breadcrumbs = trail.map((entry, index) => ({
    label: entry.label,
    href: index < trail.length - 1 ? entry.href : null,
  }));
  const siblings = (parent?.children ?? []).filter((child) => child.id !== page.id);

  return (
    <div className="flex flex-col">
      <PageHero title={page.label} intro={page.description} breadcrumbs={breadcrumbs} />
      <Section bg="page" padTop={false}>
        {page.children.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.children.map((child, index) => (
              <li key={child.id}>
                <ScrollReveal delay={index * 0.05} className="h-full">
                  <NavCard link={child} />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <UnderConstruction />
            {parent && siblings.length > 0 && (
              <div className="mt-section">
                <h2 className="h3">Meer in {parent.label}</h2>
                <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {siblings.map((child) => (
                    <li key={child.id}>
                      <NavCard link={child} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}

function UnderConstruction() {
  return (
    <div className="rounded-panel bg-surface-soft p-6 sm:p-10">
      <p className="eyebrow text-blue">In de maak</p>
      <p className="mt-2 max-w-2xl text-body text-foreground">
        Aan deze pagina wordt nog gewerkt. Binnenkort vind je hier alle informatie.
      </p>
    </div>
  );
}
