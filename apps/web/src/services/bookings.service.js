import { getAccessToken } from "@/lib/auth/session";

const BASE_URL = "/api/proxy/bookings";
const PITCHES_BASE_URL = "/api/proxy/pitches";

const DEBUG_BEARER_TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjE0MmUwMzQ5LWViNTUtNDEyMy1iMDU4LWNkMGZiN2ZlNjZkNiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2h3c2lmeGlkbHhmem5xZXZ3am5tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxZGIyYjk0Mi04YTdmLTQ4ODQtOTllZS1jZTg5YjE4ODFjMzYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc5NzIwODgzLCJpYXQiOjE3Nzk3MTcyODMsImVtYWlsIjoib3duZXJAcGljYWRpdG8uY29tLmFyIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Nzk3MTcyODN9XSwic2Vzc2lvbl9pZCI6ImVlYTVmMjZmLWY4YmEtNDE4OS1iN2E2LWI3MjY2M2JmOGRlZCIsImlzX2Fub255bW91cyI6ZmFsc2V9.MTkzV4dOxcq78qQA3L0e8W6jbhaxPPZ7UfRe1rMVAyxUYNhfeDMp41cPMK_a7-iglG1_zAeWPQMFoGmrR00MLQ";

const getTokenFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return getAccessToken() || localStorage.getItem("access_token");
};

const getAuthToken = () => {
  const token = getTokenFromLocalStorage();
  if (token) {
    return token;
  }

  console.warn("🔔 bookings.service: no se encontró token en storage, usando token de debug temporal");
  return DEBUG_BEARER_TOKEN;
};

const buildQueryString = (filters = {}) => {
  // Por ahora, retorna vacío para probar sin parámetros
  // Descomentar cuando el backend esté listo para parámetros
  return "";
  
  /*
  const params = new URLSearchParams();

  if (filters.status) params.append("Status", filters.status);
  if (filters.paymentStatus) params.append("PaymentStatus", filters.paymentStatus);
  if (filters.pitchId) params.append("PitchId", filters.pitchId);
  if (filters.pageNumber) params.append("PageNumber", String(filters.pageNumber));
  if (filters.pageSize) params.append("PageSize", String(filters.pageSize));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
  */
};

export async function getBookings(filters = {}) {
  try {
    console.log("🔵 bookings.service: iniciando getBookings");

    const token = getTokenFromLocalStorage();
    console.log("🔵 bookings.service: token obtenido:", token ? "✓ Token presente" : "✗ Token faltante");
    
    if (token) {
      console.log("🔵 bookings.service: token preview:", token.substring(0, 50) + "...");
      console.log("🔵 bookings.service: token length:", token.length);
    } else {
      console.warn("🔔 bookings.service: no se encontró token en storage; se usará el token de debug temporal para probar reservas.");
    }

    const query = buildQueryString(filters);
    const url = `${BASE_URL}${query}`;
    const authToken = getAuthToken();
    
    console.log("🔵 bookings.service: URL completa:", url);
    console.log("🔵 bookings.service: Authorization header que se envía:", `Bearer ${authToken.substring(0, 30)}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("🔵 bookings.service: respuesta recibida", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: {
        contentType: response.headers.get("content-type"),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ bookings.service: error en response", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Error al consultar reservas: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ bookings.service: JSON parseado correctamente:", {
      itemsCount: data.items?.length ?? 0,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      fullData: data,
    });
    
    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en getBookings:", error);
    
    let errorMessage = "Error desconocido al obtener reservas.";
    let isNetworkError = false;
    
    if (error instanceof TypeError) {
      isNetworkError = true;
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "❌ ERRO DE RED: No se puede conectar a http://localhost:5000\n✓ Verifica que el backend está corriendo\n✓ Verifica que no hay error CORS";
        console.error("❌ bookings.service: PROBLEMA DETECTADO - Failed to fetch");
        console.error("❌ bookings.service: URL que se intentó:", BASE_URL);
        console.error("❌ bookings.service: Backend debe estar en http://localhost:5000");
      } else {
        errorMessage = `Error de tipo: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.error("❌ bookings.service: error message:", error.message);
    }
    
    console.error("❌ bookings.service: isNetworkError:", isNetworkError);
    console.error("❌ bookings.service: errorMessage final:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function getWeatherForecast() {
  const url = "http://localhost:5000/weatherforecast";
  console.log("🌤️ bookings.service: iniciando petición a weatherforecast:", url);

  const authToken = getAuthToken();
  console.log("🌤️ bookings.service: Authorization header weatherforecast:", `Bearer ${authToken.substring(0, 30)}...`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("🌤️ bookings.service: respuesta weatherforecast recibida", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ bookings.service: error en response weatherforecast", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Error al consultar weatherforecast: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ bookings.service: JSON weatherforecast parseado correctamente", data);
    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en getWeatherForecast:", error);

    if (error instanceof TypeError) {
      const message = error.message.includes("Failed to fetch")
        ? "❌ ERRO DE RED: No se puede conectar a http://localhost:5000/weatherforecast. Verifica que el backend esté corriendo y que no haya problema CORS."
        : `Error de tipo: ${error.message}`;
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Error desconocido al obtener weatherforecast.");
  }
}

export async function getPitches() {
  console.log("🔵 bookings.service: iniciando getPitches");

  const authToken = getAuthToken();
  if (!authToken) {
    console.warn("🔔 bookings.service: no se encontró token en storage; se usará token de debug temporal para consultar pitches.");
  }

  try {
    const response = await fetch(PITCHES_BASE_URL, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("🔵 bookings.service: respuesta getPitches", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ bookings.service: error en response getPitches", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Error al consultar pitches: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ bookings.service: JSON getPitches parseado correctamente", data);
    return data;
  } catch (error) {
    console.error("❌ bookings.service: error en getPitches:", error);

    if (error instanceof TypeError) {
      const message = error.message.includes("Failed to fetch")
        ? "❌ ERRO DE RED: No se puede conectar a /api/proxy/pitches. Verifica que la app Next esté corriendo."
        : `Error de tipo: ${error.message}`;
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Error desconocido al obtener pitches.");
  }
}

// Función de diagnóstico para testear conexión
export async function testBackendConnection() {
  console.log("🧪 bookings.service: iniciando test de conexión con proxy /api/proxy/health...");

  try {
    const response = await fetch("/api/proxy/health", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("🧪 bookings.service: respuesta del proxy /health:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (response.ok) {
      console.log("✅ bookings.service: el backend responde correctamente en /health");
      return true;
    }

    console.warn("⚠️ bookings.service: proxy /health respondió pero no con status OK", response.status);
    return false;
  } catch (error) {
    console.error("❌ bookings.service: error conectando con proxy /health:", error);
    console.error("❌ bookings.service: verifica que la app Next esté corriendo y el backend sea accesible desde el proxy");
    return false;
  }
}

// Ejemplos de llamadas:
//
// ⚠️ PARA ACTIVAR LOS PARÁMETROS DE FILTRO:
// 1. Descomenta el código dentro de buildQueryString()
// 2. Comenta el "return "";" al inicio de buildQueryString
//
// Ejemplos de uso (cuando los parámetros estén activados):
// 1) Sin filtros:
// const allBookings = await getBookings();
//
// 2) Con status = pending:
// const pendingBookings = await getBookings({ status: "pending" });
//
// 3) Paginación simple:
// const pageTwo = await getBookings({ pageNumber: 2, pageSize: 10 });
//
// 4) Combinando filtros:
// const filtered = await getBookings({ status: "pending", paymentStatus: "paid", pageNumber: 1, pageSize: 8 });
