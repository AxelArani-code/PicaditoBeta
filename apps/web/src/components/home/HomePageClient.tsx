'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar/Navbar';
import { Footer } from '@/components/shared/Footer/Footer';
import { Hero } from '@/components/home/Hero/Hero';

import { Stats } from '@/components/home/Stats/Stats';
import { Testimony } from '@/components/home/Testimony/Testimony';
import { Login } from '@/components/home/Login/Login';
import { Register } from '@/components/home/Register/Register';
import BenefitsSection from '../seccion/BenefitsSection';
import OwnerSection from '../seccion/OwnerSection';
import { CTA } from './CTA/CTA';

export type View = 'landing' | 'login' | 'register';

interface HomePageClientProps {
  venues: any[];
}

export function HomePageClient({ venues }: HomePageClientProps) {
  const [view, setView] = useState<View>('landing');

  // Animation variants for scroll-triggered effects
  const sectionVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.1,
        ease: "easeOut"
      }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
        {view === 'landing' && (
          <motion.div
            key="landing"
          >
            <Navbar
              onLoginClick={() => setView("login")}
              onRegisterClick={() => setView("register")}
            />
            <main>
              <Hero />
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <Stats />
              </motion.div>

              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <BenefitsSection/>
              </motion.div>

              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <OwnerSection/>
              </motion.div>

              <motion.div
                variants={staggerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <Testimony />
              </motion.div>

              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <CTA/>
              </motion.div>
            </main>
            <Footer />
          </motion.div>
        )}

        {view === 'login' && <Login key="login" onNavigate={setView} />}

        {view === 'register' && <Register key="register" onNavigate={setView} />}
    </div>
  );
}
