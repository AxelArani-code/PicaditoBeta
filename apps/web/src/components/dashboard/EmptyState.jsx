"use client";

import React from "react";

export default function EmptyState({ title = "Sin resultados", description = "No hay elementos para mostrar en esta vista." }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 text-6xl">🗂️</div>
        <h3 className="mb-2 text-lg font-semibold text-[#dce5d9]">{title}</h3>
        <p className="text-sm text-[#bccbb9]">{description}</p>
      </div>
    </div>
  );
}
