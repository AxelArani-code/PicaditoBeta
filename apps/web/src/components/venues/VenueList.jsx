"use client";

import VenueCard from "./VenueCard";
import VenueEmptyState from "./VenueEmptyState";
import VenueSkeleton from "./VenueSkeleton";

export default function VenueList({ venues, loading, error }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <VenueSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100">
        <p className="text-sm font-semibold">Error al cargar complejos</p>
        <p className="mt-2 text-sm text-[#ffd5d5]">{error}</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return <VenueEmptyState />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
