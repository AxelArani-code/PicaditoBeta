export  const Stats = () =>  {
  const stats = [
    { value: '+120', label: 'Canchas activas' },
    { value: '+300', label: 'Torneos anuales' },
    { value: '+8.000', label: 'Jugadores registrados' }
  ];

  return (
    <section className="py-12 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 md:gap-24 py-16 border-y border-white/5">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{stat.value}</p>
            <p className="text-primary font-bold uppercase tracking-widest text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}   