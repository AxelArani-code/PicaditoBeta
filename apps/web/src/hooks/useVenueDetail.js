"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueById } from "@/services/venues.service";
import { getPitches, getAvailability } from "@/services/pitches.service";

export function useVenueDetail(venueId) {
  const [venue, setVenue] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadVenue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVenueById(venueId);
      setVenue(response);
      setSelectedPitch(response?.pitches?.[0] ?? null);
      const rawPitches = response?.pitches ?? [];
      setPitches(rawPitches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el venue");
      setVenue(null);
      setPitches([]);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  const loadAvailability = useCallback(async (pitch) => {
    if (!pitch || !selectedDate) return;
    setAvailabilityLoading(true);
    try {
      const response = await getAvailability(pitch.id, selectedDate);
      setSlots(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(err);
      setSlots([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadVenue();
  }, [loadVenue]);

  useEffect(() => {
    if (selectedPitch) {
      loadAvailability(selectedPitch);
    }
  }, [selectedPitch, selectedDate, loadAvailability]);

  const summary = useMemo(() => {
    if (!selectedPitch || !selectedSlot) return null;
    return {
      venueName: venue?.name,
      pitchName: selectedPitch.name,
      price: selectedSlot.price || selectedPitch.pricePerHour || 0,
      date: selectedDate,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
    };
  }, [venue, selectedPitch, selectedSlot, selectedDate]);

  const choosePitch = useCallback((pitch) => {
    setSelectedPitch(pitch);
    setSelectedSlot(null);
  }, []);

  const chooseDate = useCallback((date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const chooseSlot = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  return {
    venue,
    pitches,
    slots,
    selectedPitch,
    selectedDate,
    selectedSlot,
    loading,
    availabilityLoading,
    error,
    summary,
    choosePitch,
    chooseDate,
    chooseSlot,
    loadVenue,
    loadAvailability,
  };
}
