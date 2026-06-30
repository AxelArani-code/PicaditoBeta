'use client';

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";



export default function HowWorks() {
  return (
    <div className="overflow-x-clip">
       <Navbar/>
       <div className="min-h-screen overflow-x-clip bg-[#192230] text-[#f1f5f9] font-sans selection:bg-[#22c55e] selection:text-[#f1f5f9] tech-grid">
     
      <main className="relative px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pb-24 md:pt-32 lg:pb-32 lg:pt-40">
       
        <div className="absolute right-0 top-0 h-[420px] w-[420px] -translate-y-1/3 translate-x-1/4 stadium-glow opacity-40 -z-10 sm:h-[640px] sm:w-[640px] md:h-[820px] md:w-[820px] lg:h-[1000px] lg:w-[1000px]"></div>
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] translate-y-1/4 -translate-x-1/4 stadium-glow opacity-20 -z-10 sm:h-[520px] sm:w-[520px] md:h-[680px] md:w-[680px] lg:h-[800px] lg:w-[800px]"></div>
        <div className="max-w-7xl mx-auto">
           
          <div className="mb-14 max-w-3xl sm:mb-16 md:mb-20 lg:mb-24">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-px w-8 bg-[#22c55e]/50"></div>
              <span className="text-[#22c55e] font-bold text-xs tracking-[0.2em] uppercase">Metodología Picadito</span>
            </div>
              <h1 className="mb-6 text-4xl font-black tracking-tight leading-[1.05] sm:text-5xl md:mb-8 md:text-6xl lg:text-7xl">
                Toda tu operación en <span className="text-[#22c55e]">piloto automático.</span>
              </h1>
            <p className="text-base leading-relaxed font-light text-[#94a3b8] sm:text-lg md:text-xl">
              Diseñamos una arquitectura intuitiva que elimina la fricción administrativa, permitiéndote escalar tu complejo deportivo con precisión técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-xl border border-white/5 bg-[#334155]/30 hover:bg-[#334155]/50 transition-all cursor-default group step-active-glow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-[#22c55e] px-2 py-1 bg-[#22c55e]/10 rounded tracking-widest uppercase">Módulo 01</span>
                  
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#22c55e] transition-colors">Configuración de Assets</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed font-light">Digitaliza tu infraestructura física. Define slots temporales, reglas de cancelación y tarificación dinámica por cancha.</p>
              </div>
              <div className="p-6 rounded-xl border border-white/5 bg-transparent hover:bg-[#334155]/30 transition-all cursor-default group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-[#94a3b8] px-2 py-1 bg-white/5 rounded tracking-widest uppercase">Módulo 02</span>
                 
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#22c55e] transition-colors">Motor de Reservas</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed font-light">Sincronización en tiempo real. Gestión centralizada de turnos recurrentes y pagos integrados mediante gateway seguro.</p>
              </div>
              <div className="p-6 rounded-xl border border-white/5 bg-transparent hover:bg-[#334155]/30 transition-all cursor-default group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-[#94a3b8] px-2 py-1 bg-white/5 rounded tracking-widest uppercase">Módulo 03</span>
                
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#22c55e] transition-colors">League Engine</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed font-light">Generación automática de brackets y fixtures. Algoritmo de desempate dinámico y tablas de posiciones automatizadas.</p>
              </div>
              <div className="p-6 rounded-xl border border-white/5 bg-transparent hover:bg-[#334155]/30 transition-all cursor-default group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-[#94a3b8] px-2 py-1 bg-white/5 rounded tracking-widest uppercase">Módulo 04</span>
                 
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#22c55e] transition-colors">Real-Time Analytics</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed font-light">Dashboards de rendimiento, reportes financieros de cierre de caja y estadísticas avanzadas de jugadores.</p>
              </div>
            </div>

            <div className="relative min-w-0 lg:col-span-8">
              <div className="glass-panel rounded-2xl overflow-hidden p-1 bg-white/5">
                <div className="bg-[#090d14]/80 rounded-[1.25rem] overflow-hidden flex min-h-[560px] flex-col md:h-[700px]">
                  <div className="flex flex-col gap-3 border-b border-white/5 bg-white/2 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/40"></div>
                      </div>
                      <div className="hidden h-4 w-px bg-white/10 sm:block"></div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <div className="text-[10px] font-bold text-[#22c55e] tracking-widest uppercase border-b-2 border-[#22c55e] pb-4 -mb-4">Reservas</div>
                        <div className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase hover:text-[#f1f5f9] cursor-pointer">Torneos</div>
                        <div className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase hover:text-[#f1f5f9] cursor-pointer">Clientes</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-start sm:space-x-4">
                      <div className="hidden rounded bg-white/5 px-3 py-1 text-[10px] font-medium text-[#94a3b8] sm:block">14 de Octubre, 2024</div>
                      <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-[#22c55e]">person</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden p-4 sm:p-5 md:grid-cols-12 md:p-6">
                    <div className="flex flex-col space-y-6 md:col-span-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold">Gestión de Cancha 1</h4>
                          <p className="text-xs text-[#94a3b8]">Sintético Pro - Fútbol 5</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg">
                          <button className="px-3 py-1 text-[10px] font-bold bg-white/10 rounded shadow-sm">DÍA</button>
                          <button className="px-3 py-1 text-[10px] font-bold text-[#94a3b8]">SEMANA</button>
                        </div>
                      </div>
                      <div className="flex-1 border border-white/5 rounded-xl bg-white/2 p-4">
                        <div className="grid grid-cols-1 gap-1 h-full relative">
                          <div className="flex h-12 items-center border-b border-white/5 opacity-30 text-[10px] font-mono">18:00</div>
                          <div className="flex h-20 items-center border-b border-white/5 group relative">
                            <span className="absolute left-0 -translate-x-full pr-2 text-[10px] font-mono opacity-30 hidden md:block">19:00</span>
                            <div className="w-full bg-[#22c55e]/20 border border-[#22c55e]/40 rounded-lg p-3 flex justify-between items-start group/card cursor-grab active:cursor-grabbing hover:bg-[#22c55e]/30 transition-colors">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></div>
                                  <span className="text-xs font-bold text-[#22c55e]">RESERVADO</span>
                                </div>
                                <div className="text-[11px] font-bold">Reserva: Juan Pérez</div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="text-[10px] opacity-60">Pago: $12.000</div>
                                <div className="flex space-x-1 mt-2">
                                  <div className="w-4 h-1 bg-[#22c55e]/40 rounded-full"></div>
                                  <div className="w-4 h-1 bg-[#22c55e]/40 rounded-full"></div>
                                </div>
                              </div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-sm text-[#22c55e]/60">drag_indicator</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-20 items-center border-b border-white/5 relative">
                            <span className="absolute left-0 -translate-x-full pr-2 text-[10px] font-mono opacity-30 hidden md:block">20:00</span>
                            <div className="w-full border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center group cursor-pointer hover:border-[#22c55e]/20 transition-all">
                              <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-[#22c55e] transition-colors">+ AGREGAR TURNO</span>
                            </div>
                          </div>
                          <div className="flex h-12 items-center opacity-30 text-[10px] font-mono">21:00</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 md:col-span-4">
                      <div className="bg-[#212b3c]/80 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black tracking-widest text-[#94a3b8] uppercase">Fixture Vivo</span>
                          <span className="px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] text-[9px] font-bold rounded">COPA OTOÑO</span>
                        </div>
                        <div className="space-y-4">
                          <div className="glass-panel p-3 rounded-lg border-l-2 border-[#22c55e]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
                                  <span className="text-[10px] font-bold">L.P</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase">Los Pibes</span>
                              </div>
                              <span className="text-xs font-black">2</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-red-500/20 rounded flex items-center justify-center">
                                  <span className="text-[10px] font-bold">S.C</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase">Sportivo</span>
                              </div>
                              <span className="text-xs font-black">0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#212b3c]/80 border border-white/5 rounded-xl p-4 flex-1">
                        <span className="text-[10px] font-black tracking-widest text-[#94a3b8] uppercase mb-4 block">Ingresos Semanales</span>
                        <div className="h-32 flex items-end justify-between space-x-1 mt-6">
                          <div className="w-full bg-white/5 h-[40%] rounded-t-sm"></div>
                          <div className="w-full bg-white/5 h-[60%] rounded-t-sm"></div>
                          <div className="w-full bg-white/5 h-[35%] rounded-t-sm"></div>
                          <div className="w-full bg-[#22c55e]/40 h-[85%] rounded-t-sm shadow-[0_0_10px_rgba(34,197,94,0.2)]"></div>
                          <div className="w-full bg-white/5 h-[50%] rounded-t-sm"></div>
                          <div className="w-full bg-white/5 h-[70%] rounded-t-sm"></div>
                          <div className="w-full bg-white/5 h-[45%] rounded-t-sm"></div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#22c55e]">+$45.200</span>
                          <span className="text-[9px] text-[#94a3b8]">vs. semana anterior</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#22c55e] text-[#0f172a] p-3 rounded-lg flex flex-col items-center justify-center space-y-1 cursor-pointer hover:brightness-110">
                          <span className="material-symbols-outlined text-sm">add_box</span>
                          <span className="text-[9px] font-bold uppercase">Nueva</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center justify-center space-y-1 cursor-pointer hover:bg-white/10">
                          <span className="material-symbols-outlined text-sm">print</span>
                          <span className="text-[9px] font-bold uppercase">Reporte</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

  
<section className="relative mt-20 sm:mt-24 md:mt-28 lg:mt-32">
      <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#1a1a1a] p-5 sm:min-h-[480px] sm:p-7 md:min-h-[520px] md:rounded-[2.5rem] md:p-10 lg:min-h-[550px] lg:rounded-[3rem] lg:p-16">
       
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/1200x/9c/f3/8d/9cf38ddff55590fa76c816ff243d634c.jpg" 
            alt="Soccer Net Background" 
            className="w-full h-full object-cover opacity-40 grayscale-[0.3]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85 md:bg-gradient-to-r md:from-black/90 md:via-black/55 md:to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-start gap-8 md:gap-10">
          <div className="max-w-xl space-y-4 text-left sm:space-y-5 md:space-y-6">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  ¿Listo para profesionalizar <span className="text-[#22c55e] italic">tu complejo?</span>
                </h2>
                <p className="max-w-lg text-sm font-light leading-relaxed text-[#cbd5e1] sm:text-base md:text-lg">
                  Únete a los más de 200 complejos que ya optimizan sus ingresos con nuestra arquitectura SaaS de alto rendimiento.
                </p>
              </div>
        </div>

        {/* Bottom Yellow Bar */}
        <div className="relative z-10 mt-10 flex flex-col gap-4 rounded-[1.5rem] bg-[#22c55e] p-4 shadow-2xl sm:mt-12 sm:p-5 md:mt-16 md:flex-row md:items-center md:justify-between md:gap-6 md:rounded-[2rem]">
          <div className="px-1 sm:px-3 md:px-6">
            <p className="text-center text-xs font-black uppercase tracking-tight text-[#1a1a1a] sm:text-sm md:text-left md:text-base">
              ¿Tenés un complejo que necesita profesionalizarse?
            </p>
          </div>
          <Link
            href="/register?role=owner"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#0a1128] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 sm:px-8 sm:py-4 md:w-auto md:min-w-[220px] md:px-10 md:py-4 md:text-base"
          >
            Agendar una Llamada
          </Link>
        </div>
      </div>
    </section>

        </div>
      </main>
      <Footer/>
     
      <style jsx global>{`
        .glass-panel {
          backdrop-filter: blur(20px);
          background: rgba(33, 43, 60, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .stadium-glow {
          background: radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%);
        }
        .tech-grid {
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .step-active-glow {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.1), inset 0 0 10px rgba(34, 197, 94, 0.05);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
      `}</style>
    </div>
    </div>
   
  );
}
