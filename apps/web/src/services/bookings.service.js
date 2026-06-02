import { buildAuthHeaders, getAccessToken } from "@/lib/auth/session";

const BASE_URL = "http://localhost:5000/api/bookings";
const PITCHES_BASE_URL = "/api/proxy/pitches";
const VENUES_BASE_URL = "/api/proxy/venues";
const BOOKINGS_PROXY_URL = "/api/proxy/bookings";

const DEBUG_BEARER_TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjE0MmUwMzQ5LWViNTUtNDEyMy1iMDU4LWNkMGZiN2ZlNjZkNiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2h3c2lmeGlkbHhmem5xZXZ3am5tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxZGIyYjk0Mi04YTdmLTQ4ODQtOTllZS1jZTg5YjE4ODFjMzYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc5NzIwODgzLCJpYXQiOjE3Nzk3MTcyODMsImVtYWlsIjoib3duZXJAcGljYWRpdG8uY29tLmFyIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Nzk3MTcyODN9XSwic2Vzc2lvbl9pZCI6ImVlYTVmMjZmLWY4YmEtNDE4OS1iN2E2LWI3MjY2M2JmOGRlZCIsImlzX2Fub255bW91cyI6ZmFsc2V9.MTkzV4dOxcq78qQA3L0e8W6jbhaxPPZ7UfRe1rMVAyxUYNhfeDMp41cPMK_a7-iglG1_zAeWPQMFoGmrR00MLQ";

/**
 * Obtiene el token JWT del almacenamiento local o de la sesión de Supabase
 */
const getTokenFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return getAccessToken() || localStorage.getItem("access_token");
};

/**
 * Obtiene el token de autenticación. Si no hay token real, usa el token de debug
 */
const getAuthToken = () => {
  const token = getTokenFromLocalStorage();
  if (token) {
    return token;
  }
  console.warn("⚠️ bookings.service: usando token de debug temporal");
  return DEBUG_BEARER_TOKEN;
};

/**
 * Construye la query string con filtros y paginación
 * Soporta: Status, PaymentStatus, PitchId, PageNumber, PageSize
 */
const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) params.append("Status", filters.status);
  if (filters.paymentStatus) params.append("PaymentStatus", filters.paymentStatus);
  if (filters.pitchId) params.append("PitchId", filters.pitchId);
  if (filters.pageNumber) params.append("PageNumber", String(filters.pageNumber));
  if (filters.pageSize) params.append("PageSize", String(filters.pageSize));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * Realiza un fetch con headers de autenticación estándar
 */
const makeAuthenticatedRequest = async (url, options = {}) => {
  const headers = buildAuthHeaders({ Accept: "*/*" });

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  return response;
};

/**
 * Obtiene listado de reservas con filtros opcionales y paginación
 * 
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.status - Estado: pending, confirmed, rejected, cancelled
 * @param {string} filters.paymentStatus - Estado de pago
 * @param {string} filters.pitchId - ID de la cancha
 * @param {number} filters.pageNumber - Número de página (default: 1)
 * @param {number} filters.pageSize - Elementos por página (default: 10)
 * @returns {Promise<Object>} Respuesta con items, pageNumber, pageSize, totalCount, totalPages
 */
export async function getBookings(filters = {}) {
  try {
    const query = buildQueryString(filters);
    const url = `${BASE_URL}${query}`;

    console.log("📋 bookings.service: getBookings()", {
      url,
      filters,
    });

    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ bookings.service: getBookings() exitoso", {
      items: data.items?.length ?? 0,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
    });

    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en getBookings:", error);
    throw error;
  }
}

/**
 * Confirma una reserva
 * 
 * @param {string} bookingId - ID de la reserva a confirmar
 * @returns {Promise<Object>} Respuesta del backend
 */
export async function confirmBooking(bookingId) {
  try {
    const url = `${BASE_URL}/${bookingId}/confirm`;

    console.log("📋 bookings.service: confirmBooking()", { bookingId, url });

    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    // Leer la respuesta como texto primero
    const responseText = await response.text();
    
    console.log("📥 Response recibida:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    // Si no es ok, parsear error y lanzar
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {
        errorData = { raw: responseText };
      }
      
      console.error("❌ bookings.service: error en confirmBooking:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${responseText}`
      );
    }

    // Si es ok, parsear JSON de la respuesta
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    console.log("✅ bookings.service: confirmBooking() exitoso", {
      bookingId,
      response: data,
    });

    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en confirmBooking:", error);
    throw error;
  }
}

/**
 * Rechaza una reserva
 * 
 * @param {string} bookingId - ID de la reserva a rechazar
 * @returns {Promise<Object>} Respuesta del backend
 */
export async function rejectBooking(bookingId) {
  try {
    const url = `${BASE_URL}/${bookingId}/reject`;

    console.log("📋 bookings.service: rejectBooking()", { bookingId, url });

    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    // Leer la respuesta como texto primero
    const responseText = await response.text();
    
    console.log("📥 Response recibida:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    // Si no es ok, parsear error y lanzar
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {
        errorData = { raw: responseText };
      }
      
      console.error("❌ bookings.service: error en rejectBooking:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${responseText}`
      );
    }

    // Si es ok, parsear JSON de la respuesta
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    console.log("✅ bookings.service: rejectBooking() exitoso", {
      bookingId,
      response: data,
    });

    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en rejectBooking:", error);
    throw error;
  }
}

/**
 * Cancela una reserva
 * 
 * @param {string} bookingId - ID de la reserva a cancelar
 * @returns {Promise<Object>} Respuesta del backend
 */
export async function cancelBooking(bookingId) {
  try {
    const url = `${BASE_URL}/${bookingId}/cancel`;

    console.log("📋 bookings.service: cancelBooking()", { bookingId, url });

    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    // Leer la respuesta como texto primero
    const responseText = await response.text();
    
    console.log("📥 Response recibida:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    // Si no es ok, parsear error y lanzar
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {
        errorData = { raw: responseText };
      }
      
      console.error("❌ bookings.service: error en cancelBooking:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${responseText}`
      );
    }

    // Si es ok, parsear JSON de la respuesta
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    console.log("✅ bookings.service: cancelBooking() exitoso", {
      bookingId,
      response: data,
    });

    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en cancelBooking:", error);
    throw error;
  }
}

/**
 * Crea una nueva reserva
 *
 * @param {Object} payload
 * @param {string} payload.pitch_id
 * @param {string} payload.date
 * @param {string} payload.start_time
 * @param {string} payload.end_time
 * @param {string} [payload.notes]
 * @returns {Promise<Object>} Reserva creada
 */
export async function createBooking(payload = {}) {
  try {
    const response = await makeAuthenticatedRequest(BOOKINGS_PROXY_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {
        errorData = { raw: responseText };
      }
      console.error("❌ bookings.service: error en createBooking:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${responseText}`
      );
    }

    const data = responseText ? JSON.parse(responseText) : {};
    console.log("✅ bookings.service: createBooking() exitoso", { booking: data });
    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en createBooking:", error);
    throw error;
  }
}

/**
 * Obtiene listado de canchas
 */
export async function getPitches() {
  try {
    console.log("📋 bookings.service: getPitches()");

    const response = await makeAuthenticatedRequest(PITCHES_BASE_URL, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ bookings.service: getPitches() exitoso", {
      items: data.items?.length ?? 0,
    });

    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en getPitches:", error);
    throw error;
  }
}

/**
 * Obtiene listado de complejos deportivos
 */
export async function getVenues() {
  try {
    console.log("📋 bookings.service: getVenues()");

    const response = await makeAuthenticatedRequest(VENUES_BASE_URL, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ bookings.service: getVenues() exitoso", {
      items: data.items?.length ?? 0,
    });

    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en getVenues:", error);
    throw error;
  }
}

/**
 * Prueba la conexión con el backend
 */
export async function testBackendConnection() {
  try {
    console.log("🧪 bookings.service: testBackendConnection()");

    const response = await fetch("/api/proxy/health", {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    const isHealthy = response.ok;

    console.log(isHealthy ? "✅" : "❌", "bookings.service: backend healthcheck", {
      status: response.status,
      healthy: isHealthy,
    });

    return isHealthy;
  } catch (error) {
    console.error("❌ bookings.service: error en testBackendConnection:", error);
    return false;
  }
}



/**
 * Mappers para estados visuales
 */
export const BookingStatusMapper = {
  pending: {
    label: "RESERVADA",
    color: "text-[#adc6ff]",
    bgColor: "bg-[#adc6ff]/15",
    borderColor: "border-[#adc6ff]/70",
    icon: "Users",
  },
  confirmed: {
    label: "CONFIRMADA",
    color: "text-[#6bfe8f]",
    bgColor: "bg-[#4be176]/15",
    borderColor: "border-[#4be176]/70",
    icon: "Check",
  },
  rejected: {
    label: "RECHAZADA",
    color: "text-[#ff6b6b]",
    bgColor: "bg-[#ff6b6b]/15",
    borderColor: "border-[#ff6b6b]/70",
    icon: "X",
  },
  cancelled: {
    label: "DISPONIBLE",
    color: "text-[#ffd05a]",
    bgColor: "bg-[#ffd05a]/15",
    borderColor: "border-[#ffd05a]/70",
    icon: "Landmark",
  },
};

/**
 * Obtiene el mapeo de estado visual para un booking
 */
export function getBookingStatusDisplay(status) {
  return BookingStatusMapper[status] || BookingStatusMapper.pending;
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatBookingDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/**
 * Formatea precio para mostrar
 */
export function formatPrice(price) {
  if (!price && price !== 0) return "N/A";
  return `$${Number(price).toLocaleString("es-AR")}`;

}

/**
 * Mappers para estados de pago
 */
export const PaymentStatusMapper = {
  paid: {
    label: "PAGADO",
    color: "text-[#6bfe8f]",
    bgColor: "bg-[#4be176]/15",
    borderColor: "border-[#4be176]/70",
  },
  pending: {
    label: "PENDIENTE",
    color: "text-[#ffd05a]",
    bgColor: "bg-[#ffd05a]/15",
    borderColor: "border-[#ffd05a]/70",
  },
  failed: {
    label: "FALLIDO",
    color: "text-[#ff6b6b]",
    bgColor: "bg-[#ff6b6b]/15",
    borderColor: "border-[#ff6b6b]/70",
  },
};

/**
 * Obtiene el mapeo de estado de pago
 */
export function getPaymentStatusDisplay(paymentStatus) {
  return PaymentStatusMapper[paymentStatus?.toLowerCase()] || PaymentStatusMapper.pending;
}

const VENUE_FILTERS = [
  { value: "all", label: "Todas las sedes", keywords: [] },
  { value: "north", label: "Sede Norte (Principal)", keywords: ["norte", "principal"] },
  { value: "center", label: "Sede Centro (Urbana)", keywords: ["centro", "urbana"] },
  { value: "south", label: "Sede Sur (Recreativa)", keywords: ["sur", "recreativa"] },
];

export function getVenueOptions() {
  return VENUE_FILTERS;
}

export function getVenueLabel(value) {
  return VENUE_FILTERS.find((venue) => venue.value === value)?.label || "Todas las sedes";
}

export function getBookingVenueName(booking) {
  if (!booking) return "Sede General";
  if (booking.venueName) return booking.venueName;
  if (booking.venue?.name) return booking.venue.name;
  if (booking.pitchName) return booking.pitchName;
  return "Sede General";
}

export function bookingMatchesVenue(booking, selectedVenue) {
  if (selectedVenue === "all" || !selectedVenue) return true;

  const venueName = getBookingVenueName(booking).toLowerCase();
  const venueConfig = VENUE_FILTERS.find((venue) => venue.value === selectedVenue);
  if (!venueConfig) return true;

  return venueConfig.keywords.some((keyword) => venueName.includes(keyword));
}

export function filterBookingsByVenue(bookings, selectedVenue) {
  if (!bookings || selectedVenue === "all") return bookings || [];
  return bookings.filter((booking) => bookingMatchesVenue(booking, selectedVenue));
}

export function calculateBookingAnalytics(bookings, selectedVenue = "all") {
  const filtered = filterBookingsByVenue(bookings, selectedVenue);
  const totalReservations = filtered.length;
  const totalIncome = filtered.reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0);
  const activeReservations = filtered.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed"
  ).length;
  const occupancyRate = totalReservations > 0 ? Math.round((activeReservations / totalReservations) * 100) : 0;

  const bookingsByState = filtered.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  const bookingsByPayment = filtered.reduce((acc, booking) => {
    const status = (booking.paymentStatus || "pending").toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const revenueByVenue = filtered.reduce((acc, booking) => {
    const venueName = getBookingVenueName(booking);
    acc[venueName] = (acc[venueName] || 0) + (Number(booking.totalPrice) || 0);
    return acc;
  }, {});

  const trendByDate = filtered.reduce((acc, booking) => {
    const date = new Date(booking.createdAt || booking.date);
    if (Number.isNaN(date.getTime())) return acc;
    const key = date.toLocaleDateString("es-AR", { month: "short", day: "numeric" });
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const busiestHours = filtered.reduce((acc, booking) => {
    const date = new Date(booking.date);
    if (Number.isNaN(date.getTime())) return acc;
    const hour = date.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const pitchUsage = filtered.reduce((acc, booking) => {
    const name = booking.pitchName || "Desconocido";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const mostUsedPitch = Object.entries(pitchUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || "No hay datos";
  const topVenue = Object.entries(revenueByVenue).sort((a, b) => b[1] - a[1])[0]?.[0] || "No hay datos";

  return {
    totalReservations,
    totalIncome,
    activeReservations,
    occupancyRate,
    bookingsByState,
    bookingsByPayment,
    revenueByVenue,
    trendByDate,
    busiestHours,
    mostUsedPitch,
    topVenue,
  };
}

/**
 * HELPERS PARA KPIs REALES
 */

/**
 * Calcula KPIs desde un listado de bookings
 * @param {Array} bookings - Array de bookings
 * @returns {Object} KPIs calculados
 */
export function calculateKPIs(bookings) {
  if (!bookings || bookings.length === 0) {
    return {
      totalIncome: 0,
      activeReservations: 0,
      totalReservations: bookings?.length ?? 0,
      occupancyRate: 0,
    };
  }

  // Sumar ingresos totales
  const totalIncome = bookings.reduce((sum, booking) => {
    return sum + (Number(booking.totalPrice) || 0);
  }, 0);

  // Contar reservas activas (pending + confirmed)
  const activeReservations = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ).length;

  // Ocupancia es el porcentaje de reservas confirmadas
  const occupancyRate = bookings.length > 0 
    ? Math.round((activeReservations / bookings.length) * 100)
    : 0;

  return {
    totalIncome,
    activeReservations,
    totalReservations: bookings.length,
    occupancyRate,
  };
}

/**
 * Obtiene actividad reciente (últimos cambios de estado)
 * @param {Array} bookings - Array de bookings
 * @param {number} limit - Cantidad de items a retornar
 * @returns {Array} Actividad reciente ordenada
 */
export function getRecentActivity(bookings, limit = 5) {
  if (!bookings || bookings.length === 0) return [];

  // Mapear a formato de actividad
  const activity = bookings.map((booking) => {
    const timestamp = new Date(booking.updatedAt || booking.createdAt);
    let actionText = "";
    let actionType = "";

    switch (booking.status) {
      case "confirmed":
        actionText = `Reserva confirmada en ${booking.pitchName}`;
        actionType = "confirmed";
        break;
      case "rejected":
        actionText = `Reserva rechazada en ${booking.pitchName}`;
        actionType = "rejected";
        break;
      case "cancelled":
        actionText = `Reserva cancelada en ${booking.pitchName}`;
        actionType = "cancelled";
        break;
      case "pending":
      default:
        actionText = `Nueva reserva en ${booking.pitchName}`;
        actionType = "pending";
    }

    return {
      id: booking.id,
      actionText,
      actionType,
      userName: booking.userName,
      timestamp,
      booking,
    };
  });

  // Ordenar por más reciente y limitar
  return activity.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

/**
 * Ordena bookings según criterio
 * @param {Array} bookings - Array de bookings
 * @param {string} sortBy - Campo a ordenar: recent, oldest, highestPrice, lowestPrice, status
 * @returns {Array} Bookings ordenados
 */
export function sortBookings(bookings, sortBy = "recent") {
  if (!bookings || bookings.length === 0) return [];

  const sorted = [...bookings];

  switch (sortBy) {
    case "recent":
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case "oldest":
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "highestPrice":
      return sorted.sort((a, b) => Number(b.totalPrice) - Number(a.totalPrice));
    case "lowestPrice":
      return sorted.sort((a, b) => Number(a.totalPrice) - Number(b.totalPrice));
    case "status":
      const statusOrder = { pending: 0, confirmed: 1, rejected: 2, cancelled: 3 };
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    default:
      return sorted;
  }
 
}
