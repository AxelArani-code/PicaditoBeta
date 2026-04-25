"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { View } from '@/components/home/HomePageClient';
import { ArrowRight, Building2, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/design-system/Card';
import { Modal } from "@/components/layout/Modal";


interface RegisterProps {
  onNavigate: (view: View) => void;
}
export default function RegisterPage({ onNavigate }: RegisterProps) {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        username: "",
        full_name: "",
        role: "player",
        city: "",
    });

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    username: form.username,
                    full_name: form.full_name,
                    role: form.role,
                    city: form.city,
                },
                emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("¡Cuenta creada! Revisá tu email para confirmar.");
            router.push("/login");
        }
        setLoading(false);
    };

    return (
     <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-8 sm:p-12 md:p-16">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"
          alt="Stadium"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic leading-tight tracking-tight uppercase">
            DOMINÁ TU <br />
            <span className="text-primary">CANCHA.</span> <br />
            GESTIONÁ <br />
            COMO UN <br />
            PRO.
          </h2>
          <p className="mt-6 sm:mt-8 text-slate-300 text-base sm:text-lg md:text-xl font-medium">
            La plataforma nº1 para complejos deportivos y ligas.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12 xl:p-24 bg-slate-900/90">
        <Card className="max-w-md mx-auto w-full p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg" shadow="lg" padding="lg">
          <div className="flex items-center mb-8 sm:mb-10 cursor-pointer" onClick={() => onNavigate('landing')}>
            <Image
              src="/logo-picadito.png"
              alt="Picadito Logo"
              width={180}
              height={60}
              className="h-12 sm:h-14 w-auto"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3">Crea tu cuenta</h1>
          <p className="text-xs sm:text-sm md:text-base text-text-secondary mb-8 sm:mb-10 leading-relaxed">Registrate y empezá a gestionar tu cancha como un pro.</p>
      <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+54 9 11..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Complex Name (Nombre del complejo)</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Estadio Monumental"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input 
                type="checkbox" 
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/10 bg-accent-dark/30 text-primary focus:ring-0 cursor-pointer" 
              />
              <label htmlFor="terms" className="text-slate-400 text-sm leading-tight cursor-pointer">
                Acepto los <button type="button" onClick={() => setIsTermsOpen(true)} className="text-primary font-bold hover:underline">términos y condiciones</button> de uso del software Picadito Stadium.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={!acceptedTerms}
              className={`w-full py-4 text-lg font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
                acceptedTerms 
                ? 'bg-primary text-[#1a1a1a] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95' 
                : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              Crear mi cuenta
            </button>
          </form>
          
          <p className="mt-8 sm:mt-10 text-center text-slate-300 text-xs sm:text-sm">
            Ya tenés cuenta?{' '}
            <button onClick={() => onNavigate('login')} className="text-primary font-bold hover:underline">
              Iniciar sesión
            </button>
          </p>
        </Card>

        <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-6 sm:mt-10">
          <a href="#" className="hover:text-slate-300">Soporte</a>
          <a href="#" className="hover:text-slate-300">Privacidad</a>
          <a href="#" className="hover:text-slate-300">Español (AR)</a>
        </div>
      </div>

      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
    );
}
