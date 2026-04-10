"use client";

import { Navbar } from '@/components/shared/Navbar/Navbar';
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Calendar, CheckCircle2, Trophy, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Benefits() {
    const [activeTab, setActiveTab] = useState<'owners' | 'players'>('owners');

    const benefitsOwners = [
        {
            id: 1,
            title: "Más reservas",
            description: "Optimiza la ocupación de tus canchas con un sistema de reserva online disponible 24/7 para tus clientes.",
            icon: "📅",
            type: "calendar"
        },
        {
            id: 2,
            title: "Organización sin errores",
            description: "Evita solapamientos y confusiones con un calendario centralizado y sincronizado en tiempo real.",
            icon: "📋",
            type: "schedule"
        },
        {
            id: 3,
            title: "Control total del negocio",
            description: "Accede a reportes detallados, métricas de ingresos y comportamiento de tus clientes en un solo clic.",
            icon: "📊",
            type: "analytics"
        },
        {
            id: 4,
            title: "Torneos automáticos",
            description: "Gestiona fixtures, tablas de posiciones y resultados automáticamente sin planillas de Excel.",
            icon: "🏆",
            type: "tournaments"
        }
    ];

    const benefitsPlayers = [
        {
            id: 1,
            title: "Reservar es simple",
            description: "Encontrá canchas disponibles y asegurá tu turno rápidamente.",
            icon: "📅",
            type: "search"
        },
        {
            id: 2,
            title: "Resultados en vivo",
            description: "Seguí partidos, tablas y estadísticas en tiempo real.",
            icon: "⚽",
            type: "profile"
        },
        {
            id: 3,
            title: "Mejor experiencia de juego",
            description: "Torneos organizados, claros y profesionales.",
            icon: "🏆",
            type: "stats"
        },
        {
            id: 4,
            title: "Todo en un solo lugar",
            description: "Desde reservar hasta competir, sin salir de la plataforma.",
            icon: "📱",
            type: "leagues"
        }
    ];

    const benefits = activeTab === 'owners' ? benefitsOwners : benefitsPlayers;

    const renderCard = (benefit: typeof benefitsOwners[0]) => {
        switch (benefit.type) {
            case 'calendar':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 p-4">
                        <div className="flex justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500">Junio 2024</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mb-2">
                            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                            {[12, 13, 14, 15, 16, 17, 18].map((day) => (
                                <div key={day} className={`h-6 flex items-center justify-center text-[10px] rounded-full font-bold ${day === 14 ? 'bg-primary text-on-primary' : day > 13 && day < 17 ? 'bg-primary/20 text-primary' : 'text-slate-400'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 bg-primary/10 p-2 rounded-lg border border-primary/20">
                            <span className="text-[10px] font-bold text-primary">📊 +24% Reservas este mes</span>
                        </div>
                    </div>
                );
            case 'schedule':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 flex flex-col p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agenda hoy</span>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-slate-800/80 p-2 rounded flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white">(10:00 - 10:45 A)</span>
                                <span className="text-[10px] text-slate-500 italic">Confirmado</span>
                            </div>
                            <div className="bg-slate-800/40 p-2 rounded flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-300">(20:00 - F7 B)</span>
                                <span className="text-[10px] text-slate-500 italic">Pendiente</span>
                            </div>
                            <div className="bg-slate-800/80 p-2 rounded flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white">(21:00 - F5 B)</span>
                                <span className="text-[10px] text-slate-500 italic">Confirmado</span>
                            </div>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 p-4 flex flex-col justify-end">
                        <div className="flex items-end gap-1 h-24">
                            {[40, 65, 50, 85, 100].map((height, i) => (
                                <div key={i} className="w-full bg-gradient-to-t from-primary to-primary/20 rounded-t" style={{ height: `${height}%` }}></div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[8px] uppercase tracking-widest text-slate-500">Ingresos Totales</p>
                                <p className="text-lg font-black text-white">$452.000</p>
                            </div>
                            <div className="bg-green-500/10 px-2 py-1 rounded text-[10px] font-bold text-primary flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +31%
                            </div>
                        </div>
                    </div>
                );
            case 'tournaments':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🏆</span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Copa Verano 2024</span>
                        </div>
                        <table className="w-full text-[10px]">
                            <thead>
                                <tr className="text-slate-500 border-b border-white/5">
                                    <th className="text-left py-1">Pos</th>
                                    <th className="text-left py-1">Equipo</th>
                                    <th className="text-right py-1">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                <tr>
                                    <td className="py-2">1°</td>
                                    <td className="py-2 font-bold text-white">Los Galácticos</td>
                                    <td className="py-2 text-right">18</td>
                                </tr>
                                <tr className="opacity-70">
                                    <td className="py-2">2°</td>
                                    <td className="py-2">Drink Team</td>
                                    <td className="py-2 text-right">15</td>
                                </tr>
                                <tr className="opacity-50">
                                    <td className="py-2">3°</td>
                                    <td className="py-2">Real Sucio</td>
                                    <td className="py-2 text-right">12</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case 'search':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5">
                        <div className="absolute inset-0 p-4">
                            <div className="flex justify-between mb-4">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500">Próximo Turno</span>
                                <span className="material-symbols-outlined text-primary text-sm">✓</span>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-3 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-sm">⚽</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white">Cancha "El Monumental"</p>
                                        <p className="text-[8px] text-slate-400">Hoy, 20:00 hs</p>
                                    </div>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[100%]"></div>
                                </div>
                                <p className="text-[8px] text-primary mt-2 font-bold uppercase tracking-tighter">Reserva Confirmada</p>
                            </div>
                            <div className="mt-4 grid grid-cols-4 gap-1">
                                <div className="h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">19h</div>
                                <div className="h-8 rounded bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">20h</div>
                                <div className="h-8 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-slate-500">21h</div>
                                <div className="h-8 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-slate-500">22h</div>
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> En Vivo
                            </span>
                            <span className="text-[10px] text-slate-500">75'</span>
                        </div>
                        <div className="flex items-center justify-around py-4 bg-slate-900/40 rounded-lg flex-1">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full mx-auto mb-1 flex items-center justify-center border border-blue-500/30">
                                    <span className="text-xs font-bold text-blue-400">LG</span>
                                </div>
                                <p className="text-[8px] font-bold text-white uppercase">Galácticos</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white">2</span>
                                <span className="text-slate-600">-</span>
                                <span className="text-2xl font-black text-primary">3</span>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-primary/20 rounded-full mx-auto mb-1 flex items-center justify-center border border-primary/30">
                                    <span className="text-xs font-bold text-primary">RS</span>
                                </div>
                                <p className="text-[8px] font-bold text-white uppercase">Real S.</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center px-1">
                            <span className="text-[8px] text-slate-500">Goleador: Juani P. (2)</span>
                            <span className="text-[8px] text-primary font-bold">Ver Tabla →</span>
                        </div>
                    </div>
                );
            case 'stats':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 flex flex-col items-center justify-center p-4">
                        <div className="relative">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-5xl">🏆</span>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-black text-xs shadow-lg">
                                MVP
                            </div>
                        </div>
                        <div className="mt-6 w-full space-y-1.5">
                            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-md border border-white/5">
                                <div className="w-4 h-4 bg-primary rounded-sm text-[8px] flex items-center justify-center text-on-primary font-bold">1</div>
                                <span className="text-[10px] text-white">Torneo Clausura 2024</span>
                                <span className="ml-auto text-[8px] text-slate-500">Organizado</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-md opacity-60">
                                <div className="w-4 h-4 bg-slate-700 rounded-sm text-[8px] flex items-center justify-center text-white font-bold">2</div>
                                <span className="text-[10px] text-white">Liga Senior F7</span>
                                <span className="ml-auto text-[8px] text-slate-500">En curso</span>
                            </div>
                        </div>
                    </div>
                );
            case 'leagues':
                return (
                    <div className="h-48 mb-8 bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 p-4 flex gap-3">
                        <div className="w-24 bg-slate-950 rounded-xl border border-white/10 p-2 shadow-2xl relative flex-shrink-0">
                            <div className="flex items-center gap-1 mb-2">
                                <div className="w-4 h-4 rounded-full bg-slate-800 border border-white/10"></div>
                                <div className="h-1 w-8 bg-slate-800 rounded-full"></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-4 w-full bg-primary/20 rounded flex items-center px-1">
                                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                                </div>
                                <div className="h-3 w-full bg-slate-800 rounded"></div>
                                <div className="h-3 w-3/4 bg-slate-800 rounded"></div>
                                <div className="h-8 w-full bg-primary rounded-md mt-2"></div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between px-1">
                                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-white/5 p-2 rounded-lg mb-2">
                                <p className="text-[8px] text-slate-500 mb-1">Notificación</p>
                                <p className="text-[9px] font-bold text-white leading-tight">Tu partido comienza en 30m</p>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-600"></div>
                                <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-700"></div>
                                <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-primary flex items-center justify-center text-[8px] font-bold text-on-primary">+8</div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
         
        <main className="pt-40 pb-20 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
            <Navbar  /> 
            {/* Hero Section Headings */}
            <header className="max-w-4xl mx-auto text-center mb-16">
                <span className="text-white text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Ecosistema Picadito</span>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-none">
                    Beneficios que realmente <span className="italic underline decoration-primary/40 underline-offset-8 text-primary">importan</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                    Diseñamos una herramienta pensada para potenciar cada aspecto del deporte rey, conectando a quienes gestionan con quienes juegan.
                </p>
            </header>

            {/* Modern Tabbed Interface */}
            <div className="max-w-md mx-auto mb-16">
                <div className="flex p-1 bg-slate-800 rounded-full border border-white/5">
                    <button 
                        onClick={() => setActiveTab('owners')}
                        className={`flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all ${activeTab === 'owners' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Dueños de cancha
                    </button>
                    <button 
                        onClick={() => setActiveTab('players')}
                        className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${activeTab === 'players' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Jugadores
                    </button>
                </div>
            </div>

            {/* Benefits Grid */}
            <AnimatePresence mode="wait">
                <motion.section 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32"
                >
                    {benefits.map((benefit) => (
                        <motion.div 
                            key={benefit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: benefit.id * 0.1 }}
                            className="glass-card glow-soft rounded-[24px] p-8 flex flex-col h-full transition-all duration-300 group bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-2xl hover:border-primary/70 hover:ring-2 hover:ring-primary/50 hover:bg-slate-900/70"
                        >
                            {renderCard(benefit)}
                            <h3 className="text-xl font-bold text-on-background mb-3 group-hover:text-primary transition-colors">{benefit.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-primary/80 transition-colors">{benefit.description}</p>
                        </motion.div>
                    ))}
                </motion.section>
            </AnimatePresence>

            {/* Final CTA Block */}
            <section className="max-w-7xl mx-auto">
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5 p-12 md:p-20 text-center">
                    {/* Decorative background elements */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-on-background mb-8 tracking-tighter leading-tight">
                            Empezá a usar la plataforma y llevá tu fútbol <br className="hidden md:block" /> al <span className="text-primary italic">siguiente nivel</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-black text-lg hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20">
                                Crear mi cancha
                            </button>
                            <button className="bg-slate-800 text-on-background px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-700 transition-all">
                                Ver torneos
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}