'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar/Navbar';
import { Footer } from '@/components/shared/Footer/Footer';
import { Hero } from '@/components/home/Hero/Hero';
import { Features } from '@/components/home/Features/Features';
import { VenuesList } from '@/components/home/VenuesList/VenuesList';
import { Stats } from '@/components/home/Stats/Stats';
import { Testimony } from '@/components/home/Testimony/Testimony';
import { Login } from '@/components/home/Login/Login';
import { Register } from '@/components/home/Register/Register';

export type View = 'landing' | 'login' | 'register';

interface HomePageClientProps {
  venues: any[];
}

export function HomePageClient({ venues }: HomePageClientProps) {
  const [view, setView] = useState<View>('landing');

  return (
    <div className="min-h-screen selection:bg-primary/30">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar onNavigate={setView} />
            <main>
              <Hero />
              <Stats />
              <Testimony />
              <VenuesList venues={venues} />
            </main>
            <Footer />
          </motion.div>
        )}

        {view === 'login' && <Login key="login" onNavigate={setView} />}

        {view === 'register' && <Register key="register" onNavigate={setView} />}
      </AnimatePresence>
    </div>
  );
}
