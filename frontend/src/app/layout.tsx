import type { Metadata } from "next";
import { ReactLenis } from "lenis/react";
import generalSans from "@/fonts/general-sans";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lionitas",
  description: "Atletiekvereniging Lionitas in Leeuwarden",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
          <Header />
          {/* relative z-10 + eigen achtergrond: zonder dit "schemert" het fixed
              LIONITAS-paneel in de footer (zie WordmarkReveal) door secties heen die
              zelf geen expliciete z-index/achtergrond hebben (bv. FaqGallerySection) —
              het paneel mag pas zichtbaar worden ná de footer, nergens eerder. */}
          <main className="relative z-10 flex flex-1 flex-col bg-background">{children}</main>
          <Footer />
        </ReactLenis>
      </body>
    </html>
  );
}
