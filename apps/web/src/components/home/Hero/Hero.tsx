"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, CheckSquare, ChevronRight, PlayCircle, TrendingUp, Users } from "lucide-react";
import { Button, Container } from "../../design-system";
import { motion } from "framer-motion";

export const Hero = () => {
    return (
     <section className="pt-44 pb-24 px-6 relative overflow-hidden  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-white tracking-tight">
              Más reservas, <br />
               <span className="text-primary">Menos Caos</span>.{" "}
            </h1>
            <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
              Gestioná reservas, organizá torneos y seguí resultados en tiempo real con la plataforma líder para complejos de fútbol.
            </p>
          </div>

          
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-black font-semibold"
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

          <div className="flex flex-col gap-3">
            {['Gestión automatizada de horarios', 'Soporte prioritario 24/7', 'Pagos integrados 100% seguros'].map((text) => (
              <div key={text} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-50" />
          <div className="relative w-full max-w-[320px]  aspect-[9/16] ">
            <Image
              src="/hero-mockup.png"
              alt="Vista previa de la app"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
    );
};
