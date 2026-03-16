import Image from "next/image";
import Link from "next/link";
import { CheckSquare, TrendingUp, Users } from "lucide-react";
import { Button, Container } from "../../design-system";

export const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center">
            {/* Background decorative element */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
            </div>

            <Container className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Content */}
                    <div className="flex flex-col">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                            Más reservas,{" "}
                            <span className="text-primary">Menos Caos</span>.{" "}
                         
                        </h1>

                        <p className="mt-6 text-lg text-gray-300 max-w-xl leading-relaxed">
                            Gestioná reservas, organizá tornos y seguí{" "}
                            <strong className="text-white">resultados en tiempo real</strong>, de forma simple
                            y profesional.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-3">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-white font-semibold"
                                >
                                    Crear mi cancha
                                </Button>
                            </Link>
                            <Link href="/demo" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto px-8 border-gray-400 text-white hover:bg-white/10"
                                >
                                    Ver demo
                                </Button>
                            </Link>
                        </div>

                        {/* Features */}
                        <div className="mt-16 grid grid-cols-3 gap-8">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckSquare className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-semibold text-white">Fixture automáticas</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-semibold text-white">Tabla en vivo</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-semibold text-white">Gestión de equipos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Visual (mockup) */}
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative w-full  max-w-[1020px]   aspect-[9/16]">
                            <Image
                                src="/hero-mockup.png"
                                alt="Mockup de la aplicación Picadito"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};
