"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ROLES = [
    { value: "player", label: "🏃 Jugador", desc: "Reservo canchas y juego partidos" },
    { value: "venue_owner", label: "🏟️ Dueño de cancha", desc: "Gestiono un complejo deportivo" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
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
        <div className="rounded-2xl border border-border bg-card p-8">
            <h1 className="mb-2 text-2xl font-bold">Creá tu cuenta</h1>
            <p className="mb-6 text-sm text-muted-foreground">Unite a la comunidad futbolera</p>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}
                className="space-y-4">

                {step === 1 ? (
                    <>
                        {/* Rol */}
                        <div className="grid grid-cols-2 gap-3">
                            {ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => update("role", r.value)}
                                    className={`rounded-xl border p-3 text-left text-sm transition-all ${form.role === r.value
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-border/80 hover:bg-secondary"
                                        }`}
                                >
                                    <p className="font-semibold">{r.label}</p>
                                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Nombre completo</label>
                            <input
                                value={form.full_name}
                                onChange={(e) => update("full_name", e.target.value)}
                                placeholder="Juan García"
                                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Nombre de usuario</label>
                            <input
                                value={form.username}
                                onChange={(e) => update("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                                placeholder="juangarcia10"
                                required
                                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Ciudad</label>
                            <input
                                value={form.city}
                                onChange={(e) => update("city", e.target.value)}
                                placeholder="Buenos Aires"
                                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button type="submit"
                            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90">
                            Continuar →
                        </button>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => update("password", e.target.value)}
                                required
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(1)}
                                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium transition-colors hover:bg-secondary">
                                ← Atrás
                            </button>
                            <button type="submit" disabled={loading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60">
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Crear cuenta
                            </button>
                        </div>
                    </>
                )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">Ingresá</Link>
            </p>
        </div>
    );
}
