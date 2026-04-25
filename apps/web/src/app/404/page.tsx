"use client";

import { Footer } from "@/components/layout/Footer";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { HelpCircle, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage(){
    const router = useRouter();

    function onNavigate(destination: string): void {
        if (destination === "landing") {
            router.push("/");
            return;
        }

        if (destination === "contact") {
            router.push("/contact");
            return;
        }

        router.push("/");
    }
    return (
        <div>
              <div className="min-h-screen bg-[#0a1128] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute   top-1/2 mt-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 w-full max-w-[320px] sm:max-w-[520px] md:max-w-[700px] lg:max-w-[860px] aspect-[4/3] md:aspect-video rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-white/5 bg-[#1a1f2e]/90 shadow-2xl overflow-hidden mb-8 md:mb-12"
      >
        <DotLottieReact
          src="/lotties/Not%20Found.lottie"
          autoplay
          loop
          className="h-full w-full"
        />
      </motion.div>

      {/* Text Content */}
      <div className="relative z-10 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black tracking-[0.2em] text-red-500 uppercase mb-6"
        >
          ERROR DE SISTEMA
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tighter"
        >
          ¡Fuera de juego! No encontramos lo que buscabas.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-lg mx-auto"
        >
          Parece que esta jugada no salió como esperabas. Volvé a la cancha para seguir gestionando tu equipo.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => onNavigate('landing')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-[#1a1a1a] px-10 py-5 rounded-full font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
          >
            <Trophy className="w-5 h-5 fill-current" />
            <span>Volver al inicio</span>
          </button>
          
          <button 
            onClick={() => onNavigate('contact')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-full font-black text-lg transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Reportar error</span>
          </button>
        </motion.div>
      </div>

      {/* Brand Label */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-24 text-slate-600 flex items-center gap-2 select-none"
      >
        <Trophy className="w-4 h-4 opacity-30" />
        <span className="text-xs font-black italic tracking-tighter uppercase">PICADITO|</span>
      </motion.div>
     
    </div>
  
        </div>
     
    );
}