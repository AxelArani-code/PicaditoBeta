import { Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { publicNavItems } from "@/config/public-navigation";

export const Footer = () => {
    const platformLinks = publicNavItems.slice(0, 4);

    return (
        <footer id="contacto" className="scroll-mt-32 py-20 px-6 border-t border-white/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative h-20 w-40">
              <Image
                src="/logo-picadito.png"
                alt="PicaDito Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            La plataforma definitiva para la gestión de complejos deportivos y torneos de fútbol amateur.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
          <div className="space-y-4">
            <p className="text-white font-bold text-sm uppercase tracking-widest">Plataforma</p>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              {platformLinks.map((item) => (
                <Link key={item.label} href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-white font-bold text-sm uppercase tracking-widest">Legal</p>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Términos</a>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-white font-bold text-sm uppercase tracking-widest">Social</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all group">
                <Instagram className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all group">
                <Twitter className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-slate-600 text-xs font-medium">
          © 2024 FutManage. Todos los derechos reservados.
        </div>
      </div>
    </footer>
    );
};
