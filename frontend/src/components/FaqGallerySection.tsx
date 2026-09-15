"use client";

import { useLayoutEffect, useRef, useState } from "react";
import FaqAccordion from "@/components/FaqAccordion";
import ImageMarquee from "@/components/ImageMarquee";
import ScrollReveal from "@/components/ScrollReveal";
import type { WPImage } from "@/lib/wordpress";

interface FaqItem {
  question: string;
  answer: string | null;
}

interface FaqGallerySectionProps {
  heading: string;
  faqItems: FaqItem[];
  galleryImages: WPImage[];
}

export default function FaqGallerySection({ heading, faqItems, galleryImages }: FaqGallerySectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [bgHeight, setBgHeight] = useState<number>();

  // Meet eenmalig bij mount, zodat het achtergrondpatroon niet mee groeit/krimpt met de FAQ-accordeon animatie.
  useLayoutEffect(() => {
    if (contentRef.current) {
      setBgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  return (
    <section className="relative overflow-hidden py-section">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/decorative/strepen-blue.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full select-none object-cover opacity-[0.025]"
        style={bgHeight ? { height: bgHeight } : undefined}
      />

      <div ref={contentRef} className="relative">
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <ScrollReveal>
            <h2 className="h3 text-center">{heading}</h2>
          </ScrollReveal>
          <ScrollReveal className="mt-10" delay={0.1}>
            <FaqAccordion items={faqItems} />
          </ScrollReveal>
        </div>

        {galleryImages.length > 0 && (
          <ScrollReveal className="relative mt-24 sm:mt-32" delay={0.1}>
            <ImageMarquee images={galleryImages} />
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
