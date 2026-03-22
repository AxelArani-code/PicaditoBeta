import { getVenues } from "@/lib/queries/venues";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar/Navbar";
import { Footer } from "@/components/shared/Footer/Footer";
import { Hero } from "@/components/home/Hero/Hero";
import { Features } from "@/components/home/Features/Features";
import { VenuesList } from "@/components/home/VenuesList/VenuesList";
import { Stats } from "@/components/home/Stats/Stats";

export const metadata: Metadata = {
    title: "Picadito - Reservas de fútbol amateur",
    description: "Encontrá y reservá canchas de fútbol cerca tuyo. La plataforma de la comunidad futbolera amateur de Argentina.",
};

export default async function HomePage() {
    const venues = await getVenues().catch(() => []);

    return (
        <div className="min-h-screen selection:bg-primary/30">
            <Navbar />
            <main>
                <Hero />
                <Stats />
                <Features />
                <VenuesList venues={venues} />
            </main>
            <Footer />
        </div>
    );
}
