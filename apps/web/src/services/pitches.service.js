import { buildAuthHeaders } from "@/lib/auth/session";

const PITCHES_PROXY_URL = "/api/proxy/pitches";

const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildAuthHeaders({ Accept: "*/*" }),
      ...options.headers,
    },
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}: ${response.statusText}`);
  }
  return data;
};

export async function getPitches({ venueId, search, pitchType, minPrice, maxPrice, sortBy } = {}) {
  const url = new URL(PITCHES_PROXY_URL, window.location.origin);

  if (venueId)        url.searchParams.set("venueId",   venueId);
  if (search)         url.searchParams.set("search",    search);
  if (pitchType)      url.searchParams.set("pitchType", pitchType);
  if (minPrice != null) url.searchParams.set("minPrice", String(minPrice));
  if (maxPrice != null) url.searchParams.set("maxPrice", String(maxPrice));
  if (sortBy)         url.searchParams.set("sortBy",    sortBy);

  const finalUrl = url.toString();

  console.log("⚽ pitches.service: getPitches()", {
    url: finalUrl,
    filters: { venueId, search, pitchType, minPrice, maxPrice, sortBy },
  });

  try {
    const data = await safeFetch(finalUrl, { method: "GET" });

    console.log("✅ pitches.service: getPitches() exitoso — JSON completo:", data);

    return data;
  } catch (error) {
    console.error("❌ pitches.service: error en getPitches:", error);
    throw error;
  }
}

export async function getAvailability(pitchId, date) {
  if (!pitchId || !date) {
    return [];
  }

  const baseSlots = [
    { start_time: "18:00", end_time: "19:00", status: "available", price: 42000 },
    { start_time: "19:00", end_time: "20:00", status: "available", price: 45000 },
    { start_time: "20:00", end_time: "21:00", status: "available", price: 47000 },
    { start_time: "21:00", end_time: "22:00", status: "available", price: 43000 },
  ];

  const unavailableIndex = Math.abs(
    pitchId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) + date.length
  ) % baseSlots.length;

  return baseSlots.map((slot, index) => ({
    ...slot,
    id: `${pitchId}-${date}-${slot.start_time}`,
    status: index === unavailableIndex ? "booked" : "available",
  }));
}
