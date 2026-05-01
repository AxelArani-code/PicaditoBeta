"use client";

import { Navbar } from '@/components/layout/Navbar';
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Calendar, CheckCircle2, Trophy, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { CTA } from '@/components/home/CTA/CTA';
import { BenefitsShowcaseSection } from '@/components/shared/BenefitsShowcaseSection/BenefitsShowcaseSection';
import { Footer } from '@/components/layout/Footer';

export default function Benefits() {
    const [activeTab, setActiveTab] = useState<'owners' | 'players'>('owners');


    return (
        <div className="overflow-x-clip bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <main className="min-h-screen pt-24 pb-20 sm:pt-28 sm:pb-24 md:pt-32 md:pb-32">
                <Navbar />
                {/* Hero Section Headings */}
                <header className="mx-auto mb-12 max-w-4xl text-center sm:mb-16">
                    <div className="mb-6 flex items-center space-x-3">
                        <div className="h-px w-8 bg-[#22c55e]/50"></div>
                        <span className="text-[#22c55e] font-bold text-xs tracking-[0.2em] uppercase">Ecosistema</span>
                    </div>
                    <h1 className="mb-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl">
                        Beneficios que realmente <span className="text-[#22c55e]">importan</span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg md:text-xl">
                        Diseñamos una herramienta pensada para potenciar cada aspecto del deporte rey, conectando a quienes gestionan con quienes juegan.
                    </p>
                </header>

                <BenefitsShowcaseSection
                    badge="Para Jugadores"
                    heading="La Experiencia de Juego Definitiva"
                    supportingText="Todo lo que necesitas para encontrar, reservar y dominar en el campo, todo en la palma de tu mano."
                    reverse
                    heroCard={{
                        title: 'Reserva en un Instante',
                        description: 'Eligir cancha, horario y confirmar tu turno nunca fue tan fácil. Olvidate de las llamadas y los mensajes de texto.',
                        imageSrc: 'https://i.pinimg.com/1200x/9c/f3/8d/9cf38ddff55590fa76c816ff243d634c.jpg',
                        imageAlt: 'Jugador lanzando un pase durante un partido de fútbol',
                    }}
                    infoCardOne={{
                        title: 'Ranking local',
                        description: 'Compara tu rendimiento y escala posiciones con tus amigos.',
                        icon: <Trophy className="w-8 h-8 text-[#1a1a1a]" />,
                        className: 'md:col-span-2 bg-[#e8efe5] rounded-[3rem] shadow-2xl shadow-black/5',
                        textClassName: 'text-[#1a1a1a]',
                    }}
                    infoCardTwo={{
                        title: 'Todo en una sola app',
                        description: 'Reserva, juego y competi desde un unico lugar.',
                        icon: <Users className="w-8 h-8 text-[#1a1a1a]" />,
                        className: 'md:col-span-2 bg-[#e8efe5] rounded-[3rem] shadow-2xl shadow-black/5',
                        textClassName: 'text-[#1a1a1a]',
                    }}
                    wideCard={{
                        title: 'Seguimiento en vivo',
                        description: 'Mira resultados, estadísticas y moomentos clave del partidos.',
                        tags: ['Ligas VIP', 'Estadísticas MVP'],
                        imageSrc: 'https://i.pinimg.com/736x/32/f5/5b/32f55bac941a4c65f087fa84d88ea706.jpg',
                        imageAlt: 'Jugador celebrando un gol con sus compañeros en un partido de fútbol',
                        className: 'md:col-span-4 bg-[#5b6a53] rounded-[3rem] shadow-2xl shadow-black/5 group',
                        textClassName: 'text-white/90',
                    }}
                />

                <BenefitsShowcaseSection
                    badge="Para Complejos"
                    heading="Gestiona profesional de tus canchas"
                    supportingText="Organiza reservas, analiza resultados y mejora tus ingresos con herramientas pensadas para dueños"
                    heroCard={{
                        title: 'Control total del negocio',
                        description: 'Accede a reportes detalllados, metricas de ingresos y comportamiennto de tus clientes en un solo click.   ',
                        imageSrc: 'https://i.pinimg.com/736x/5c/46/c2/5c46c2678a3140016467c76f99a57e25.jpg',
                        imageAlt: 'Propietario gestionando las operaciones de un complejo deportivo',
                    }}
                    infoCardOne={{
                        title: 'Metricas claras',
                        description: 'Visualiza ingresos, horarios picos y comportaminento de clientes. ',
                        icon: <BarChart3 className="w-8 h-8 text-[#1a1a1a]" />,
                        className: 'md:col-span-2 bg-[#e8efe5] rounded-[3rem] shadow-2xl shadow-black/5',
                        textClassName: 'text-[#1a1a1a]',
                    }}
                    infoCardTwo={{
                        title: 'Agenda sin errores',
                        description: 'Evitar cruces y confirma turnos de forma ordenada.',
                        icon: <Calendar className="w-8 h-8 text-[#1a1a1a]" />,
                        className: 'md:col-span-2 bg-[#e8efe5] rounded-[3rem] shadow-2xl shadow-black/5',
                        textClassName: 'text-[#1a1a1a]',
                    }}
                    wideCard={{
                        title: 'Gestion total del complejo',
                        description: 'Contola reservas, clientes y torneos desde un solo panel.',
                        tags: ['Reservas 24/7', 'Control Total'],
                        imageSrc: 'https://i.pinimg.com/1200x/b5/fd/fc/b5fdfc05c5fcf4e3fd8aebc989c01c39.jpg',
                        imageAlt: 'Gestión profesional de instalaciones deportivas con tecnología avanzada',
                        className: 'md:col-span-4 bg-[#36565f] rounded-[3rem] shadow-2xl shadow-black/5 group',
                        textClassName: 'text-white/90',
                    }}
                />


                <section className="max-w-7xl mx-auto">
                    <CTA
                        title="Empeza a usar Picadito y lleva tu juego"
                        highlight="al siguiente nivel"
                        description="Configura tu perfil, reserva canchas y sumate a torneos en minutos con una experiencia simple y profesional."
                        imageSrc="https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&q=80"
                        imageAlt="Soccer players celebrating after a match"
                        bannerText="¿Sos jugador o dueno de cancha? Sumate hoy"
                        actionLabel={activeTab === 'owners' ? 'Crear mi cancha' : 'Quiero jugar'}
                        actionHref={activeTab === 'owners' ? '/register?role=venue_owner' : '/register?role=player'}
                    />
                </section>

            </main>
            <Footer />
        </div>

    )
}