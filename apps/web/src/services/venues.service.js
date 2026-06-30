import { buildAuthHeaders } from "@/lib/auth/session";

const VENUES_PROXY_URL = "/api/proxy/venues";

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

export async function getVenues({ search, pitchType, surface, amenities, minPrice, maxPrice, sortBy, pageNumber, pageSize } = {}) {
  const url = new URL(VENUES_PROXY_URL, window.location.origin);

  if (search) url.searchParams.set("search", search);
  if (pitchType) url.searchParams.set("pitchType", pitchType);
  if (surface) url.searchParams.set("surface", surface);
  if (amenities) url.searchParams.set("amenities", amenities);
  if (minPrice != null) url.searchParams.set("minPrice", String(minPrice));
  if (maxPrice != null) url.searchParams.set("maxPrice", String(maxPrice));
  if (sortBy) url.searchParams.set("sortBy", sortBy);
  if (pageNumber != null) url.searchParams.set("pageNumber", String(pageNumber));
  if (pageSize != null) url.searchParams.set("pageSize", String(pageSize));

  const finalUrl = url.toString();

  console.log("🏟️ venues.service: getVenues()", {
    url: finalUrl,
    filters: { search, pitchType, surface, amenities, minPrice, maxPrice, sortBy, pageNumber, pageSize },
  });

  try {
    const data = await safeFetch(finalUrl, { method: "GET" });

    console.log("✅ venues.service: getVenues() exitoso", {
      total: Array.isArray(data) ? data.length : data?.totalCount ?? "—",
    });

    return data;
  } catch (error) {
    console.error("❌ venues.service: error en getVenues:", error);
    throw error;
  }
}

export async function getVenueById(id) {
  if (!id) throw new Error("Venue id is required");

  const url = `${VENUES_PROXY_URL}/${id}`;

  console.log("🏟️ venues.service: getVenueById()", { url, id });

  try {
    const data = await safeFetch(url, { method: "GET" });

    console.log("✅ venues.service: getVenueById() exitoso", { id, name: data?.name });

    return data;
  } catch (error) {
    console.error("❌ venues.service: error en getVenueById:", error);
    throw error;
  }
}

export function normalizeVenue(venue) {
  if (!venue) return null;
  return {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    city: venue.city,
    address: venue.address,
    description: venue.description,
    rating: venue.rating ?? 4.8,
    pricePerHour: venue.pricePerHour ?? venue.base_price ?? 38000,
    coverImage: venue.coverImage || venue.imageUrl || "/venue-placeholder.jpg",
    amenities: venue.amenities || venue.features || ["Iluminación LED", "Vestuario", "Parking"],
    venueType: venue.type || "Fútbol 5",
    location: {
      lat: venue.latitude ?? -34.6037,
      lng: venue.longitude ?? -58.3816,
    },
    tags: venue.tags || ["Premium", "Top rated"],
    pitches: venue.pitches || [],
  };
}
