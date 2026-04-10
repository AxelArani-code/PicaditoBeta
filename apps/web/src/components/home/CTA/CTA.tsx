export function CTA() {
    return (
        <section className="py-24 px-6 relative  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center">
      <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-[#0f172a] mb-8 tracking-tighter leading-tight">Empezá a elegir tu cancha hoy</h2>
          <p className="text-xl text-[#0f172a]/80 mb-12 max-w-2xl mx-auto font-medium">Sumate a los cientos de complejos que ya están digitalizando y profesionalizando el fútbol amateur.</p>
          <button 
          
            className="bg-[#0f172a] text-white px-12 py-6 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Crear mi cancha ahora
          </button>
        </div>
      </div>
    </section>
    )
}