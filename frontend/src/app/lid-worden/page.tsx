import type { Metadata } from "next";
import AanmeldFormulier from "@/components/aanmelden/AanmeldFormulier";

export const metadata: Metadata = {
  title: "Lid worden",
  description: "Meld je aan bij AV Lionitas. Voor Nijntje (3 t/m 5 jaar), pupillen (6 t/m 11 jaar), junioren en senioren.",
};

export default function LidWordenPage() {
  return (
    <div className="flex flex-col">
      <AanmeldFormulier />
    </div>
  );
}
