"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error(error.message === "Invalid login credentials"
                ? "Credenciales incorrectas"
                : error.message);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-8">
            <h1 className="mb-2 text-2xl font-bold">Bienvenido de vuelta</h1>
            <p className="mb-6 text-sm text-muted-foreground">Ingresá a tu cuenta para continuar</p>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="tu@email.com"
                        className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="password">Contraseña</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pr-11 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Ingresar
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿No tenés cuenta?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                    Registrate
                </Link>
            </p>
        </div>
    );
}
