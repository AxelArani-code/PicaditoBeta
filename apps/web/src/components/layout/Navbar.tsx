import Link from "next/link";
import { Target } from "lucide-react";
import { Container, Button } from "../design-system";

export const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <Container className="flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white shadow-lg shadow-primary/20">
                        <Target className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-text-primary">Pica<span className="text-primary">dito</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/ranking" className="hidden text-small text-text-secondary hover:text-text-primary sm:block">
                        Ranking
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" size="sm">Ingresar</Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="primary" size="sm">Registrarse</Button>
                    </Link>
                </div>
            </Container>
        </nav>
    );
};
