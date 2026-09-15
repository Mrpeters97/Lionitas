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
  buttonVariant?: "navy" | "yellow" | "blue";
  className?: string;
}

export default function ContentBlock({
  heading,
  text,
  buttonLabel,
  buttonLink,
  image,
  imagePosition,
  buttonVariant = "navy",
  className = "",
}: ContentBlockProps) {
  const imageOnLeft = imagePosition?.[0] === "links";

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
        {image?.node ? (
          <Image
            src={image.node.sourceUrl}
            alt={image.node.altText || heading}
            width={750}
            height={444}
            className="h-auto w-full rounded-media object-cover"
          />
        ) : (
          <div className="aspect-[750/444] w-full rounded-media bg-navy/10" />
        )}
      </ScrollReveal>
    </div>
  );
}
