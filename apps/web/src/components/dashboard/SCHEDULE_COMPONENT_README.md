# Schedule Management Component

## Overview
La componente `ScheduleManagementDrawer` es un panel interactivo para la gestión de horarios y precios dinámicos de canchas deportivas. Se abre desde el dashboard cuando el usuario hace clic en "Gestionar Horarios".

## Ubicación
```
apps/web/src/components/dashboard/ScheduleManagementDrawer.tsx
```

## Características

### 1. **Cronograma Semanal**
- 7 días de la semana (Lunes - Domingo)
- Toggle para abrir/cerrar cada día
- Horarios personalizables (inicio/fin)
- Validación visual (días cerrados muestran borde punteado)

### 2. **Sistema de Precios Dinámicos**
Tres niveles de precios por día:
- **Base Price** ($): Tarifa estándar
- **Valley Price** ($): Tarifa en horarios de baja demanda
- **Peak Price** ($): Tarifa en horarios de alta demanda

### 3. **Funcionalidades Clave**
- ✅ Replicar horarios: Copia configuración del primer día a todos
- ✅ Toggle de días abiertos/cerrados
- ✅ Inputs deshabilitados cuando el día está cerrado
- ✅ Interfaz color-coded para facilitar lectura
- ✅ Reglas de precios dinámicos (configurables)

## Props

```typescript
interface ScheduleManagementDrawerProps {
    isOpen: boolean;           // Controla si el drawer está visible
    onClose: () => void;       // Callback para cerrar el drawer
    pitchName?: string;        // Nombre de la cancha (ej: "Cancha 01")
    pitchType?: string;        // Tipo de cancha (ej: "Fútbol 5")
}
```

## Uso en el Dashboard

```typescript
// En dashboard/page.tsx
import { ScheduleManagementDrawer } from "@/components/dashboard/ScheduleManagementDrawer";

// Estado
const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
const [selectedField, setSelectedField] = useState<Field | null>(null);

// Abrir drawer
<button onClick={() => {
    setSelectedField(field);
    setIsScheduleDrawerOpen(true);
}}>
    Gestionar Horarios
</button>

// Renderizar drawer
<ScheduleManagementDrawer
    isOpen={isScheduleDrawerOpen}
    onClose={() => setIsScheduleDrawerOpen(false)}
    pitchName={selectedField?.name}
    pitchType={selectedField?.type}
/>
```

## Estado Local (DaySchedule)

```typescript
interface DaySchedule {
    day: string;           // "Lunes", "Martes", etc.
    isOpen: boolean;       // ¿Está abierto este día?
    startTime: string;     // "08:00"
    endTime: string;       // "23:00"
    basePrice: number;     // 50
    valleyPrice: number;   // 35
    peakPrice: number;     // 65
}
```

## Funciones Principales

### `updateDay(index, field, value)`
Actualiza un campo específico de un día en el estado.

```typescript
updateDay(0, 'basePrice', 55);  // Actualiza precio base del lunes
```

### `replicateSchedule()`
Copia la configuración del primer día (lunes) a todos los demás días.

```typescript
replicateSchedule();  // Todos los días tendrán la config del lunes
```

### `handleSave()`
Prepara los datos para guardar (actualmente solo log en consola).
- **TODO**: Conectar con API para persistir los cambios

## Estilos y Colores

| Elemento | Color | Clase |
|----------|-------|-------|
| Estado Abierto | Verde | `text-[#4be176]` |
| Estado Cerrado | Rojo | `text-[#ffb4ab]` |
| Precio Base | Verde | `text-[#4be176]` |
| Precio Valle | Azul | `text-[#adc6ff]` |
| Precio Pico | Naranja/Rojo | `text-[#ffb4aa]` |

## Integración con API (Próximos Pasos)

### SaveSchedule Endpoint
```typescript
// En handleSave()
const response = await fetch(`/api/pitches/${pitchId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule)
});
```

### Response esperado
```json
{
    "success": true,
    "message": "Horarios guardados correctamente",
    "scheduleId": "sched_123"
}
```

## Mejoras Futuras

1. **Validaciones**
   - Validar que endTime > startTime
   - Validar que los precios sean positivos
   - Mostrar errores en UI

2. **Restricciones de Negocio**
   - Horarios mínimos/máximos permitidos
   - Precios mínimos/máximos
   - Blackout dates

3. **Reglas Dinámicas**
   - Implementar configuración de reglas climáticas
   - Implementar configuración de horas pico
   - Permitir crear reglas personalizadas

4. **UX Mejorada**
   - Toast notifications para éxito/error
   - Loading state durante guardado
   - Confirmación antes de aplicar cambios masivos
   - Historial de cambios

5. **Performance**
   - Debouncing en inputs de número
   - Lazy loading si hay muchas canchas
   - Caching de datos

## Notas Técnicas

- ✅ Component es "use client" (interactivo)
- ✅ Usa React hooks (useState)
- ✅ Componente self-contained (sin dependencias externas)
- ✅ Tailwind CSS para estilos (sin archivo CSS separado)
- ✅ Material Symbols para iconos
- ✅ Responsive design
- ⚠️ Autenticación necesita mejoría (usar middleware de auth)

## Troubleshooting

**Q: El drawer no se abre**
- Verificar que `isOpen={true}` se pasa correctamente
- Verificar que `onClose` callback está definido

**Q: Los inputs no responden**
- Verificar que el día no está cerrado (debería deshabilitarse)
- Verificar console para errores

**Q: Los cambios no se guardan**
- Endpoint `/api/pitches/{id}/schedule` no está implementado
- Necesita conectarse con backend

---

**Última actualización**: Mayo 2026
**Autor**: Asistente de Desarrollo
**Estado**: En Desarrollo (Phase 1 Completa)
