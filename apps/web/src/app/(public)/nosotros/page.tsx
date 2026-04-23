'use client';

import { motion, Variants } from 'framer-motion';
import { Navbar } from '@/components/shared/Navbar/Navbar';
import { Footer } from '@/components/shared/Footer/Footer';
import AboutUsSection from '@/components/seccion/AboutUsSection';
import { Testimony } from '@/components/home/Testimony/Testimony';
import { CTA } from '@/components/home/CTA/CTA';

export default function NosotrosPage() {
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 0 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.1, ease: "easeOut" }
    }
  };

  const staggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
      <Navbar onNavigate={() => {}} />
      <main className="pt-20"> 
        {/* Main About Us block with Triadesoft story */}
        <AboutUsSection />

        {/* Testimonials for Social Proof */}
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Testimony />
        </motion.div>

        {/* Finally, the Call to Action to invite them to join */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="pb-20"
        >
          <CTA />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
