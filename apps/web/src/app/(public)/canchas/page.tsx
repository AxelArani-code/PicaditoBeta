import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getVenues } from "@/lib/queries/venues";

export const metadata: Metadata = {
  title: "Canchas",
  description: "Explorá complejos y canchas disponibles en Picadito.",
};

export default async function VenuesPage() {
  const venues = await getVenues().catch(() => []);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-40 pb-24">
        <section className="mx-auto max-w-7xl px-6 text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-white/70">
            Red Picadito
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            Canchas y complejos para jugar sin vueltas
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Encontrá espacios disponibles, revisá complejos destacados y entrá al detalle de cada cancha desde una
            vista pública clara.
          </p>
        </section>

        <div className="mt-16">
          <VenuesList venues={venues} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
