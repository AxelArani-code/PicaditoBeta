/**
 * EJEMPLOS DE EXPANSION - Schedule Management Component
 * 
 * Este archivo contiene ejemplos de cómo expandir y mejorar la componente
 * a lo largo del desarrollo del proyecto.
 */

// ============================================================================
// EJEMPLO 1: Agregar Validaciones
// ============================================================================

interface ValidationError {
    day: string;
    field: string;
    message: string;
}

function validateSchedule(schedule: DaySchedule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    schedule.forEach((day, idx) => {
        if (day.isOpen) {
            // Validar que start < end
            if (day.startTime >= day.endTime) {
                errors.push({
                    day: day.day,
                    field: 'time',
                    message: 'La hora de inicio debe ser anterior a la de cierre'
                });
            }

            // Validar precios positivos
            if (day.basePrice <= 0) {
                errors.push({
                    day: day.day,
                    field: 'basePrice',
                    message: 'El precio debe ser mayor a 0'
                });
            }

            // Validar relación de precios
            if (day.valleyPrice > day.basePrice || day.peakPrice < day.basePrice) {
                errors.push({
                    day: day.day,
                    field: 'prices',
                    message: 'Verificar: Valle < Base < Pico'
                });
            }
        }
    });

    return errors;
}

// ============================================================================
// EJEMPLO 2: Agregar Toast Notifications
// ============================================================================

import { useState } from 'react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
}

// Hook personalizado
function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove después de 3 segundos
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return { toasts, showToast };
}

// Uso en el componente
async function handleSaveWithToast() {
    const { showToast } = useToast();
    const errors = validateSchedule(schedule);

    if (errors.length > 0) {
        showToast(`${errors.length} errores encontrados`, 'error');
        return;
    }

    try {
        const response = await fetch(`/api/pitches/${pitchId}/schedule`, {
            method: 'POST',
            body: JSON.stringify(schedule)
        });

        if (response.ok) {
            showToast('Horarios guardados exitosamente', 'success');
            onClose();
        } else {
            showToast('Error al guardar horarios', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ============================================================================
// EJEMPLO 3: Agregar Dynamic Pricing Rules Configuration
// ============================================================================

interface DynamicPricingRule {
    id: string;
    name: string;
    type: 'weather' | 'occupancy' | 'timeOfDay' | 'custom';
    enabled: boolean;
    config: {
        condition?: string;
        adjustment: number; // % de ajuste
        minPrice?: number;
        maxPrice?: number;
    };
}

function PricingRuleCard({ rule, onEdit, onDelete }: {
    rule: DynamicPricingRule;
    onEdit: (rule: DynamicPricingRule) => void;
    onDelete: (ruleId: string) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-[#0e150e]/60 p-4">
            <div className="flex items-center gap-4">
                <input
                    type="checkbox"
                    checked={rule.enabled}
                    className="cursor-pointer"
                />
                <div>
                    <p className="text-sm font-bold text-[#dce5d9]">{rule.name}</p>
                    <p className="text-[10px] text-[#bccbb9]">
                        Ajuste: {rule.config.adjustment > 0 ? '+' : ''}{rule.config.adjustment}%
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEdit(rule)} className="text-[#4be176] text-xs">
                    EDITAR
                </button>
                <button onClick={() => onDelete(rule.id)} className="text-[#ffb4ab] text-xs">
                    ELIMINAR
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// EJEMPLO 4: Agregar Time Slot Templates
// ============================================================================

interface TimeTemplate {
    id: string;
    name: string; // "Horario Estándar", "Horario Extendido"
    slots: Array<{
        startTime: string;
        endTime: string;
    }>;
    pricing: {
        basePrice: number;
        valleyPrice: number;
        peakPrice: number;
    };
}

const templates: TimeTemplate[] = [
    {
        id: 'standard',
        name: 'Horario Estándar',
        slots: [
            { startTime: '08:00', endTime: '23:00' }
        ],
        pricing: { basePrice: 50, valleyPrice: 35, peakPrice: 65 }
    },
    {
        id: 'extended',
        name: 'Horario Extendido',
        slots: [
            { startTime: '06:00', endTime: '23:59' }
        ],
        pricing: { basePrice: 60, valleyPrice: 40, peakPrice: 75 }
    },
    {
        id: 'morning',
        name: 'Solo Mañana',
        slots: [
            { startTime: '06:00', endTime: '12:00' }
        ],
        pricing: { basePrice: 35, valleyPrice: 25, peakPrice: 45 }
    }
];

function applyTemplate(template: TimeTemplate, schedule: DaySchedule[]): DaySchedule[] {
    return schedule.map(day => ({
        ...day,
        startTime: template.slots[0].startTime,
        endTime: template.slots[0].endTime,
        basePrice: template.pricing.basePrice,
        valleyPrice: template.pricing.valleyPrice,
        peakPrice: template.pricing.peakPrice
    }));
}

// ============================================================================
// EJEMPLO 5: Agregar Blackout Dates
// ============================================================================

interface BlackoutDate {
    id: string;
    date: string; // YYYY-MM-DD
    reason: string;
    recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Mostrar en el drawer
export const BlackoutDatesView = ({ blackoutDates, removeBlackout }: { blackoutDates: BlackoutDate[], removeBlackout: (id: string) => void }) => (
    <div className="mt-6 space-y-3">
        <h4 className="text-sm font-bold text-[#dce5d9]">Fechas Cerradas</h4>
        {blackoutDates.map(blackout => (
            <div key={blackout.id} className="flex items-center justify-between rounded-lg bg-[#161d16]/60 p-3">
                <div>
                    <p className="text-xs font-semibold text-[#ffb4ab]">{blackout.date}</p>
                    <p className="text-[10px] text-[#bccbb9]">{blackout.reason}</p>
                </div>
                <button onClick={() => removeBlackout(blackout.id)} className="text-[#ffb4ab] text-xs">
                    ELIMINAR
                </button>
            </div>
        ))}
    </div>
);

// ============================================================================
// EJEMPLO 6: Agregar Historial de Cambios
// ============================================================================

interface ScheduleChange {
    id: string;
    timestamp: Date;
    userId: string;
    changes: Array<{
        field: string;
        oldValue: any;
        newValue: any;
        day: string;
    }>;
}

function logChange(changes: any[]) {
    const change: ScheduleChange = {
        id: `change_${Date.now()}`,
        timestamp: new Date(),
        userId: 'current_user',
        changes
    };

    // Guardar en backend
    fetch('/api/audit/schedule-changes', {
        method: 'POST',
        body: JSON.stringify(change)
    });
}

// ============================================================================
// EJEMPLO 7: Agregar Bulk Operations
// ============================================================================

enum BulkOperation {
    APPLY_TO_ALL = 'applyToAll',
    APPLY_TO_WEEKDAYS = 'applyToWeekdays',
    APPLY_TO_WEEKENDS = 'applyToWeekends',
    COPY_FROM_LAST_WEEK = 'copyFromLastWeek'
}

function performBulkOperation(
    schedule: DaySchedule[],
    operation: BulkOperation,
    sourceDay: DaySchedule
): DaySchedule[] {
    switch (operation) {
        case BulkOperation.APPLY_TO_ALL:
            return schedule.map(day => ({ ...day, ...sourceDay }));

        case BulkOperation.APPLY_TO_WEEKDAYS:
            return schedule.map((day, idx) => {
                if (idx < 5) { // Lunes - Viernes
                    return { ...day, ...sourceDay };
                }
                return day;
            });

        case BulkOperation.APPLY_TO_WEEKENDS:
            return schedule.map((day, idx) => {
                if (idx >= 5) { // Sábado - Domingo
                    return { ...day, ...sourceDay };
                }
                return day;
            });

        default:
            return schedule;
    }
}

// ============================================================================
// EJEMPLO 8: Integración con Analytics
// ============================================================================

interface ScheduleAnalytics {
    totalHoursOpen: number;
    averageBasePrice: number;
    priceVariance: number;
    occupancyPrediction: number; // %
    recommendations: string[];
}

function analyzeSchedule(schedule: DaySchedule[]): ScheduleAnalytics {
    const totalHours = schedule.reduce((sum, day) => {
        if (day.isOpen) {
            const start = parseInt(day.startTime.split(':')[0]);
            const end = parseInt(day.endTime.split(':')[0]);
            return sum + (end - start);
        }
        return sum;
    }, 0);

    const averagePrice = schedule.reduce((sum, day) => sum + day.basePrice, 0) / schedule.length;
    
    const recommendations: string[] = [];
    if (totalHours < 60) recommendations.push('Considera abrir más horas');
    if (averagePrice < 40) recommendations.push('Precio promedio bajo, considera revisar');
    if (Math.max(...schedule.map(d => d.peakPrice)) - Math.min(...schedule.map(d => d.basePrice)) > 40) {
        recommendations.push('Gran diferencia entre precios, valida la estrategia');
    }

    return {
        totalHoursOpen: totalHours,
        averageBasePrice: averagePrice,
        priceVariance: 15, // Simulado
        occupancyPrediction: 78, // Simulado
        recommendations
    };
}

// ============================================================================
// EJEMPLO 9: Export/Import de Configuración
// ============================================================================

function exportScheduleAsJSON(schedule: DaySchedule[]) {
    const data = JSON.stringify(schedule, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule_${new Date().toISOString()}.json`;
    a.click();
}

async function importScheduleFromJSON(file: File) {
    const text = await file.text();
    const schedule = JSON.parse(text) as DaySchedule[];
    return schedule;
}

// ============================================================================
// EJEMPLO 10: Testing
// ============================================================================

/*
// Pruebas unitarias con Jest

describe('ScheduleManagementDrawer', () => {
    it('debe validar que endTime > startTime', () => {
        const schedule = [{ day: 'Lunes', startTime: '23:00', endTime: '08:00' }];
        const errors = validateSchedule(schedule);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('debe replicar correctamente el horario', () => {
        const schedule = generateDefaultSchedule();
        schedule[0].basePrice = 75;
        
        const replicated = replicateSchedule(schedule);
        replicated.forEach(day => {
            expect(day.basePrice).toBe(75);
        });
    });

    it('debe aplicar templates correctamente', () => {
        const template = templates[0];
*/
