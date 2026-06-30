"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface InicioSortSelectProps {
  defaultSort?: string;
}

/**
 * Select de ordenamiento para el encabezado de resultados.
 * Lee el sort actual desde los URL params y actualiza la URL al cambiar.
 */
export default function InicioSortSelect({ defaultSort = "rating" }: InicioSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? defaultSort;

  const handleChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`/inicio?${params.toString()}`);
  };

  return (
    <select
      id="inicio-sort-select"
      className="bg-[#161b22] border border-[#1e3a5f] text-white text-xs rounded px-3 py-2 focus:ring-0 focus:border-[#22d3ee] cursor-pointer"
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="rating">Popularidad</option>
      <option value="price_asc">Menor Precio</option>
      <option value="price_desc">Mayor Precio</option>
    </select>
  );
}
