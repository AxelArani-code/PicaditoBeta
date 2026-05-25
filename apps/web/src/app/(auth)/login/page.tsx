"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { View } from '@/components/home/HomePageClient';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/design-system/Card';
import { clearAuthSession, saveAuthSession, type AuthSession } from "@/lib/auth/session";

const REMEMBER_ME_KEY = "picadito.auth.remember_me";
const REMEMBER_CREDENTIALS_KEY = "picadito.auth.remember_credentials";

type RememberedCredentials = {
  email: string;
  password: string;
};

interface LoginProps {
  onNavigate?: (view: View) => void;
}

export default function LoginPage({ onNavigate }: LoginProps) {
    const router = useRouter();

    const navigate = (view: View) => {
        if (onNavigate) {
            onNavigate(view);
        } else if (view === 'register') {
            router.push('/register');
        } else {
            router.push('/');
        }
    };
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined") {
        return;
      }

      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      const isRememberEnabled = stored === "true";
      setRememberMe(isRememberEnabled);

      if (!isRememberEnabled) {
        return;
      }

      const storedCredentials = localStorage.getItem(REMEMBER_CREDENTIALS_KEY);
      if (!storedCredentials) {
        return;
      }

      try {
        const parsed = JSON.parse(storedCredentials) as RememberedCredentials;
        if (parsed.email) {
          setEmail(parsed.email);
        }
        if (parsed.password) {
          setPassword(parsed.password);
        }
      } catch {
        localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
      }
    }, []);

    const handleRememberMeChange = (checked: boolean) => {
      setRememberMe(checked);

      if (typeof window === "undefined") {
        return;
      }

      localStorage.setItem(REMEMBER_ME_KEY, String(checked));

      if (!checked) {
        localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
      }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
      setErrorMessage("");

      if (!email.trim() || !password) {
        const validationMessage = "Completá email y contraseña para continuar.";
        setErrorMessage(validationMessage);
        toast.error(validationMessage);
        return;
      }

        setLoading(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const apiError =
            (typeof data.error === "string" && data.error) ||
            (typeof data.msg === "string" && data.msg) ||
            "No se pudo iniciar sesión.";

          setErrorMessage(apiError === "Invalid login credentials"
            ? "Credenciales incorrectas"
            : apiError);

          toast.error(apiError === "Invalid login credentials"
            ? "Credenciales incorrectas"
            : apiError);
          return;
        }

        if (!data.access_token) {
          const missingTokenMessage = "La respuesta de autenticación no incluyó un access token.";
          setErrorMessage(missingTokenMessage);
          toast.error(missingTokenMessage);
          return;
        }

        console.log("📝 Login: guardando AuthSession con token:", {
          token: data.access_token.substring(0, 30) + "...",
          fullToken: data.access_token,
          refreshToken: data.refresh_token ? data.refresh_token.substring(0, 20) + "..." : "no incluido",
        });

        saveAuthSession(data as AuthSession);
        
        console.log("✅ Login: AuthSession guardado en localStorage");

        if (rememberMe) {
          localStorage.setItem(
            REMEMBER_CREDENTIALS_KEY,
            JSON.stringify({
              email: email.trim(),
              password,
            })
          );
        } else {
          localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
        }

        toast.success("Sesión iniciada correctamente");
        router.push("/dashboard");
        router.refresh();
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

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3">Iniciar sesión</h1>
          <p className="text-xs sm:text-sm md:text-base text-text-secondary mb-8 sm:mb-10 leading-relaxed">Bienvenido de nuevo, preparate para el próximo partido.</p>

          <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <div className="relative mt-1.5 sm:mt-2">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative mt-1.5 sm:mt-2">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => handleRememberMeChange(event.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="hidden sm:inline">Recordarme</span>
                <span className="sm:hidden">Recordar</span>
              </label>
              <button type="button" className="text-primary font-bold hover:underline text-xs sm:text-sm">Olvidé contraseña</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full bg-primary text-slate-950 hover:bg-primary-hover active:bg-primary-active transition-shadow shadow-lg"
            >
              {loading ? "Ingresando..." : "Ingresar"} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 inline-block ml-2" />
            </button>
          </form>

          <p className="mt-8 sm:mt-10 text-center text-slate-300 text-xs sm:text-sm">
            No tenés cuenta?{' '}
            <button onClick={() => navigate('register')} className="text-primary font-bold hover:underline">
              Registrate
            </button>
          </p>
        </Card>

        <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-6 sm:mt-10">
          <a href="#" className="hover:text-slate-300">Soporte</a>
          <a href="#" className="hover:text-slate-300">Privacidad</a>
          <a href="#" className="hover:text-slate-300">Español (AR)</a>
        </div>
      </div>
    </div>
    );
}
