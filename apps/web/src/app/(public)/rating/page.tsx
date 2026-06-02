import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RatingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
        <section className="rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-10 shadow-[0_25px_80px_-50px_rgba(0,255,147,0.25)]">
          <h1 className="text-4xl font-black text-white sm:text-5xl">Rating</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Vea las valoraciones de canchas, partidos y jugadores para elegir la mejor experiencia.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
