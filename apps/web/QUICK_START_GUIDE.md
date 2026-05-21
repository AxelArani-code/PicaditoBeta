# 🚀 Schedule Management Component - Quick Start Guide

## ¿Qué se creó?

Una **componente interactiva de gestión de horarios** que aparece como un panel lateral (drawer) cuando el usuario hace clic en "Gestionar Horarios" en cualquier cancha del dashboard.

**Visual**: Un panel oscuro elegante con:
- Configuración de horarios semanales
- Control de precios dinámicos (3 niveles)
- Toggle para abrir/cerrar días
- Botones de guardar/cancelar

---

## 📂 Archivos Creados

```
✅ ScheduleManagementDrawer.tsx
   - Componente principal interactiva
   - 550+ líneas de código
   - Totalmente funcional con estado local

✅ SCHEDULE_COMPONENT_README.md
   - Documentación técnica completa
   - Props, interfaces, funciones
   - Ejemplos de uso

✅ EXPANSION_EXAMPLES.ts
   - 10 ejemplos de expansión futura
   - Validaciones, toasts, reglas dinámicas
   - Importar/exportar, analytics

✅ SCHEDULE_SYSTEM_ARCHITECTURE.md
   - Diagramas de flujo
   - Estructura de archivos
   - Integración con backend
```

---

## 🎯 Características Principales

| Feature | Estado | Detalle |
|---------|--------|---------|
| Cronograma semanal | ✅ | 7 días editables |
| Toggle open/closed | ✅ | Habilitar/deshabilitar días |
| Horarios (inicio/fin) | ✅ | Inputs de hora (HH:MM) |
| Precios (3 niveles) | ✅ | Base, Valle, Pico |
| Replicar horarios | ✅ | Copiar lunes a todos |
| Inputs deshabilitados | ✅ | Se bloquean si día cerrado |
| Reglas dinámicas | 🔧 | Estructura lista (config pendiente) |
| Validaciones | ❌ | Pendiente de implementar |
| Toast notifications | ❌ | Pendiente de implementar |
| Persistencia (API) | ❌ | Pendiente de backend |

---

## 📖 Cómo Usar

### 1. El componente ya está integrado en el dashboard

Cuando hagas clic en **"Gestionar Horarios"** en cualquier cancha:

```
Cancha 01 - Fútbol 5
[Gestionar Horarios] ← Click aquí
```

### 2. Se abrirá el panel con:

```
┌─────────────────────────────────────┐
│ CONFIGURACIÓN                       │
│ Configuración de Horarios           │
│ Cancha 01 - Fútbol 5            ✕   │
├─────────────────────────────────────┤
│                                     │
│ Cronograma Semanal                  │
│                                     │
│ Lunes    [ON] 08:00-23:00           │
│          [$50] [$35] [$65]          │
│                                     │
│ Martes   [ON] 08:00-23:00           │
│          [$50] [$35] [$65]          │
│                                     │
│ ... (más días)                      │
│                                     │
│ Dynamic Pricing Rules               │
│ [Configurar reglas]                 │
│                                     │
├─────────────────────────────────────┤
│ [Cancelar]  [✓ Guardar Cambios]    │
└─────────────────────────────────────┘
```

### 3. Interacciones disponibles:

**Toggle Open/Closed:**
- Clic en el switch para activar/desactivar un día

**Editar Horarios:**
- Click en los inputs de hora (08:00, 23:00)
- Escribe la nueva hora

**Editar Precios:**
- Click en los campos de precio ($50, $35, $65)
- Ingresa nuevo valor

**Replicar Horarios:**
- Click en [REPLICAR HORARIOS]
- Todos los días se configuran como el lunes

**Guardar:**
- Click [✓ Guardar Cambios]
- Datos se envían al servidor (pendiente implementar)

**Cancelar:**
- Click [Cancelar]
- Se descartan cambios y se cierra

---

## 🔧 Próximos Pasos - Para Implementar

### Paso 1: Agregar Validaciones
```typescript
// En ScheduleManagementDrawer.tsx
const errors = validateSchedule(schedule);
if (errors.length > 0) {
    // Mostrar errores en UI
    return;
}
```

Referencia: Ver `EXPANSION_EXAMPLES.ts` - EJEMPLO 1

### Paso 2: Agregar Toast Notifications
```typescript
// Mostrar feedback al usuario
showToast('Horarios guardados exitosamente', 'success');
showToast('Error al guardar', 'error');
```

Referencia: Ver `EXPANSION_EXAMPLES.ts` - EJEMPLO 2

### Paso 3: Conectar con Backend API
```typescript
async function handleSave() {
    const response = await fetch(
        `/api/pitches/${pitchId}/schedule`,
        { method: 'POST', body: JSON.stringify(schedule) }
    );
    // ... manejar respuesta
}
```

Backend necesita este endpoint:
- **URL**: `POST /api/pitches/{pitchId}/schedule`
- **Body**: Array de `DaySchedule`
- **Response**: `{ success: boolean, message: string }`

### Paso 4: Agregar Reglas Dinámicas
El componente ya tiene la sección de UI lista, solo falta:
- Botones [CONFIGURAR] deben abrir un sub-modal
- Guardar reglas asociadas a la cancha

Referencia: Ver `EXPANSION_EXAMPLES.ts` - EJEMPLO 3

---

## 🎨 Personalización

### Cambiar Colores
En `ScheduleManagementDrawer.tsx`:

```typescript
// Cambiar color del botón guardar
// De: bg-[#4be176] (verde)
// A: bg-[#0566d9] (azul)
className="bg-[#0566d9]"

// Cambiar color del fondo
// De: bg-[#1a221a] (oscuro)
// A: bg-[#2f372e] (más claro)
className="bg-[#2f372e]"
```

### Cambiar Estructura
Por ejemplo, agregar más de 3 niveles de precios:

```typescript
// Agregar en DaySchedule interface
interface DaySchedule {
    // ... existing fields
    morningPrice: number;      // Nuevo
    afternoonPrice: number;    // Nuevo
    eveningPrice: number;      // Nuevo
}

// Agregar inputs en el componente
<div className="relative w-full">
    <span>Mañana</span>
    <input value={day.morningPrice} onChange={...} />
</div>
```

---

## 🐛 Troubleshooting

**P: El drawer no aparece cuando hago clic**
```
R: Verificar que:
   - El botón tiene onClick={() => { setSelectedField(...); setIsOpen(true); }}
   - El componente ScheduleManagementDrawer está renderizado
   - La prop isOpen={isScheduleDrawerOpen} es true
```

**P: Los inputs no dejan escribir**
```
R: Verificar que:
   - El día no está cerrado (los inputs se deshabilitan)
   - No hay error de consola bloqueando
   - El browser permite edición de inputs
```

**P: El botón "Guardar" no hace nada**
```
R: Actualmente solo loguea en consola:
   - Abre DevTools (F12)
   - Ve a Console
   - Verás: "Guardando horarios: [...]"
   - Necesita conectar con API (ver Paso 3)
```

**P: ¿Por qué algunos inputs tienen etiquetas como "Base", "Valle", "Pico"?**
```
R: Representan los niveles de demanda:
   - Base ($50): Horario normal/estándar
   - Valle ($35): Horas de baja demanda (madrugada, temprano)
   - Pico ($65): Horas de alta demanda (horario de trabajo)
```

---

## 📚 Documentación Relacionada

1. **SCHEDULE_COMPONENT_README.md**
   - Documentación técnica completa
   - Props, interfaces, ejemplos
   - Mejoras futuras

2. **EXPANSION_EXAMPLES.ts**
   - 10 ejemplos listos para copiar/pegar
   - Validaciones, toasts, analytics
   - Pruebas unitarias

3. **SCHEDULE_SYSTEM_ARCHITECTURE.md**
   - Diagrama de flujo visual
   - Estructura de archivos
   - Flujo de datos

---

## 🎓 Ejemplo Completo (Cliente + Servidor)

### Frontend (Ya implementado ✅)
```typescript
// Usuario hace clic → Drawer abre → Edita horarios → Hace clic Guardar
```

### Backend (Pendiente ⚠️)
```csharp
// API/PitchesController.cs
[HttpPost("{pitchId}/schedule")]
public async Task<IActionResult> SaveSchedule(
    int pitchId, 
    [FromBody] DayScheduleDto[] schedule)
{
    // Validar datos
    // Guardar en base de datos
    // Retornar { success: true, message: "Guardado" }
}
```

### Base de Datos (Pendiente ⚠️)
```sql
CREATE TABLE PitchSchedules (
    Id INT PRIMARY KEY,
    PitchId INT FOREIGN KEY,
    DayOfWeek INT (0-6),
    IsOpen BOOLEAN,
    StartTime TIME,
    EndTime TIME,
    BasePrice DECIMAL,
    ValleyPrice DECIMAL,
    PeakPrice DECIMAL,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);
```

---

## ✅ Checklist de Implementación

- [x] Componente interactivo creada
- [x] Integrada en dashboard
- [x] UI/UX diseño completado
- [x] Estado local funcional
- [x] Documentación técnica
- [x] Ejemplos de expansión
- [ ] Validaciones en tiempo real
- [ ] Toast notifications
- [ ] Persistencia en API
- [ ] Pruebas unitarias
- [ ] Pruebas E2E
- [ ] Documentación de usuario

---

## 🎯 Plan de Desarrollo

```
Semana 1: ✅ Crear componente (COMPLETADO)
Semana 2: ⏳ Validaciones + Toasts
Semana 3: ⏳ API integration + Backend
Semana 4: ⏳ Testing + Refinamiento
Semana 5: ⏳ Reglas dinámicas avanzadas
```

---

## 💡 Tips & Tricks

1. **Debugging**: Abre DevTools (F12) → Console → Busca "Guardando horarios"
2. **Performance**: El componente es light (~550 líneas, ~15KB minified)
3. **Accesibilidad**: Todos los inputs tienen labels implícitos/explícitos
4. **Responsive**: Funciona bien en mobile, tablet, desktop

---

## 📞 Support

- Ver documentación en carpeta `/components/dashboard/`
- Buscar en `EXPANSION_EXAMPLES.ts` si necesitas algo similar
- Revisar `SCHEDULE_SYSTEM_ARCHITECTURE.md` para diagramas

---

**¡Ya está listo para empezar a usar! 🎉**

Proximos pasos recomendados:
1. Prueba hacer clic en "Gestionar Horarios"
2. Juega con los inputs
3. Intenta el botón "REPLICAR HORARIOS"
4. Revisa la consola al hacer clic "Guardar"

Luego, conecta con tu backend para persistencia.
