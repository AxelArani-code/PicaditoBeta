"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Phone, Send, Zap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { CTA } from "@/components/home/CTA/CTA";
import { Navbar } from "@/components/layout/Navbar";

export default function ContactPage() {
    return (
    <div>
        <Navbar/>
        <div className="pt-44 pb-24 px-6 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
        {/* Left Side: Content */}
        <div className="space-y-12">
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-black tracking-tight text-[#ffffff] leading-tight"
            >
              ¿Hablamos?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 max-w-lg leading-relaxed"
            >
              Estamos construyendo una mejor forma de organizar el fútbol amateur. Si tienes dudas, propuestas o simplemente quieres decir hola, estamos listos.
            </motion.p>
          </div>

          {/* Trust Block: Nuestro compromiso */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1f2d42]/95 p-8 rounded-[2rem] space-y-4 shadow-xl shadow-black/30 border border-[#2f415c]"
          >
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-100">Nuestro compromiso</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Priorizamos la fluidez de tus torneos. Respondemos a todas las consultas en menos de 24 horas con soluciones reales de futbolistas para futbolistas.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Soporte activo</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Respuesta rápida</span>
              </div>
            </div>
          </motion.div>

          {/* Contact Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.a 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              href="mailto:hola@picadito.com"
              className="flex items-center gap-4 p-6 bg-[#1f2d42]/95 border border-[#2f415c] rounded-[2rem] hover:translate-x-1 transition-all duration-300 group shadow-lg shadow-black/20"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#162235] text-primary group-hover:bg-primary group-hover:text-[#0a1420] transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Escríbenos</p>
                <p className="font-bold text-slate-100">hola@picadito.com</p>
              </div>
            </motion.a>
            <motion.a 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              href="#"
              className="flex items-center gap-4 p-6 bg-[#1f2d42]/95 border border-[#2f415c] rounded-[2rem] hover:translate-x-1 transition-all duration-300 group shadow-lg shadow-black/20"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#162235] text-primary group-hover:bg-[#25D366] group-hover:text-[#0a1420] transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp</p>
                <p className="font-bold text-slate-100">+34 600 000 000</p>
              </div>
            </motion.a>
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1f2d42]/95 p-10 rounded-[3rem] shadow-2xl shadow-black/30 border border-[#2f415c]"
        >
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Nombre completo</label>
              <input 
                className="w-full bg-[#08111f] border border-[#27374f] rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-500" 
                placeholder="Ej. Juan Román Riquelme" 
                type="text"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email de contacto</label>
              <input 
                className="w-full bg-[#08111f] border border-[#27374f] rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-500" 
                placeholder="diego@estadio.com" 
                type="email"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Mensaje</label>
              <textarea 
                className="w-full bg-[#08111f] border border-[#27374f] rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none placeholder:text-slate-500" 
                placeholder="¿Cómo podemos ayudarte a mejorar tu liga?" 
                rows={5}
              ></textarea>
            </div>
            <button 
              className="w-full bg-primary text-[#0a1420] font-black py-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 text-lg"
              type="submit"
            >
              <span>Enviar mensaje</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </section>
      <div  className="grid gap-16 items-start max-w-7xl mx-auto">
   <CTA 
    title="¿Listo"
                    highlight="para empezar?"
                    description="Lleva a tu complejo al siguiente nivel con la plataforma líder en gestión de canchas y torneos de fútbol amateur."
                    imageSrc="https://i.pinimg.com/1200x/eb/81/bb/eb81bb429330863c0ca7118d378b63f1.jpg"
                    imageAlt="Soccer players celebrating after a match"
                    bannerText=""
                    />
      </div>
       
    </div>

    <Footer/>
    </div>
  


    )
}