import type { Metadata } from "next";
import { ReactLenis } from "lenis/react";
import generalSans from "@/fonts/general-sans";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getNavigation } from "@/lib/wordpress";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Lionitas", template: "%s | Lionitas" },
  description: "Atletiekvereniging Lionitas in Leeuwarden",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const navigation = await getNavigation();

  return (
    <html lang="nl" className={`${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
          {/* WCAG 2.4.1: skiplink — eerste tab-stop, buiten beeld tot hij focus krijgt
              (translate i.p.v. sr-only: `not-sr-only` zou padding en positie resetten). */}
          <a
            href="#main"
            className="fixed left-4 top-4 z-[60] -translate-y-[200%] rounded-pill bg-accent px-5 py-3 text-label text-navy shadow-lg transition-transform focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy motion-reduce:transition-none"
          >
            Ga naar de inhoud
          </a>
          <Header navigation={navigation} />
          {/* relative z-10 + eigen achtergrond: zonder dit "schemert" het fixed
              LIONITAS-paneel in de footer (zie WordmarkReveal) door secties heen die
              zelf geen expliciete z-index/achtergrond hebben (bv. FaqGallerySection) —
              het paneel mag pas zichtbaar worden ná de footer, nergens eerder. */}
          <main id="main" tabIndex={-1} className="relative z-10 flex flex-1 flex-col bg-background outline-none">{children}</main>
          <Footer />
        </ReactLenis>
      </body>
    </html>
  );
}
