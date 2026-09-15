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
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </ReactLenis>
      </body>
    </html>
  );
}
