import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type FeatureStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type HighlightItem = {
  label: string;
  value: string;
};

type PublicFeaturePageProps = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  steps: FeatureStep[];
  highlights: HighlightItem[];
  ctaLabel: string;
  ctaHref: string;
};

export function PublicFeaturePage({
  eyebrow,
  title,
  highlight,
  description,
  imageSrc,
  imageAlt,
  steps,
  highlights,
  ctaLabel,
  ctaHref,
}: PublicFeaturePageProps) {
  return (
    <main className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-28 text-white sm:pt-32">
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 sm:px-6 md:pb-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/60" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {title} <span className="text-primary">{highlight}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-black transition-colors hover:bg-primary-hover"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-semibold text-white transition-colors hover:border-primary hover:text-primary"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 shadow-2xl shadow-primary/10 sm:aspect-[5/4]">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-slate-950/85 p-4 backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-slate-950/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Flujo simple y ordenado
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Cada vista muestra primero la accion principal y despues los detalles que ayudan a decidir.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/10"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-5 rounded-lg border border-primary/20 bg-primary/10 p-5 sm:grid-cols-3 sm:p-6">
          {highlights.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-slate-300">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
