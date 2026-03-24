import React from 'react';

const benefits = [
  {
    title: "Encontrá partidos cerca tuyo",
    description: "Mirá el mapa, descubrí los picaditos activos en tu zona y sumate al que más te cierre. Cero vueltas.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bgLight: "bg-emerald-50 text-emerald-600",
    shadowColor: "hover:shadow-emerald-500/20",
    glowColor: "bg-emerald-400"
  },
  {
    title: "Reservá cancha en segundos",
    description: "Olvidate de los infinitos mensajes de WhatsApp. Buscá disponibilidad y reservá tu lugar al instante.",
    icon: (
       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
       </svg>
    ),
    bgLight: "bg-blue-50 text-blue-600",
    shadowColor: "hover:shadow-blue-500/20",
    glowColor: "bg-blue-400"
  },
  {
    title: "Sumate a equipos",
    description: "¿Querés jugar pero no tenés equipo? Conectá con grupos a los que les falta uno y salí a la cancha.",
    icon: (
       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
       </svg>
    ),
    bgLight: "bg-orange-50 text-orange-600",
    shadowColor: "hover:shadow-orange-500/20",
    glowColor: "bg-orange-400"
  },
  {
    title: "Ranking y Estadísticas",
    description: "Llevá el registro de tus partidos, victorias y goles. Convertite en el jugador más valorado de tu ciudad.",
    icon: (
       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
       </svg>
    ),
    bgLight: "bg-purple-50 text-purple-600",
    shadowColor: "hover:shadow-purple-500/20",
    glowColor: "bg-purple-400"
  },
  {
    title: "Organización sin estrés",
    description: "Armá la convocatoria, gestioná asistencias y confirmaciones desde un solo lugar. Todo 100% automatizado.",
    icon: (
       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>
    ),
    bgLight: "bg-pink-50 text-pink-600",
    shadowColor: "hover:shadow-pink-500/20",
    glowColor: "bg-pink-400"
  },
  {
    title: "El Tercer Tiempo",
    description: "Sumá puntos jugando y canjealos por descuentos exclusivos en bufets, hidratación y canchas asociadas.",
    icon: (
       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
       </svg>
    ),
    bgLight: "bg-yellow-50 text-yellow-600",
    shadowColor: "hover:shadow-yellow-500/20",
    glowColor: "bg-yellow-400"
  }
];

export default function BenefitsSection() {
  return (
    <section className="py-20 md:py-32 bg-slate-50 relative overflow-hidden">
      
      {/* Background Ambient Glows (Le da un toque súper original y vívido sin ser invasivo) */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      
      {/* Patrón sutil estilo libreta/grilla deportiva en el fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Encabezado Principal */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 px-4 relative">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full mb-6">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase">Comunidad Activa</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Todo lo que necesitás <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              para tu próximo partido
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Diseñamos Picadito asumiendo la organización pesada, para que vos solo tengas que ponerte los botines y jugar.
          </p>
        </div>

        {/* Grid de Beneficios Premium (Glassmorphism sutil) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`group relative bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-white/60 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden shadow-sm hover:shadow-2xl ${benefit.shadowColor}`}
            >
              {/* Reflejo/Gradiente interno en hover para darle profundidad */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none" />
              
              {/* Contenedor del ícono con animación */}
              <div className="relative mb-10">
                 {/* Aura lumínica debajo del ícono */}
                 <div className={`absolute inset-0 ${benefit.glowColor} opacity-0 group-hover:opacity-30 blur-2xl rounded-full transition-opacity duration-500`} />
                 
                 <div className={`relative z-10 w-16 h-16 rounded-2xl ${benefit.bgLight} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 border border-white/50 shadow-sm`}>
                   {benefit.icon}
                 </div>
              </div>
              
              {/* Textos */}
              <h3 className="relative z-10 text-2xl font-bold text-slate-900 mb-4 transition-colors">
                {benefit.title}
              </h3>
              <p className="relative z-10 text-slate-500 text-lg leading-relaxed flex-grow font-medium group-hover:text-slate-600 transition-colors">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
