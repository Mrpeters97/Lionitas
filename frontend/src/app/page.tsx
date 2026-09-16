import Image from "next/image";
import { getHomeContent, getPosts, type WPImage } from "@/lib/wordpress";
import ActueelSection from "@/components/ActueelSection";
import ContentBlock from "@/components/ContentBlock";
import CardSlider from "@/components/CardSlider";
import Container from "@/components/Container";
import FaqGallerySection from "@/components/FaqGallerySection";
import HomeCard from "@/components/HomeCard";
import PillLink from "@/components/PillLink";
import ScrollReveal from "@/components/ScrollReveal";
import Section from "@/components/Section";

export default async function Home() {
  const [content, posts] = await Promise.all([getHomeContent(), getPosts()]);
  const { hero, intro, card1, card2, card3, contentBlock1, contentBlock2, faq, gallery } = content;

  const cards = [card1, card2, card3];
  const faqItems = [
    { question: faq.item1Question, answer: faq.item1Answer },
    { question: faq.item2Question, answer: faq.item2Answer },
    { question: faq.item3Question, answer: faq.item3Answer },
    { question: faq.item4Question, answer: faq.item4Answer },
    { question: faq.item5Question, answer: faq.item5Answer },
  ].filter((item) => item.question);
  const galleryImages = [
    gallery.image1,
    gallery.image2,
    gallery.image3,
    gallery.image4,
    gallery.image5,
    gallery.image6,
    gallery.image7,
    gallery.image8,
    gallery.image9,
    gallery.image10,
  ].filter((image): image is WPImage => Boolean(image?.node));

  return (
    <div className="flex flex-col">
      {/* Hero — tekst gecentreerd op lichtblauw, foto als los paneel dat doorloopt in de navy-sectie */}
      <Section
        bg="brand"
        roundBottom
        z={10}
        padTop={false}
        padBottom={false}
        bare
        decoration={
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-section"
          >
            {/* Strikt inset-0: blijft binnen de eigen (afgeronde) hero-vorm, loopt nooit door
                in de volgende sectie. Natuurlijke aspect ratio (geen object-cover/w-%) — anders
                vervormt/crop de svg links onvoorspelbaar. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/decorative/strepen-top.svg"
              alt=""
              className="absolute right-0 top-0 h-full w-auto select-none opacity-[0.04]"
            />
          </div>
        }
      >
        <Container className="relative flex flex-col items-center pb-0 pt-32 text-center sm:pt-36 xl:pt-44">
          <ScrollReveal trigger="mount" duration={0.9}>
            {intro.eyebrow && <p className="eyebrow">{intro.eyebrow}</p>}
            <h1 className={`h1 xl:whitespace-nowrap text-on-dark ${intro.eyebrow ? "mt-2" : ""}`}>
              {hero.heading}
            </h1>
          </ScrollReveal>
          <ScrollReveal trigger="mount" duration={0.9} delay={0.15}>
            <p className="mt-6 max-w-2xl text-body text-on-dark-muted">{hero.text}</p>
          </ScrollReveal>
          <ScrollReveal trigger="mount" duration={0.9} delay={0.3}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {hero.primaryButtonLink?.url && (
                <PillLink href={hero.primaryButtonLink.url} variant="yellow">
                  {hero.primaryButtonLabel}
                </PillLink>
              )}
              {hero.secondaryButtonLink?.url && (
                <PillLink href={hero.secondaryButtonLink.url} variant="outline-cream">
                  {hero.secondaryButtonLabel}
                </PillLink>
              )}
            </div>
          </ScrollReveal>
        </Container>

        {hero.backgroundImage?.node && (
          <ScrollReveal
            trigger="mount"
            duration={1.1}
            delay={0.45}
            y={40}
            className="-mb-bleed-hero relative mt-14 px-4 sm:px-6 lg:px-10 xl:px-16"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-hero sm:aspect-[16/9] xl:aspect-[1738/798]">
              <Image
                src={hero.backgroundImage.node.sourceUrl}
                alt={hero.backgroundImage.node.altText || ""}
                fill
                priority
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        )}
      </Section>

      {/* Intro + cards */}
      <Section
        bg="dark"
        colorFrom="brand"
        connect
        connectExtra="var(--spacing-bleed-hero)"
        roundBottom
        padBottom={false}
        z={6}
        containerClassName="relative"
      >
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="h2 text-on-dark">{intro.heading}</h2>
          <p className="mt-4 text-body text-on-dark-muted">{intro.text}</p>
        </ScrollReveal>

        <div className="-mb-bleed-cards mt-14">
          <CardSlider>
            {cards.map((card, index) => (
              <HomeCard key={card.title} card={card} index={index} />
            ))}
          </CardSlider>
        </div>
      </Section>

      {/* Trainingen + Actueel — gedeelde cream sectie; de intro-kaarten steken hier
          bovenaan in (connectExtra), de Actueel-kaarten steken er onderaan uit (Figma-node 39:339) */}
      <Section
        bg="soft"
        colorFrom="dark"
        connect
        connectExtra="var(--spacing-bleed-cards)"
        roundBottom
        padBottom={false}
        z={5}
        bare
      >
        <Container>
          <ContentBlock
            heading={contentBlock1.heading}
            text={contentBlock1.text}
            buttonLabel={contentBlock1.buttonLabel}
            buttonLink={contentBlock1.buttonLink}
            image={contentBlock1.image}
            imagePosition={contentBlock1.imagePosition}
            imageFocus={contentBlock1.imageFocus}
            buttonVariant="yellow"
            className="md:mt-10"
          />
        </Container>

        {posts.length > 0 && (
          <Container className="mt-section">
            <ScrollReveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="display">Actueel</h2>
              <PillLink href="/actueel" variant="blue" className="shrink-0">
                Alle actuele berichten
              </PillLink>
            </ScrollReveal>

            <ScrollReveal className="-mb-bleed mt-8" delay={0.1}>
              <ActueelSection posts={posts} />
            </ScrollReveal>
          </Container>
        )}
      </Section>

      {/* Over Lionitas — vangt de doorstekende Actueel-kaarten op via connectExtra */}
      <Section bg="page" colorFrom="soft" connect connectExtra="var(--spacing-bleed)" padBottom={false} z={4}>
        <ContentBlock
          heading={contentBlock2.heading}
          text={contentBlock2.text}
          buttonLabel={contentBlock2.buttonLabel}
          buttonLink={contentBlock2.buttonLink}
          image={contentBlock2.image}
          imagePosition={contentBlock2.imagePosition}
          imageFocus={contentBlock2.imageFocus}
        />
      </Section>

      {/* FAQ + Fotogalerij */}
      <FaqGallerySection heading={faq.heading} faqItems={faqItems} galleryImages={galleryImages} />
    </div>
  );
}
