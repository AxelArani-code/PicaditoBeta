import React from 'react';
import { motion } from 'framer-motion';

const benefits = [
  {
    title: "Encontrá partidos cerca",
    description: "Mirá el mapa, descubrí los picaditos activos en tu zona y sumate al que más te cierre. Cero vueltas.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: "Reservá en segundos",
    description: "Olvidate de los infinitos mensajes de WhatsApp. Buscá disponibilidad y reservá tu lugar al instante.",
    icon: (
       <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
       </svg>
    )
  },
  {
    title: "Sumate a equipos",
    description: "¿Querés jugar pero no tenés equipo? Conectá con grupos a los que les falta uno y salí a la cancha.",
    icon: (
       <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
       </svg>
    )
  },
  {
    title: "Ranking y Estadísticas",
    description: "Llevá el registro de tus partidos, victorias y goles. Convertite en el jugador más valorado de tu ciudad.",
    icon: (
       <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
       </svg>
    )
  },
  {
    title: "Sin estrés",
    description: "Armá la convocatoria, gestioná asistencias y confirmaciones desde un solo lugar. Todo 100% automatizado.",
    icon: (
       <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>
    )
  },
  {
    title: "El Tercer Tiempo",
    description: "Sumá puntos jugando y canjealos por descuentos exclusivos en bufets, hidratación y canchas asociadas.",
    icon: (
       <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
       </svg>
    )
  }
];

export default function BenefitsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 md:py-32">
      {/* Background decorative element to match Hero */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        
        {/* Encabezado Principal adaptado a tipografía del Hero */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Todo lo que necesitás <br className="hidden md:block"/>
            <span className="text-primary">para jugar</span>.
          </h2>
          <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
            Diseñamos Picadito para que armar tu partido sea tan fácil como jugarlo.
          </p>
        </motion.div>

        {/* Grid de Beneficios con diseño oscuro/tech */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-gray-800/60 hover:-translate-y-1 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col h-full"
              variants={cardVariants}
            >
              {/* Contenedor del ícono con color primary puro desde Hero */}
              <motion.div
                className="mb-6 transform transition-transform duration-300 group-hover:scale-110 origin-left"
                initial={{ scale: 0, rotate: -10 }}
                whileInView={{
                  scale: 1,
                  rotate: 0,
                  transition: { delay: index * 0.1 + 0.5, duration: 0.4 }
                }}
                viewport={{ once: true }}
              >
                {benefit.icon}
              </motion.div>
              
              {/* Textos */}
              <motion.h3
                className="text-xl font-bold text-white mb-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: index * 0.1 + 0.6, duration: 0.4 }
                }}
                viewport={{ once: true }}
              >
                {benefit.title}
              </motion.h3>
              <motion.p
                className="text-gray-300 text-lg leading-relaxed flex-grow"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: index * 0.1 + 0.7, duration: 0.4 }
                }}
                viewport={{ once: true }}
              >
                {benefit.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}
