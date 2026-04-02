import { motion } from 'framer-motion';

export  const Stats = () =>  {
  const stats = [
    { value: '+120', label: 'Canchas activas' },
    { value: '+300', label: 'Torneos anuales' },
    { value: '+8.000', label: 'Jugadores registrados' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.8 },
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
    <section className="py-12 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ">
      <motion.div
        className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 md:gap-24 py-16 border-y border-white/5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center"
            variants={itemVariants}
          >
            <motion.p
              className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{
                scale: 1,
                opacity: 1,
                transition: { delay: index * 0.2 + 0.5, duration: 0.5 }
              }}
              viewport={{ once: true }}
            >
              {stat.value}
            </motion.p>
            <motion.p
              className="text-primary font-bold uppercase tracking-widest text-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { delay: index * 0.2 + 0.7, duration: 0.4 }
              }}
              viewport={{ once: true }}
            >
              {stat.label}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}   