"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Container, Button } from "../../design-system";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl">
            <Container className="flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <div className="relative h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-24 lg:w-24">
                        <Image
                            src="/logo-picadito.png"
                            alt="PicaDito Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>

                {/* Navigation Links - Desktop */}
                <div className="hidden lg:flex items-center gap-8">
                    <Link href="/features" className="text-white hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="/torneos" className="text-white hover:text-primary transition-colors">
                        Torneos
                    </Link>
                    <Link href="/reservas" className="text-white hover:text-primary transition-colors">
                        Reservas
                    </Link>
                    <Link href="/ranking" className="text-white hover:text-primary transition-colors">
                        Ranking
                    </Link>
                </div>

                {/* Auth Buttons - Desktop */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="border-gray-400 text-white hover:bg-white/10">
                            Iniciar sesión
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="primary" size="sm">
                            Registrarse
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-white hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </Container>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700">
                    <Container className="py-4">
                        <div className="flex flex-col gap-4">
                            <Link href="/features" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Features
                            </Link>
                            <Link href="/torneos" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Torneos
                            </Link>
                            <Link href="/reservas" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Reservas
                            </Link>
                            <Link href="/ranking" className="text-white hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Ranking
                            </Link>
                            <div className="flex flex-col gap-2 mt-4">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" size="sm" className="w-full border-gray-400 text-white hover:bg-white/10">
                                        Iniciar sesión
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="primary" size="sm" className="w-full">
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Container>
                </div>
            )}
        </nav>
    );
};
