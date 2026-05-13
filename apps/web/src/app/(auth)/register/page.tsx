"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { View } from '@/components/home/HomePageClient';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/design-system/Card';
import { Modal } from "@/components/layout/Modal";

type RegisterApiResponse = {
  error?: string;
  msg?: string;
  user?: {
    identities?: Array<unknown>;
  };
  session?: unknown;
};

const PASSWORD_POLICY_MESSAGE = "La contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo.";
const EMAIL_POLICY_MESSAGE = "Ingresá un email válido, por ejemplo nombre@dominio.com.";

const isEmailValid = (value: string) => {
  const normalized = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailPattern.test(normalized);
};

const isPasswordValid = (value: string) => {
  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  return passwordPolicy.test(value);
};

const mapRegisterErrorMessage = (error: string) => {
  const normalized = error.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already exists")
  ) {
    return "Ya existe una cuenta registrada con ese email.";
  }

  return error;
};

interface RegisterProps {
  onNavigate?: (view: View) => void;
}
export default function RegisterPage({ onNavigate }: RegisterProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = (view: View) => {
    if (onNavigate) {
      onNavigate(view);
      return;
    }

    if (view === "login") {
      router.push("/login");
      return;
    }

    router.push("/");
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      const validationMessage = "Completá email y contraseña para continuar.";
      setErrorMessage(validationMessage);
      toast.error(validationMessage);
      return;
    }

    if (!isEmailValid(email)) {
      setErrorMessage(EMAIL_POLICY_MESSAGE);
      toast.error(EMAIL_POLICY_MESSAGE);
      return;
    }

    if (!confirmPassword) {
      const confirmValidationMessage = "Repetí la contraseña para continuar.";
      setErrorMessage(confirmValidationMessage);
      toast.error(confirmValidationMessage);
      return;
    }

    if (password !== confirmPassword) {
      const mismatchMessage = "Las contraseñas no coinciden.";
      setErrorMessage(mismatchMessage);
      toast.error(mismatchMessage);
      return;
    }

    if (!isPasswordValid(password)) {
      setErrorMessage(PASSWORD_POLICY_MESSAGE);
      toast.error(PASSWORD_POLICY_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as RegisterApiResponse;

      if (!response.ok) {
        const apiError =
          (typeof data.error === "string" && data.error) ||
          (typeof data.msg === "string" && data.msg) ||
          "No se pudo crear la cuenta.";

        const readableError = mapRegisterErrorMessage(apiError);
        setErrorMessage(readableError);
        toast.error(readableError);
        return;
      }

      if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
        const duplicateMessage = "Ya existe una cuenta registrada con ese email.";
        setErrorMessage(duplicateMessage);
        toast.error(duplicateMessage);
        return;
      }

      const needsEmailConfirmation = !data.session;
      const createdMessage = needsEmailConfirmation
        ? "Usuario creado correctamente. Revisá tu email para confirmar la cuenta."
        : "Usuario creado correctamente.";

      setSuccessMessage(createdMessage);
      toast.success(createdMessage);

      if (needsEmailConfirmation) {
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } catch {
      const connectionMessage = "No se pudo conectar con el servidor. Intentá nuevamente.";
      setErrorMessage(connectionMessage);
      toast.error(connectionMessage);
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center mb-8 sm:mb-10 cursor-pointer" onClick={() => navigate('landing')}>
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
      <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {PASSWORD_POLICY_MESSAGE}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Repeat Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña repetida" : "Mostrar contraseña repetida"}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400" role="alert">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-sm text-emerald-400" role="status">
                {successMessage}
              </p>
            )}

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
              disabled={!acceptedTerms || loading}
              className={`w-full py-4 text-lg font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
                acceptedTerms && !loading
                ? 'bg-primary text-[#1a1a1a] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95' 
                : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta"}
            </button>
          </form>
          
          <p className="mt-8 sm:mt-10 text-center text-slate-300 text-xs sm:text-sm">
            Ya tenés cuenta?{' '}
            <button onClick={() => navigate('login')} className="text-primary font-bold hover:underline">
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
