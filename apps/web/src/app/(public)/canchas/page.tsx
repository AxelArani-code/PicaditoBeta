import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DraftingCompass, MapPinCheck, TabletSmartphone, Trophy, Users } from "lucide-react";
import { BenefitsShowcaseSection } from "@/components/shared/BenefitsShowcaseSection/BenefitsShowcaseSection";


export default async function VenuesPage() {
  return (
      <div className='overflow-x-clip from-gray-900 via-gray-800 to-gray-900 bg-gradient-to-br '>
        <Navbar/>
   <main className="min-h-screen pt-24 pb-20 sm:pt-28 sm:pb-24 md:pt-32 md:pb-32">
        {/* Hero Section */}
        <section className="mx-auto mb-20 grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:mb-24 sm:gap-12 sm:px-6 md:mb-32 lg:grid-cols-2">
          <div>
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-px w-8 bg-[#22c55e]/50"></div>
                <span className="text-[#22c55e] font-bold text-xs tracking-[0.2em] uppercase">Canchas</span>
              </div>
              <h1 className="max-w-[16ch] text-5xl font-black leading-[0.92] tracking-tight text-white uppercase sm:text-6xl lg:text-7xl xl:text-8xl">
               La operación de tu cancha  <br />
                <span className="text-[#22c55e] italic">en una sola vista</span>
              
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-slate-400 sm:text-xl">
              Una forma simple de ver, organizar y gestionar todo lo que ocurre, sin esfuerzo.
              </p>
           
            </div>
          </div>
  
          <div className="relative group">
            {/* Stadium Image Wrapper */}
            <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-green-500/10 border border-white/5">
              <img 
                src="https://i.pinimg.com/736x/32/f5/5b/32f55bac941a4c65f087fa84d88ea706.jpg" 
                alt="Stadium Night" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Overlay Próximo Turno Card */}
              <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8 sm:p-6 md:left-auto md:w-80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <MapPinCheck className="w-6 h-6 text-[#1a1a1a]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Próximo Turno</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <p className="text-white font-bold">Cancha Passatas</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-primary/20 blur-[100px] -z-10 rounded-full group-hover:bg-primary/30 transition-all duration-700" />
          </div>
          </section>

          <BenefitsShowcaseSection
            badge="Para Jugadores"
            heading="La Experiencia de Juego Definitiva"
            supportingText="Todo lo que necesitas para encontrar, reservar y dominar en el campo, todo en la palma de tu mano."
            reverse
            heroCard={{
              title: "Interacción directa",
              description: "Todo está pensado para actuar rápido: seleccionás, editás y continuás sin interrupciones..",
              imageSrc: "https://i.pinimg.com/1200x/b8/64/c0/b864c0454651e36a6e4c4e7d67a94e5d.jpg",
              imageAlt: "Jugador lanzando un pase durante un partido de fútbol",
            }}
            infoCardOne={{
              title: "Lectura inmediata",
              description: "Entendé el estado de tu cancha en segundos, sin tener que interpretar información compleja.",
              icon: <DraftingCompass className="w-8 h-8 text-[#1a1a1a]" />,
              className: "md:col-span-2 bg-[#e8efe5] rounded-[3rem] shadow-2xl shadow-black/5",
              textClassName: "text-[#1a1a1a]",
            }}
            infoCardTwo={{
              title: "Todo en una sola pantalla",
              description: "Desde la ocupación diaria hasta los turnos futuros, toda la información está centralizada y accesible en todo momento.",
              icon: <TabletSmartphone className="w-8 h-8 text-[#1a1a1a]" />,
              className: "md:col-span-2 bg-[#e8efe5] rounded-[3rem] shadow-2xl shadow-black/5",
              textClassName: "text-[#1a1a1a]",
            }}
            wideCard={{
              title: "Adaptado a tu dinámica",
              description: "Configurá tu disponibilidad y gestioná tu cancha según tu forma de trabajar, sin procesos rígidos.",
              tags: ["Ligas VIP", "Estadísticas MVP"],
              imageSrc: "https://i.pinimg.com/736x/c4/d2/8c/c4d28cf6f6519f2d9bf3e5cedbe514bc.jpg",
              imageAlt: "Jugador celebrando un gol con sus compañeros en un partido de fútbol",
              className: "md:col-span-4 bg-[#5b6a53] rounded-[3rem] shadow-2xl shadow-black/5 group",
              textClassName: "text-white/90",
            }}
          />
  
        <Footer/>
      </main>
      </div>
  );
}
