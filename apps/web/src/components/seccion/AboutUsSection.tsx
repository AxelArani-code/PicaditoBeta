"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

const aboutUsCards = [
  {
    title: "Nuestro Origen",
    description: "Picadito nació de una frustración compartida: las incontables horas perdidas intentando coordinar un grupo de WhatsApp de 15 personas para reservar una cancha y organizar quién lleva la pelota. Decidimos que tenía que existir una forma mejor, un punto de encuentro directo entre la pasión de los jugadores y la disponibilidad de los complejos deportivos.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "El Equipo: Triadesoft",
    description: "Detrás de la magia de Picadito estamos los desarrolladores de Triadesoft. Somos un equipo apasionado por la tecnología y el deporte, comprometidos con crear software moderno, escalable y, sobre todo, hecho por y para la comunidad.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: "Innovación y Fútbol",
    description: "Creemos firmemente en la 'Tecnología al servicio de la Pasión'. Utilizamos herramientas de vanguardia para garantizar que las reservas sean veloces, la conexión entre jugadores sea fluida y que el deporte amateur en Argentina dé un salto de calidad en la era digital.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
];

export default function AboutUsSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 py-24 md:py-32" id="nosotros">
        {/* Background radial gradient wrapper */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-[300px] -top-[300px] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute -right-[200px] top-[10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          {/* Header Content */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Conocé nuestra historia
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Mucho más que una plataforma, <br className="hidden md:block" />
              somos <span className="text-primary">una comunidad</span>.
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Desde las mentes creativas de <strong className="text-white font-medium">Triadesoft</strong> para toda Argentina. Estamos simplificando el esfuerzo que conlleva armar y jugar el partido más importante: el tuyo.
            </p>
          </motion.div>

          {/* Cards Layout for Story and Developers */}
          <div className="flex flex-col gap-12 lg:gap-20 items-center mb-24">

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {aboutUsCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-800/30 hover:bg-gray-800/60 border border-gray-800/80 hover:border-gray-700 backdrop-blur-sm transition-all duration-300 p-8 md:p-10 rounded-3xl group flex flex-col h-full shadow-2xl relative overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="bg-gray-900 border border-gray-700/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-lg">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed font-light flex-grow">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom Visual Element - Abstract Tech & Sport */}
            <motion.div
              className="w-full max-w-5xl h-[300px] md:h-[400px] mt-10 bg-gradient-to-tr from-gray-900 to-slate-900 rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden relative flex items-center justify-center p-8 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Graphic Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gray-800 rounded-full opacity-20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gray-700 rounded-full opacity-20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary/20 rounded-full opacity-40 shadow-[0_0_100px_rgba(34,197,94,0.1)]"></div>

              <div className="relative z-10 max-w-2xl">
                <p className="text-xl md:text-3xl text-white font-medium italic mb-2">
                  "El fútbol está en nuestro ADN,
                </p>
                <p className="text-xl md:text-3xl text-primary font-bold italic">
                  el código es nuestra herramienta."
                </p>
                <div className="mt-8">
                  <span className="text-sm tracking-widest uppercase text-gray-500 font-semibold">— TRIADESOFT TEAM —</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
