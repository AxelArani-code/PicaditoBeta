"use client";

import { motion } from "framer-motion";
import { Trophy, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { View } from "@/components/home/HomePageClient";

interface NavbarProps {
  onNavigate: (view: View) => void;
}

export const Navbar = ({ onNavigate }: NavbarProps) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
       <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-4 left-0 right-0 z-50 px-4"
        >
          <nav className="max-w-6xl mx-auto rounded-full px-6 py-1 flex items-center justify-between shadow-2xl border border-white/25 bg-white/10 backdrop-blur-lg">
            <div className="flex items-center gap-2">
             <div className="relative h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-14 lg:w-24">
                        <Image
                            src="/logo-picadito.png"
                            alt="PicaDito Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Como Funciona', href: '/how-works' },
                { label: 'Beneficios', href: '/benefits' },
                { label: 'Canchas', href: '/#canchas' },
                { label: 'Nosotros', href: '/nosotros' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="text-sm font-medium hover:text-primary transition-colors text-slate-300"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="hidden sm:block text-sm font-semibold bg-transparent border border-white/55 text-white hover:bg-primary-hover active:bg-primary-active rounded-full px-5 py-2.5 shadow-sm transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="hidden sm:block text-sm font-semibold bg-primary text-black hover:bg-primary-hover active:bg-primary-active rounded-full px-5 py-2.5 shadow-sm transition-colors"
              >
                Registrarte
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white hover:text-primary transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>

          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 mx-4 bg-white/10 backdrop-blur-lg rounded-lg border border-white/25 shadow-2xl"
            >
              <div className="flex flex-col p-4 gap-4">
                {[
                  { label: 'Inicio', href: '/' },
                  { label: 'Como Funciona', href: '/how-works' },
                  { label: 'Beneficios', href: '/benefits' },
                  { label: 'Canchas', href: '/#canchas' },
                  { label: 'Nosotros', href: '/nosotros' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setIsMenuOpen(false); router.push(item.href); }}
                    className="text-sm font-medium hover:text-primary transition-colors text-slate-300 text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { setIsMenuOpen(false); onNavigate('login'); }}
                  className="text-sm font-semibold px-4 py-2 bg-transparent border border-white/55 text-white hover:bg-primary-hover active:bg-primary-active rounded-full shadow-sm transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); onNavigate('register'); }}
                  className="bg-primary text-white hover:bg-primary-hover active:bg-primary-active rounded-full px-5 py-2.5 shadow-sm transition-colors"
                >
                 Registrase
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
    );
};
