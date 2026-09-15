import Image from "next/image";
import type { WPImage } from "@/lib/wordpress";

export default function ImageMarquee({ images }: { images: WPImage[] }) {
  if (images.length === 0) return null;

  // De verticale stagger is strikt om-en-om (nooit twee tegels op dezelfde hoogte
  // naast elkaar). Om dat óók over de naad van de oneindige loop te laten kloppen,
  // moet de herhaalde set een even aantal tegels hebben — bij een oneven aantal
  // foto's verdubbelen we de basisset eerst.
  const base = images.length % 2 === 0 ? images : [...images, ...images];

  // Twee identieke sets achter elkaar. Elke tegel draagt zijn eigen rechter-marge
  // (geen flex `gap`), zodat set 2 exact op 50% van de trackbreedte begint en de
  // translateX(-50%)-loop naadloos is.
  const track = [...base, ...base];

  return (
    <div className="overflow-hidden">
      <div className="flex w-max items-start animate-marquee motion-reduce:animate-none">
        {track.map((image, index) => (
          <div
            key={index}
            className={`mr-[2.5vw] aspect-[222/215] w-[58vw] max-w-[420px] shrink-0 overflow-hidden rounded-media sm:w-[24vw] ${
              index % 2 === 1 ? "mt-[6vw]" : ""
            }`}
          >
            <Image
              src={image.node!.sourceUrl}
              alt={image.node!.altText || ""}
              width={222}
              height={215}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
