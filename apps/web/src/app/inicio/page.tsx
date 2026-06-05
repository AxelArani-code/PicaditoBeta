"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin, Users, Droplets, ParkingCircle } from "lucide-react";
import { isAuthenticated } from "@/lib/auth/session";

export default function InicioPage() {
    useEffect(() => {
        if (typeof window === "undefined" || !isAuthenticated()) {
            return;
        }

        window.history.replaceState({ picaditoSessionGuard: true }, "", "/inicio");
        window.history.pushState({ picaditoSessionGuard: true }, "", "/inicio");

        const keepUserInActiveSession = () => {
            if (isAuthenticated()) {
                window.history.pushState({ picaditoSessionGuard: true }, "", "/inicio");
            }
        };

        window.addEventListener("popstate", keepUserInActiveSession);

        return () => {
            window.removeEventListener("popstate", keepUserInActiveSession);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0e150e] text-[#dce5d9]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-slate-900/60 backdrop-blur-xl rounded-full mt-6 mx-auto w-[95%] max-w-7xl border border-white/10 shadow-2xl shadow-green-500/10">
                <div className="flex items-center gap-8">
                    <span className="text-2xl font-black tracking-tighter text-white italic">Picadito</span>
                    <div className="hidden md:flex gap-6 items-center">
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Teams</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Live Stats</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold uppercase">Login</Link>
                    <Link href="/register" className="bg-[#21c45d] text-[#004a1d] px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-[#1fb854] transition-colors">Get Started</Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
                {/* Hero Header */}
                <header className="mb-12 relative">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#4be176]/20 to-transparent blur-3xl pointer-events-none"></div>
                    <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
                        Encuentra tu próximo <span className="text-[#4be176]">picadito</span>.
                    </h1>
                    <p className="text-lg text-[#bccbb9] max-w-2xl mb-10">
                        Reserva las mejores canchas de la ciudad con un solo clic. Calidad profesional para tus partidos de entre semana.
                    </p>

                    {/* Search Box */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-2xl border border-white/10">
                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Location Input */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a221a] rounded-lg border border-[#3d4a3d] focus-within:border-[#4be176] transition-colors">
                                <MapPin className="h-5 w-5 text-[#4be176]" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#869585] uppercase tracking-wider">Ubicación</span>
                                    <input className="bg-transparent border-none p-0 text-white placeholder:text-[#3d4a3d] focus:ring-0 text-sm" placeholder="¿Dónde juegas?" type="text" />
                                </div>
                            </div>

                            {/* Surface Type */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a221a] rounded-lg border border-[#3d4a3d] focus-within:border-[#4be176] transition-colors">
                                <span className="text-[#4be176]">🌾</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#869585] uppercase tracking-wider">Tipo de Grama</span>
                                    <select className="bg-transparent border-none p-0 text-white focus:ring-0 text-sm appearance-none">
                                        <option>Todas las superficies</option>
                                        <option>Grama Natural</option>
                                        <option>Sintética Pro</option>
                                        <option>Fútbol Sala</option>
                                    </select>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a221a] rounded-lg border border-[#3d4a3d] focus-within:border-[#4be176] transition-colors">
                                <span className="text-[#4be176]">💰</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#869585] uppercase tracking-wider">Presupuesto</span>
                                    <input className="bg-transparent border-none p-0 text-white placeholder:text-[#3d4a3d] focus:ring-0 text-sm" placeholder="Rango de precio" type="text" />
                                </div>
                            </div>
                        </div>

                        <button className="w-full md:w-auto h-full bg-[#4be176] text-[#003915] px-10 py-4 rounded-lg font-bold hover:bg-[#3dd66e] active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Search className="h-5 w-5" />
                            Buscar
                        </button>
                    </div>
                </header>

                {/* Marketplace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span>⚙️</span> Filtros
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs font-bold text-[#869585] block mb-3 uppercase">Tamaño de Cancha</span>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="rounded" />
                                            <span className="text-sm text-[#bccbb9] group-hover:text-white transition-colors">Fútbol 5</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked className="rounded" />
                                            <span className="text-sm text-[#bccbb9] group-hover:text-white transition-colors">Fútbol 7</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="rounded" />
                                            <span className="text-sm text-[#bccbb9] group-hover:text-white transition-colors">Fútbol 11</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-[#869585] block mb-3 uppercase">Comodidades</span>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked className="rounded" />
                                            <span className="text-sm text-[#bccbb9] group-hover:text-white transition-colors">Vestuarios</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="rounded" />
                                            <span className="text-sm text-[#bccbb9] group-hover:text-white transition-colors">Iluminación LED</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="rounded" />
                                            <span className="text-sm text-[#bccbb9] group-hover:text-white transition-colors">Parking Gratuito</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Card */}
                        <div className="rounded-xl overflow-hidden relative group aspect-[3/4] bg-gradient-to-br from-[#4be176]/20 to-transparent border border-white/10">
                            <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src="https://i.pinimg.com/736x/a3/71/de/a371de7d55fabb6f9f78594d241d1ee7.jpg"
                                alt="Torneos"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e150e] via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 p-6">
                                <span className="bg-[#4be176] text-[#003915] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-2 inline-block">Pro Edition</span>
                                <h4 className="text-xl font-bold text-white">Torneos Mensuales</h4>
                                <p className="text-sm text-[#bccbb9] mb-4">Únete a la liga de élite y compite por premios reales.</p>
                                <Link href="/dashboard" className="text-[#4be176] font-bold border-b border-[#4be176] pb-1 inline-block">Ver más →</Link>
                            </div>
                        </div>
                    </aside>

                    {/* Fields Section */}
                    <section className="lg:col-span-9 space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-[#bccbb9]"><span className="text-white font-bold">24</span> canchas disponibles cerca de ti</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[#869585]">Ordenar por:</span>
                                <select className="bg-[#1a221a] border border-[#3d4a3d] text-white text-xs rounded px-3 py-2 focus:ring-0">
                                    <option>Popularidad</option>
                                    <option>Menor Precio</option>
                                    <option>Distancia</option>
                                </select>
                            </div>
                        </div>

                        {/* Field Cards */}
                        {[
                            {
                                id: 1,
                                name: "Estadio del Bosque",
                                location: "Zona Norte, Sector Empresarial",
                                rating: 4.9,
                                size: "Fútbol 7 / 8",
                                features: ["Duchas Pro", "Parking"],
                                price: "$45.000",
                                img: "https://i.pinimg.com/736x/77/73/de/7773de8e2480621c7c9ed9d348281c7a.jpg",
                                badge: "DISPONIBLE HOY",
                            },
                            {
                                id: 2,
                                name: "The Wembley Club",
                                location: "Centro Histórico, Distrito Deportes",
                                rating: 4.7,
                                size: "Fútbol 11",
                                features: ["Graderías", "Sports Bar"],
                                price: "$62.000",
                                img: "https://i.pinimg.com/736x/dd/f5/68/ddf5687ae760d60764a9be38d9247ea5.jpg",
                                badge: "ÚLTIMOS CUPOS",
                            },
                            {
                                id: 3,
                                name: "Arena Champions",
                                location: "Suba, Av. Principal",
                                rating: 4.5,
                                size: "Fútbol 5",
                                features: ["LED 4k", "Wifi Gratis"],
                                price: "$38.000",
                                img: "https://i.pinimg.com/736x/62/04/21/62042179e162da00c410e70b5aac2ab8.jpg",
                                badge: "DISPONIBLE",
                            },
                        ].map((field, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden flex flex-col md:flex-row hover:border-[#4be176]/50 transition-colors border border-white/10 group">
                                <div className="md:w-72 h-64 md:h-auto overflow-hidden relative">
                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={field.img} alt={field.name} />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-[#4be176]/90 text-[#003915] text-xs font-bold px-2 py-1 rounded-full">{field.badge}</span>
                                        <span className="bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded-full">SINTÉTICA</span>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-bold text-white">{field.name}</h3>
                                            <div className="flex items-center text-[#4be176] gap-1">
                                                <Star className="h-5 w-5 fill-current" />
                                                <span className="font-bold">{field.rating}</span>
                                            </div>
                                        </div>
                                        <p className="flex items-center gap-1 text-[#bccbb9] text-sm mb-4">
                                            <MapPin className="h-4 w-4" /> {field.location}
                                        </p>
                                        <div className="flex flex-wrap gap-4 mb-6">
                                            <div className="flex items-center gap-2 text-[#bccbb9] text-sm">
                                                <Users className="h-4 w-4" /> {field.size}
                                            </div>
                                            {field.features.map((feat) => (
                                                <div key={feat} className="flex items-center gap-2 text-[#bccbb9] text-sm">
                                                    <Droplets className="h-4 w-4" /> {feat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                        <div>
                                            <span className="text-[#869585] text-xs block font-bold">PRECIO POR HORA</span>
                                            <span className="text-white font-bold text-3xl">{field.price}</span>
                                        </div>
                                        <Link href={`/inicio/cancha/${field.id}`} className="bg-[#4be176] text-[#003915] px-8 py-3 rounded-lg font-bold uppercase text-sm hover:bg-[#3dd66e] active:scale-95 transition-all inline-block text-center">
                                            Ver disponibilidad
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        <div className="py-8 flex justify-center">
                            <button className="flex items-center gap-2 text-[#bccbb9] font-bold uppercase hover:text-[#4be176] transition-colors">
                                ↓ Cargar más canchas
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center border-t border-white/5 bg-slate-900 mt-20">
                <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
                    <span className="text-lg font-bold text-white">Picadito</span>
                    <p className="text-xs text-slate-500 max-w-xs text-center md:text-left uppercase tracking-widest leading-loose">
                        © 2024 Picadito by TriaSoft. All rights reserved. Engineered for the pitch.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">Privacy</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">Terms</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">Support</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">API Status</a>
                </div>
            </footer>
        </div>
    );
}
