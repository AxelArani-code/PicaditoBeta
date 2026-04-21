import { getVenues } from "@/lib/queries/venues";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero/Hero";
import BenefitsSection from "@/components/seccion/BenefitsSection";
import OwnerSection from "@/components/seccion/OwnerSection";
import { Stats } from "@/components/home/Stats/Stats";
import { Testimony } from "@/components/home/Testimony/Testimony";

export const metadata: Metadata = {
    title: "Picadito - Reservas de fútbol amateur",
    description: "Encontrá y reservá canchas de fútbol cerca tuyo. La plataforma de la comunidad futbolera amateur de Argentina.",
};

export default async function HomePage() {
    const venues = await getVenues().catch(() => []);

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <Navbar />
            <main>
                <div id="inicio" className="scroll-mt-32">
                    <Hero />
                </div>
                <Stats />
                <BenefitsSection />
             
                <OwnerSection />
                <Testimony />
            </main>
            <Footer />
        </div>
    );
}

