"use client";

import React from "react";

interface Props {
    pageNumber: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    compact?: boolean;
    className?: string;
}

export default function Pagination({ pageNumber, totalPages, onPrev, onNext, compact = false, className = "" }: Props) {
    if (compact) {
        return (
            <div className={`mt-6 flex w-full items-center justify-between gap-3 ${className}`}>
                <button
                    onClick={onPrev}
                    disabled={pageNumber === 1}
                    className="flex-1 rounded-full border border-white/10 bg-[#1a221a]/60 px-3 py-2 text-sm text-[#dce5d9] transition hover:bg-[#1a221a] disabled:opacity-50"
                    aria-label="Página anterior"
                >
                    Anterior
                </button>
                <span className="mx-2 flex-shrink-0 rounded-full px-3 py-1 text-sm text-[#bccbb9] bg-white/[0.02] border border-white/5">{pageNumber} / {totalPages}</span>
                <button
                    onClick={onNext}
                    disabled={pageNumber >= totalPages}
                    className="flex-1 rounded-full border border-white/10 bg-[#1a221a]/60 px-3 py-2 text-sm text-[#dce5d9] transition hover:bg-[#1a221a] disabled:opacity-50"
                    aria-label="Página siguiente"
                >
                    Siguiente
                </button>
            </div>
        );
    }

    return (
        <div className={`mt-6 flex items-center justify-center gap-3 ${className}`}>
            <button
                onClick={onPrev}
                disabled={pageNumber === 1}
                className="rounded-full border border-white/10 bg-[#1a221a]/70 px-4 py-2 text-sm text-[#dce5d9] transition hover:bg-[#1a221a] disabled:opacity-50"
            >
                Anterior
            </button>
            <span className="text-sm text-[#bccbb9]">Página {pageNumber} de {totalPages}</span>
            <button
                onClick={onNext}
                disabled={pageNumber >= totalPages}
                className="rounded-full border border-white/10 bg-[#1a221a]/70 px-4 py-2 text-sm text-[#dce5d9] transition hover:bg-[#1a221a] disabled:opacity-50"
            >
                Siguiente
            </button>
        </div>
    );
}
