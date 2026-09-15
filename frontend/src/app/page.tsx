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
      {/* Hero */}
      <Section
        bg="dark"
        roundBottom
        z={10}
        padTop={false}
        padBottom={false}
        bare
        className="min-h-[clamp(660px,85svh,940px)] overflow-hidden"
      >
        {hero.backgroundImage?.node && (
          <>
            <Image
              src={hero.backgroundImage.node.sourceUrl}
              alt={hero.backgroundImage.node.altText || ""}
              fill
              priority
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.00)_75.36%,rgba(0,0,0,0.54)_100%),linear-gradient(0deg,rgba(0,0,0,0.50)_0%,rgba(0,0,0,0.50)_100%)]"
            />
          </>
        )}
        <Container className="relative flex min-h-[clamp(660px,85svh,940px)] flex-col justify-center py-28">
          <h1 className="h1 max-w-2xl text-on-dark">{hero.heading}</h1>
          <p className="mt-6 max-w-xl text-body text-on-dark-muted">{hero.text}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            {hero.primaryButtonLink?.url && (
              <PillLink href={hero.primaryButtonLink.url} variant="yellow">
                {hero.primaryButtonLabel}
              </PillLink>
            )}
            {hero.secondaryButtonLink?.url && (
              <PillLink href={hero.secondaryButtonLink.url} variant="outline-white">
                {hero.secondaryButtonLabel}
              </PillLink>
            )}
          </div>
        </Container>
      </Section>

      {/* Intro + cards */}
      <Section
        bg="brand"
        connect
        roundBottom
        padBottom={false}
        z={6}
        containerClassName="relative"
        decoration={
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/decorative/strepen-top.svg"
              alt=""
              className="absolute right-0 top-0 h-full w-[45%] select-none object-cover object-right opacity-40"
            />
          </div>
        }
      >
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          {intro.eyebrow && <p className="eyebrow">{intro.eyebrow}</p>}
          <h2 className="mt-2 h2 text-on-dark">{intro.heading}</h2>
          <p className="mt-4 text-body text-on-dark-muted">{intro.text}</p>
        </ScrollReveal>

        <div className="-mb-bleed-cards mt-14">
          <CardSlider>
            {cards.map((card) => (
              <HomeCard key={card.title} card={card} />
            ))}
          </CardSlider>
        </div>
      </Section>

      {/* Trainingen + Actueel — gedeelde cream sectie; de intro-kaarten steken hier
          bovenaan in (connectExtra), de Actueel-kaarten steken er onderaan uit (Figma-node 39:339) */}
      <Section
        bg="soft"
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
      <Section connect connectExtra="var(--spacing-bleed)" padBottom={false} z={4}>
        <ContentBlock
          heading={contentBlock2.heading}
          text={contentBlock2.text}
          buttonLabel={contentBlock2.buttonLabel}
          buttonLink={contentBlock2.buttonLink}
          image={contentBlock2.image}
          imagePosition={contentBlock2.imagePosition}
        />
      </Section>

      {/* FAQ + Fotogalerij */}
      <FaqGallerySection heading={faq.heading} faqItems={faqItems} galleryImages={galleryImages} />
    </div>
  );
}
