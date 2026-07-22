// ─────────────────────────────────────────────────────────────────────────────
// lib/schedule/availability-helpers.ts
//
// Helper de traducción de días (ES → EN) + Tipos compartidos para el módulo
// de Configuración de Horarios (Availability Rules).
// ─────────────────────────────────────────────────────────────────────────────

// ── Tipos del dominio ─────────────────────────────────────────────────────────

/** Días aceptados por la API (en inglés) */
export type DayOfWeekEN =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

/** Días tal como se muestran en la UI (en español) */
export type DayOfWeekES =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

/** Estado de un día en la grilla semanal */
export interface DayScheduleState {
  /** Nombre en español — se usa como key estable */
  dayES: DayOfWeekES;
  /** Nombre en inglés — se envía a la API */
  dayEN: DayOfWeekEN;
  /** La cancha está abierta este día */
  isOpen: boolean;
  /** HH:MM — ej. "08:00" */
  startTime: string;
  /** HH:MM — ej. "23:00" */
  endTime: string;
  /** Precio en la moneda local (sin centavos implícitos) */
  priceOverride: number;
  /**
   * ID de la regla si ya existe en la base de datos.
   * null cuando es una regla nueva que aún no fue guardada.
   */
  ruleId: string | null;
}

/** Payload que envía el frontend al Route Handler (POST) */
export interface AvailabilityRulePayload {
  pitchId: string;
  dayOfWeek: DayOfWeekEN;
  startTime: string;
  endTime: string;
  priceOverride: number;
}

/** Forma en que el backend .NET devuelve una regla existente (camelCase) */
export interface AvailabilityRuleResponse {
  id: string;
  pitchId: string;
  pitchName?: string;
  venueName?: string;
  dayOfWeek: DayOfWeekEN;
  startTime: string;
  endTime: string;
  priceOverride: number | null;
  createdAt?: string;
}

/** Wrapper de lista que devuelve el backend: { items, totalCount, ... } */
export interface BackendListResponse {
  items: AvailabilityRuleResponse[];
  totalCount: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

// ── Diccionario de traducción ─────────────────────────────────────────────────

/**
 * Diccionario completo ES → EN.
 * Úsalo para convertir el nombre del día antes de armar el payload de la API.
 */
export const DAY_ES_TO_EN: Record<DayOfWeekES, DayOfWeekEN> = {
  Lunes:      "Monday",
  Martes:     "Tuesday",
  Miércoles:  "Wednesday",
  Jueves:     "Thursday",
  Viernes:    "Friday",
  Sábado:     "Saturday",
  Domingo:    "Sunday",
};

/**
 * Diccionario inverso EN → ES.
 * Úsalo para precargar las reglas que devuelve la API.
 */
export const DAY_EN_TO_ES: Record<DayOfWeekEN, DayOfWeekES> = {
  Monday:    "Lunes",
  Tuesday:   "Martes",
  Wednesday: "Miércoles",
  Thursday:  "Jueves",
  Friday:    "Viernes",
  Saturday:  "Sábado",
  Sunday:    "Domingo",
};

/** Helper tipado — traduce ES → EN con seguridad en tiempo de compilación */
export function toEnglishDay(dayES: DayOfWeekES): DayOfWeekEN {
  return DAY_ES_TO_EN[dayES];
}

/** Helper tipado — traduce EN → ES con seguridad en tiempo de compilación */
export function toSpanishDay(dayEN: DayOfWeekEN): DayOfWeekES {
  return DAY_EN_TO_ES[dayEN];
}

// ── Estado inicial por defecto ────────────────────────────────────────────────

/** Genera el estado inicial vacío para los 7 días de la semana */
export function buildDefaultSchedule(): DayScheduleState[] {
  const days: Array<{ es: DayOfWeekES; en: DayOfWeekEN }> = [
    { es: "Lunes",      en: "Monday"    },
    { es: "Martes",     en: "Tuesday"   },
    { es: "Miércoles",  en: "Wednesday" },
    { es: "Jueves",     en: "Thursday"  },
    { es: "Viernes",    en: "Friday"    },
    { es: "Sábado",     en: "Saturday"  },
    { es: "Domingo",    en: "Sunday"    },
  ];

  return days.map(({ es, en }) => ({
    dayES:         es,
    dayEN:         en,
    isOpen:        false,
    startTime:     "08:00",
    endTime:       "23:00",
    priceOverride: 0,
    ruleId:        null,
  }));
}

/**
 * Toma la respuesta del backend .NET ({ items: [...] }) y la fusiona con el
 * estado inicial de 7 días, completando los días sin regla con valores por defecto.
 */
export function mergeRulesIntoSchedule(
  response: BackendListResponse | AvailabilityRuleResponse[]
): DayScheduleState[] {
  const base = buildDefaultSchedule();

  // Soporta tanto el array directo como el wrapper { items: [...] }
  const rules: AvailabilityRuleResponse[] = Array.isArray(response)
    ? response
    : (response as BackendListResponse).items ?? [];

  return base.map((day) => {
    const match = rules.find((r) => r.dayOfWeek === day.dayEN);
    if (!match) return day;

    return {
      ...day,
      isOpen:        true,
      startTime:     match.startTime.slice(0, 5),   // "HH:MM:SS" → "HH:MM"
      endTime:       match.endTime.slice(0, 5),
      priceOverride: match.priceOverride ?? 0,
      ruleId:        match.id,
    };
  });
}
