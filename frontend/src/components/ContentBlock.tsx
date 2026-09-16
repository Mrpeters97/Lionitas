import Image from "next/image";
import type { WPImage, WPLink } from "@/lib/wordpress";
import PillLink from "@/components/PillLink";
import ScrollReveal from "@/components/ScrollReveal";

interface ContentBlockProps {
  heading: string;
  text: string;
  buttonLabel: string;
  buttonLink: WPLink | null;
  image: WPImage | null;
  imagePosition: string[] | null;
  imageFocus?: string[] | null;
  buttonVariant?: "navy" | "yellow" | "blue";
  className?: string;
}

// Elke waarde is een letterlijke Tailwind object-position-utility (geen template
// string) zodat de Tailwind-scanner 'm herkent. Namen komen 1-op-1 overeen met de
// 9 keuzes van het ACF-veld `image_focus` (gridje: boven/midden/onder × links/midden/rechts).
const OBJECT_POSITION_CLASS: Record<string, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "left-top": "object-left-top",
  "left-bottom": "object-left-bottom",
  "right-top": "object-right-top",
  "right-bottom": "object-right-bottom",
};

export default function ContentBlock({
  heading,
  text,
  buttonLabel,
  buttonLink,
  image,
  imagePosition,
  imageFocus,
  buttonVariant = "navy",
  className = "",
}: ContentBlockProps) {
  const imageOnLeft = imagePosition?.[0] === "links";
  const objectPositionClass = OBJECT_POSITION_CLASS[imageFocus?.[0] ?? "center"] ?? OBJECT_POSITION_CLASS.center;

  return (
    <div className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 ${className}`.trim()}>
      <ScrollReveal className={imageOnLeft ? "md:order-2" : ""}>
        <h2 className="h3">{heading}</h2>
        {text && <p className="mt-4 text-body text-foreground">{text}</p>}
        {buttonLink?.url && (
          <PillLink href={buttonLink.url} target={buttonLink.target} variant={buttonVariant} className="mt-6">
            {buttonLabel}
          </PillLink>
        )}
      </ScrollReveal>
      <ScrollReveal className={imageOnLeft ? "md:order-1" : ""} delay={0.15} y={32}>
        {/* Vaste hoogte via aspect-ratio (i.p.v. h-auto, dat de hoogte liet meeschalen
            met de eigen verhouding van de geüploade afbeelding) — beide contentblokken
            krijgen zo altijd exact dezelfde hoogte, ongeacht de bronafbeelding. */}
        {/* Kleinere radius op mobiel (32px oogt daar te fors) — volle rounded-media
            pas vanaf md, waar de afbeelding ook echt breder wordt. */}
        <div className="relative aspect-[750/444] w-full overflow-hidden rounded-[14px] bg-navy/10 sm:rounded-[20px] md:rounded-media">
          {image?.node && (
            <Image
              src={image.node.sourceUrl}
              alt={image.node.altText || heading}
              fill
              className={`object-cover ${objectPositionClass}`}
            />
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
