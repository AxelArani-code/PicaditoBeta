export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <a href="/" className="inline-flex items-center gap-2 text-2xl font-black">
                        Pica<span className="text-primary">dito</span>
                    </a>
                </div>
                {children}
            </div>
        </div>
    );
}
