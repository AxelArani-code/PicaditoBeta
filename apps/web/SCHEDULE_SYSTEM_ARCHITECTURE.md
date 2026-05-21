# 🎯 Schedule Management System - Arquitectura

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD PAGE                           │
│  (/apps/web/src/app/(dashboard)/dashboard/page.tsx)        │
│                                                             │
│  • Estado: isScheduleDrawerOpen                            │
│  • Estado: selectedField                                   │
│  • Grid de Canchas (4 columnas)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ onClick "Gestionar Horarios"
                     │
         ┌───────────▼───────────┐
         │   STATE UPDATE        │
         │ • setSelectedField()  │
         │ • setIsOpen(true)     │
         └───────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        SCHEDULE MANAGEMENT DRAWER                           │
│  (ScheduleManagementDrawer.tsx)                             │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  HEADER                                              │  │
│ │  • Calendar icon + "CONFIGURACIÓN"                  │  │
│ │  • Pitch name (Cancha 01)                           │  │
│ │  • Pitch type (Fútbol 5)                            │  │
│ │  • Close button (X)                                 │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  CONTENT                                             │  │
│ │                                                      │  │
│ │  WEEKLY SCHEDULE GRID                               │  │
│ │  ┌─────────────────────────────────────────────┐   │  │
│ │  │ Lunes    [Toggle] [08:00] [/] [23:00]      │   │  │
│ │  │          [$50] [$35] [$65]                 │   │  │
│ │  ├─────────────────────────────────────────────┤   │  │
│ │  │ Martes   [Toggle] [08:00] [/] [23:00]      │   │  │
│ │  │          [$50] [$35] [$65]                 │   │  │
│ │  ├─────────────────────────────────────────────┤   │  │
│ │  │ ...more days...                            │   │  │
│ │  │ Domingo  [Toggle] [08:00] [/] [23:00]      │   │  │
│ │  │          [CERRADO]                         │   │  │
│ │  └─────────────────────────────────────────────┘   │  │
│ │                                                      │  │
│ │  DYNAMIC PRICING RULES                              │  │
│ │  ┌─────────────────────────────────────────────┐   │  │
│ │  │ ☁️  Inclemencia Climática                   │   │  │
│ │  │     "Reducir 15% en lluvia"  [CONFIGURAR]  │   │  │
│ │  ├─────────────────────────────────────────────┤   │  │
│ │  │ ⚡ Horas de Alta Demanda                    │   │  │
│ │  │     "Incrementar 20% si > 90%"  [CONFIG]   │   │  │
│ │  └─────────────────────────────────────────────┘   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  FOOTER                                              │  │
│ │  [Cancelar]          [✓ Guardar Cambios]           │  │
│ └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
apps/web/src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx              [Dashboard Page - Updated]
│
└── components/
    └── dashboard/
        ├── ScheduleManagementDrawer.tsx          [NEW - Main Component]
        ├── SCHEDULE_COMPONENT_README.md          [NEW - Documentation]
        ├── EXPANSION_EXAMPLES.ts                 [NEW - Future Features]
        └── ...other components
```

## 🔧 Componentes Internos

### ScheduleManagementDrawer
**Props:**
- `isOpen: boolean` - Controla visibilidad
- `onClose: () => void` - Callback de cierre
- `pitchName?: string` - Nombre de la cancha
- `pitchType?: string` - Tipo de cancha (Fútbol 5, F11, etc)

**Estado Interno:**
```typescript
interface DaySchedule {
    day: string;           // "Lunes"
    isOpen: boolean;       // Disponible?
    startTime: string;     // "08:00"
    endTime: string;       // "23:00"
    basePrice: number;     // $50
    valleyPrice: number;   // $35
    peakPrice: number;     // $65
}
```

**Funciones Principales:**
- `updateDay()` - Actualizar configuración de un día
- `replicateSchedule()` - Copiar config del lunes a todos
- `handleSave()` - Guardar cambios

## 🎨 Diseño Visual

```
COLORES UTILIZADOS:
├── Estados
│   ├── Abierto: #4be176 (Verde)
│   ├── Cerrado: #ffb4ab (Rojo)
│   └── Fondo: #1a221a (Oscuro)
│
├── Precios
│   ├── Base: #4be176 (Verde)
│   ├── Valle: #adc6ff (Azul)
│   └── Pico: #ffb4aa (Naranja/Rojo)
│
└── Interacción
    ├── Hover: +10% opacity
    ├── Active: scale 95%
    └── Focus: ring-2 ring-[#4be176]

TIPOGRAFÍA:
├── Títulos: font-black (font-900)
├── Etiquetas: font-bold (font-700)
├── Cuerpo: font-medium (font-500)
└── Pequeño: text-xs/text-[10px]
```

## 🔄 Flujo de Datos

### Guardar Horarios
```
Usuario Hace Clic [Guardar Cambios]
         ↓
validateSchedule(schedule)
         ↓
[Si hay errores] → Mostrar Toast ❌
[Si está bien]  ↓
         POST /api/pitches/{id}/schedule
         ↓
[Success]       → Mostrar Toast ✓ → Cerrar Drawer
[Error]         → Mostrar Toast ❌ → Mantener abierto
```

### Replicar Horarios
```
Usuario Hace Clic [REPLICAR HORARIOS]
         ↓
schedule[0] → Template
         ↓
Aplicar template a todos los días
         ↓
setState(schedule)
         ↓
Actualizar UI
```

## 🚀 Funcionalidades Implementadas

- ✅ Cronograma semanal editable
- ✅ Toggle open/closed por día
- ✅ Sistema de 3 niveles de precios
- ✅ Replicar horarios
- ✅ Inputs deshabilitados cuando cerrado
- ✅ Color-coded UI
- ✅ Sección de reglas dinámicas (estructura)
- ✅ Botones Cancelar/Guardar
- ✅ Backdrop modal oscuro

## 📋 Funcionalidades Planificadas (Próxima Fase)

### Fase 2: Validación y UX
- [ ] Validaciones en tiempo real
- [ ] Toast notifications (éxito/error)
- [ ] Loading state durante guardado
- [ ] Confirmación de cambios masivos

### Fase 3: Reglas Dinámicas
- [ ] Configuración de reglas climáticas
- [ ] Configuración de horas pico
- [ ] Reglas personalizadas
- [ ] Historial de cambios

### Fase 4: Expansión
- [ ] Templates de horarios
- [ ] Blackout dates (días cerrados)
- [ ] Bulk operations
- [ ] Analytics y recomendaciones
- [ ] Export/Import JSON
- [ ] Time slot tracking

## 🔗 Integración con Backend

### Endpoint requerido:
```
POST /api/pitches/{pitchId}/schedule
Content-Type: application/json

Body: DaySchedule[]
Response: {
    success: boolean
    message: string
    scheduleId?: string
}
```

## 📊 Estadísticas

- **Líneas de código**: ~550 (componente principal)
- **Props del componente**: 4
- **Estados internos**: 1 (schedule array)
- **Funciones principais**: 3 (updateDay, replicate, save)
- **Colores únicos**: 8+
- **Elemento de UI**: 50+
- **Interacciones**: 30+

## 🎓 Aprendizajes y Best Practices

1. **State Management**
   - Usar `useState` para estado local complejo
   - Patrones de actualización inmutable

2. **Accesibilidad**
   - Etiquetas descriptivas
   - Indicadores visuales claros
   - Colores complementarios

3. **Responsive Design**
   - Mobile-first approach
   - Grid system coherente
   - Breakpoints definidos

4. **Performance**
   - Componente self-contained
   - No re-renders innecesarios
   - Eventos debounceados (si aplica)

---

## 🎬 Próximos Pasos

1. **Testing**: Crear suite de pruebas
2. **API**: Implementar endpoints en backend
3. **Validación**: Agregar validaciones robustas
4. **Analytics**: Integrar con sistema de analytics
5. **Documentación**: Crear guías de uso para admins

---

**Última actualización**: Mayo 2026
**Version**: 1.0 - Phase 1 Complete
**Estado**: Ready for integration testing
