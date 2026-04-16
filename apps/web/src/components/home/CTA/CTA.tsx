import { Link } from "lucide-react";

export function CTA() {
    return (
     <section className="relative mt-20 sm:mt-24 md:mt-28 lg:mt-32">
      <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#1a1a1a] p-5 sm:min-h-[480px] sm:p-7 md:min-h-[520px] md:rounded-[2.5rem] md:p-10 lg:min-h-[550px] lg:rounded-[3rem] lg:p-16">
       
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/1200x/9c/f3/8d/9cf38ddff55590fa76c816ff243d634c.jpg" 
            alt="Soccer Net Background" 
            className="w-full h-full object-cover opacity-40 grayscale-[0.3]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85 md:bg-gradient-to-r md:from-black/90 md:via-black/55 md:to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-start gap-8 md:gap-10">
          <div className="max-w-xl space-y-4 text-left sm:space-y-5 md:space-y-6">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  ¿Listo para profesionalizar <span className="text-[#22c55e] italic">tu complejo?</span>
                </h2>
                <p className="max-w-lg text-sm font-light leading-relaxed text-[#cbd5e1] sm:text-base md:text-lg">
                  Únete a los más de 200 complejos que ya optimizan sus ingresos con nuestra arquitectura SaaS de alto rendimiento.
                </p>
              </div>
        </div>

        {/* Bottom Yellow Bar */}
        <div className="relative z-10 mt-10 flex flex-col gap-4 rounded-[1.5rem] bg-[#22c55e] p-4 shadow-2xl sm:mt-12 sm:p-5 md:mt-16 md:flex-row md:items-center md:justify-between md:gap-6 md:rounded-[2rem]">
          <div className="px-1 sm:px-3 md:px-6">
            <p className="text-center text-xs font-black uppercase tracking-tight text-[#1a1a1a] sm:text-sm md:text-left md:text-base">
              ¿Tenés un complejo que necesita profesionalizarse?
            </p>
          </div>
          <Link
            href="/register?role=owner"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#0a1128] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 sm:px-8 sm:py-4 md:w-auto md:min-w-[220px] md:px-10 md:py-4 md:text-base"
          >
            Agendar una Llamada
          </Link>
        </div>
      </div>
    </section>
    )
}