"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export const Testimony = () => {
  const testimonials = [
    {
      name: "Ricardo G.",
      role: "Complejo El Potrero",
      text: '"Dejé de usar el cuaderno y las llamadas constantes por WhatsApp. Ahora todo fluye solo y las tablas de los torneos se ven profesionales."',
      avatar: "https://picsum.photos/seed/ricardo/100/100"
    },
    {
      name: "Andrés L.",
      role: "Arena Fútbol Club",
      text: '"Picadito cambió la forma en que organizamos las ligas los fines de semana. Los jugadores aman poder ver sus estadísticas desde el celu."',
      avatar: "https://picsum.photos/seed/andres/100/100",
      recommended: true
    },
    {
      name: "Santi M.",
      role: "La Bombonerita MDQ",
      text: '"El soporte técnico es excelente. Me ayudaron a migrar todos mis datos y configurar el primer torneo en menos de 24 horas."',
      avatar: "https://picsum.photos/seed/santi/100/100"
    }
  ];

  return (
    <section className="py-24 px-6   bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-white mb-20 tracking-tight">
          Lo que dicen otros dueños
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-surface-dark/40 p-10 rounded-[2rem] border ${t.recommended ? 'border-primary shadow-2xl shadow-primary/10' : 'border-white/5'} hover:border-white/10 transition-colors`}
            >
              {t.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                  Recomendado
                </div>
              )}
              <div className="flex gap-1 text-primary mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 italic mb-8 leading-relaxed">
                {t.text}
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-full ring-2 ring-white/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}