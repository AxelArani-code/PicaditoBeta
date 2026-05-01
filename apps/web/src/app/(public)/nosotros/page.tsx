'use client';

import { motion, Variants } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import AboutUsSection from '@/components/seccion/AboutUsSection';
import { Testimony } from '@/components/home/Testimony/Testimony';
import { CTA } from '@/components/home/CTA/CTA';
import { BarChart3, Building2, Calendar,  Clock10,  CreditCard, Home, Smartphone, Trophy, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function NosotrosPage() {

  return (
    <div className='overflow-x-clip from-gray-900 via-gray-800 to-gray-900 bg-gradient-to-br'>
      <Navbar/>
 <main className="min-h-screen pt-24 pb-20 sm:pt-28 sm:pb-24 md:pt-32 md:pb-32">
      {/* Hero Section */}
      <section className="mx-auto mb-20 grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:mb-24 sm:gap-12 sm:px-6 md:mb-32 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-px w-8 bg-[#22c55e]/50"></div>
              <span className="text-[#22c55e] font-bold text-xs tracking-[0.2em] uppercase">Sobre Nosotros</span>
            </div>
            <h1 className="max-w-[12ch] text-5xl font-black leading-[0.92] tracking-tight text-white uppercase sm:text-6xl lg:text-7xl xl:text-8xl">
              Sobre <br />
              <span className="text-[#22c55e] italic">Picadito</span>
              <span className="text-white">.</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-slate-400 sm:text-xl">
              Nacimos para transformar el caos del fútbol amateur en una experiencia profesional. Eliminamos las planillas de papel y los grupos de WhatsApp infinitos.
            </p>
            <button className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 font-bold text-white shadow-xl transition-all hover:bg-slate-800 sm:w-auto sm:px-10 sm:py-4">
              Conoce más
            </button>
          </motion.div>
        </div>

        <div className="relative group">
          {/* Stadium Image Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-green-500/10 border border-white/5"
          >
            <img 
              src="https://i.pinimg.com/736x/c6/18/e1/c618e121717c75a8a1562f82a40ff674.jpg" 
              alt="Stadium Night" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Overlay Próximo Turno Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8 sm:p-6 md:left-auto md:w-80"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Trophy className="w-6 h-6 text-[#1a1a1a]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Próximo Turno</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-white font-bold">Cancha 5 • 20:00 HS</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-primary/20 blur-[100px] -z-10 rounded-full group-hover:bg-primary/30 transition-all duration-700" />
        </div>
      </section>

      {/* Grid Cards Section */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:gap-6 sm:px-6 md:grid-cols-3">
        {/* Qué hacemos */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-[#1a1f2e] border border-white/5 rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-8 md:rounded-[3rem] md:p-12 lg:p-16 flex flex-col justify-between"
        >
          <div className="max-w-xl">
            <span className="text-primary font-bold text-[10px] tracking-[0.3em] uppercase mb-4 block">Propuesta</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-6 sm:mb-8">Qué hacemos</h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-12">
              Centralizamos la gestión de canchas, reservas y torneos en una única plataforma. Automatizamos lo aburrido para que los dueños se enfoquen en brindar el mejor servicio y los jugadores solo se preocupen por el resultado.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <h4 className="text-white font-bold">Reservas 24/7</h4>
                <p className="text-slate-300 text-xs uppercase tracking-widest mt-1">Digitalizadas</p>
              </div>
            </div>
            <div className="space-y-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <h4 className="text-white font-bold">Torneos Pro</h4>
                <p className="text-slate-300 text-xs uppercase tracking-widest mt-1">Automatizados</p>
              </div>
            </div>
            <div className="space-y-4">
              <Clock10 className="w-8 h-8 text-primary" />
              <div>
                <h4 className="text-white font-bold">Soporte</h4>
                <p className="text-slate-300 text-xs uppercase tracking-widest mt-1">Siempre disponible</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Para quién */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-8 md:rounded-[3rem] md:p-12 lg:p-16 flex flex-col justify-between group"
        >
          <div>
            <span className="text-black/40 font-bold text-[10px] tracking-[0.3em] uppercase mb-4 block">Alcance</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight uppercase mb-8 sm:mb-12">Para quién</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/30 group-hover:bg-white/30 transition-all">
              <Home className="w-8 h-8 text-[#1a1a1a]" />
              <span className="text-base sm:text-lg font-bold text-[#1a1a1a]">Dueños de Complejos</span>
            </div>
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/30 group-hover:bg-white/30 transition-all">
              <Users className="w-8 h-8 text-[#1a1a1a]" />
              <span className="text-base sm:text-lg font-bold text-[#1a1a1a]">Organizadores</span>
            </div>
          </div>
        </motion.div>

        {/* Por qué lo hicimos */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-[#1a1f2e] border border-white/5 rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-8 md:rounded-[3rem] md:p-12 lg:p-16 relative overflow-hidden"
        >
          <div className="flex gap-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mb-6 sm:mb-8 leading-tight">Por qué lo hicimos</h2>
          <p className="text-slate-400 italic text-base sm:text-lg md:text-xl leading-relaxed border-l-2 border-primary/40 pl-4 sm:pl-6">
            "Nació del agotamiento. Grupos de WhatsApp explotando, señas que no llegaban, planillas que se mojaban y capitanes cancelando a las 7 PM. Sabíamos que el fútbol amateur merecía tecnología de primera división."
          </p>
        </motion.div>

        {/* Nuestra Visión (Image Background) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 relative rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-end group min-h-[320px] sm:min-h-[360px] md:min-h-[400px]"
        >
          <img 
            src="https://i.pinimg.com/736x/91/e8/1a/91e81af5a8c657dd561ba8b8e3a328f0.jpg" 
            alt="Football Boot" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4 sm:mb-6 leading-tight">Nuestra Visión</h2>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              Convertir cada partido amateur en una experiencia de élite, digitalizando el corazón del deporte más hermoso del mundo.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
     
      <div  className="mx-auto grid max-w-7xl items-start gap-10 px-4 pb-20 pt-10 sm:gap-12 sm:px-6 md:gap-16 md:pt-14">
         <CTA 
          title="¿Qué esperás"
                    highlight="para empezar?"
                    description="Únete a la plataforma que está cambiando las reglas del juego en Latinoamérica."
                    imageSrc="https://i.pinimg.com/1200x/72/44/90/724490e81052dec93134388537dc693a.jpg"
                    imageAlt="Soccer players celebrating after a match"
                    bannerText=""/>
      </div>
      <Footer/>
    </main>
    </div>

  );
}
