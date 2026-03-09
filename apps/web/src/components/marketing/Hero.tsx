import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button, H1, Body, Container } from "../design-system";

export const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-surface">
            <Container className="relative py-24 text-center">
                <div className="mx-auto max-w-4xl">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-green-50 px-4 py-1.5 text-small font-semibold text-primary">
                        <Trophy className="h-4 w-4" /> La plataforma nº 1 de fútbol amateur
                    </span>
                    <H1 className="mt-4 !text-5xl sm:!text-6xl text-text-primary">
                        Reservá tu cancha,{" "}
                        <span className="text-primary">jugá tu partido</span>
                    </H1>
                    <Body className="mt-6 mx-auto max-w-2xl text-lg opacity-90">
                        Encontrá canchas disponibles, organizá tu equipo y llevá el historial
                        de tus partidos. Todo en un solo lugar.
                    </Body>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href="/canchas">
                            <Button size="lg" className="px-10">Buscar canchas</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="lg" className="px-10">Crear cuenta gratis</Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    );
};
