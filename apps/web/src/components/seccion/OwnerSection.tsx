import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ownerBenefits = [
  {
    title: "Más reservas",
    description: "Visibilidad total frente a miles de jugadores de tu ciudad que buscan cancha todos los días. Llená tus horas muertas.",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  {
    title: "Gestión simple de horarios",
    description: "Olvidate del papel y el lápiz. Un calendario digital intuitivo que hace el trabajo pesado por vos, las 24 horas del día.",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  {
    title: "Cobros organizados",
    description: "Señas garantizadas por plataforma, menos cancelaciones a último minuto y reportes de ingresos claros para tu negocio.",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  }
];

export default function OwnerSection() {
  return (
    <section id="nosotros" className="relative overflow-hidden scroll-mt-32 bg-gray-950 py-24 md:py-32 border-t border-gray-800">
      
      {/* Decorative ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Image / Visual */}
            <div className="relative order-2 lg:order-1 mt-6 lg:mt-0">
                <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/5] rounded-3xl lg:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border border-gray-800/50 group">
                    
                    {/* Gradiente sutil solo abajo para que el texto resalte, pero la imagen se ve perfecta */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10 opacity-90"></div>
                    
                    {/* Imagen de una cancha iluminada y vibrante */}
                    <Image 
                        src="/marketing-1.png" 
                        fill
                        alt="Cancha de fútbol moderno"
                        className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 lg:group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Badge flotante simulando una métrica */}
                    <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 z-20 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 lg:p-6 shadow-2xl transform lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs lg:text-sm text-gray-400 font-medium">Reservas Mensuales</p>
                                <p className="text-xl lg:text-2xl font-bold text-white">+340%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Text & Content */}
            <div className="flex flex-col order-1 lg:order-2">
                <span className="inline-block py-1 px-3 rounded-md bg-primary/10 text-primary text-xs lg:text-sm font-bold tracking-wider uppercase mb-4 lg:mb-6 w-fit">
                    Para Dueños de Complejos
                </span>
                
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 lg:mb-6">
                    Multiplicá las reservas de <br className="hidden lg:block"/>
                    <span className="text-primary">tu complejo</span>.
                </h2>
                
                <p className="text-base lg:text-lg text-gray-300 leading-relaxed mb-8 lg:mb-12 max-w-lg">
                    Unite a la red de canchas de Picadito. Automatizá tu administración diaria y permití que miles de jugadores reserven tus canchas 24/7.
                </p>

                {/* Lista de Beneficios */}
                <div className="space-y-4 lg:space-y-5 mb-8 lg:mb-12">
                    {ownerBenefits.map((benefit, index) => (
                        <div key={index} className="flex gap-3 lg:gap-4 p-4 lg:p-5 rounded-2xl border border-gray-800/60 bg-gray-900/30 hover:bg-gray-900/80 transition-colors duration-300">
                            <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="text-lg lg:text-xl font-bold text-white mb-1">{benefit.title}</h3>
                                <p className="text-sm lg:text-base text-gray-400 leading-relaxed">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <Link href="/register?role=owner" className="w-full sm:w-auto self-start">
                    <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 lg:px-8 lg:py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/40 text-base lg:text-lg">
                        Registrar mi complejo
                        <svg className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </Link>

            </div>
        </div>
      </div>
    </section>
  );
}
