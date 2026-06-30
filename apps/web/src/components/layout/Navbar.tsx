"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { publicNavItems } from "@/config/public-navigation";

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const Navbar = ({ onLoginClick, onRegisterClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const checkActive = (href: string) => {
    if (href === pathname) return true;
    if (href.startsWith("/#") && pathname === "/") return true;
    return false;
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-4 left-0 right-0 z-50 px-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-4">
        <Link href="/#inicio" className="flex shrink-0 items-center">
          <div className="relative h-10 w-28 sm:h-14 sm:w-36">
            <Image
              src="/logo-picadito.png"
              alt="PicaDito Logo"
              fill
              priority
              className="object-contain object-left drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            />
          </div>
        </Link>

        <nav className="flex flex-none items-center justify-end gap-3 md:flex-1 md:gap-4">
          <div className="flex min-w-[72px] items-center justify-end rounded-full bg-transparent py-4 shadow-none sm:min-w-[88px] sm:px-4 md:w-full md:max-w-4xl md:justify-center md:border md:border-white/15 md:bg-slate-950/75 md:px-6 md:shadow-[0_18px_60px_rgba(15,23,42,0.45)] md:backdrop-blur-xl">
            <div className="hidden items-center gap-6 md:flex lg:gap-11">
              {publicNavItems.map((item) => {
                const active = checkActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      active ? "text-primary font-semibold" : "text-slate-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-primary md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="hidden items-center gap-2 md:flex lg:gap-5">
            {onLoginClick ? (
              <button
                onClick={onLoginClick}
                className="inline-flex h-11 w-36 items-center justify-center rounded-full border border-white/55 bg-transparent px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                Iniciar sesion
              </button>
            ) : (
              <Link
                href="/login"
               className="inline-flex h-11 w-36 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-black shadow-[0_8px_24px_rgba(163,230,53,0.35)] transition-all hover:bg-primary-hover active:bg-primary-active"
              >
                Iniciar sesion
              </Link>
            )}
           
          </div>
        </nav>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mx-auto mt-4 max-w-7xl md:hidden"
        >
          <div className="rounded-3xl border border-white/15 bg-slate-950/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              {publicNavItems.map((item) => {
                const active = checkActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      active ? "text-primary font-semibold" : "text-slate-300"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {onLoginClick ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLoginClick();
                  }}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-primary hover:text-primary"
                >
                  Iniciar sesion
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-semibold text-black bg-primary hover:border-primary hover:text-black"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar sesion
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
