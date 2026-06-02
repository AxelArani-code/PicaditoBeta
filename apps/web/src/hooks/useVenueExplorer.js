"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenues } from "@/services/venues.service";

const DEFAULT_PAGE_SIZE = 8;

export function useVenueExplorer() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pitchType, setPitchType] = useState("");
  const [surface, setSurface] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("rating");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const loadVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVenues({ search, pitchType, surface, amenities: amenities.join(","), minPrice: priceRange[0], maxPrice: priceRange[1], sortBy, pageNumber, pageSize });
      setVenues(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los complejos");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [search, pitchType, surface, amenities, priceRange, sortBy, pageNumber, pageSize]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const filteredVenues = useMemo(() => {
    return venues
      .filter((venue) => {
        const matchesSearch = search
          ? `${venue.name} ${venue.city} ${venue.address}`.toLowerCase().includes(search.toLowerCase())
          : true;
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return (a.pricePerHour || 0) - (b.pricePerHour || 0);
        if (sortBy === "priceDesc") return (b.pricePerHour || 0) - (a.pricePerHour || 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [venues, search, sortBy]);

  const paginatedVenues = useMemo(() => {
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize;
    return filteredVenues.slice(from, to);
  }, [filteredVenues, pageNumber, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredVenues.length / pageSize));

  const updateAmenity = useCallback((amenity) => {
    setAmenities((current) =>
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]
    );
    setPageNumber(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setPitchType("");
    setSurface("");
    setAmenities([]);
    setPriceRange([0, 100000]);
    setSortBy("rating");
    setPageNumber(1);
  }, []);

  return {
    venues: paginatedVenues,
    loading,
    error,
    search,
    pitchType,
    surface,
    amenities,
    priceRange,
    sortBy,
    pageNumber,
    pageSize,
    totalPages,
    totalItems: filteredVenues.length,
    setSearch,
    setPitchType,
    setSurface,
    setPriceRange,
    setSortBy,
    setPageNumber,
    updateAmenity,
    resetFilters,
    loadVenues,
  };
}
