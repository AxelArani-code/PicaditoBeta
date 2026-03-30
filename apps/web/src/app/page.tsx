import { getVenues } from "@/lib/queries/venues";
import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";

export const metadata: Metadata = {
    title: "Picadito - Reservas de fútbol amateur",
    description: "Encontrá y reservá canchas de fútbol cerca tuyo. La plataforma de la comunidad futbolera amateur de Argentina.",
};

export default async function HomePage() {
    const venues = await getVenues().catch(() => []);

    return <HomePageClient venues={venues} />;
}

