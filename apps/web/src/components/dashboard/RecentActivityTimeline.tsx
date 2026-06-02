"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";
import {
  getBookingStatusDisplay,
  formatBookingDate,
} from "@/services/bookings.service";

interface ActivityItem {
  id: string;
  actionText: string;
  actionType: "pending" | "confirmed" | "rejected" | "cancelled";
  userName: string;
  timestamp: Date;
  booking: Record<string, unknown>;
}

interface RecentActivityTimelineProps {
  activities: ActivityItem[];
  loading?: boolean;
}

/**
 * Timeline de actividad reciente con diseño administrativo profesional
 * Muestra: confirmadas, rechazadas, nuevas, cancelaciones
 */
export function RecentActivityTimeline({
  activities,
  loading = false,
}: RecentActivityTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6bfe8f] border-r-transparent" />
          <p className="text-sm text-[#bccbb9]">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-[#bccbb9]/50" />
        <p className="mt-3 text-sm text-[#bccbb9]">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <TimelineItem
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  );
}

/**
 * Item individual de timeline
 */
function TimelineItem({
  activity,
  isLast,
}: {
  activity: ActivityItem;
  isLast: boolean;
}) {
  const statusDisplay = getBookingStatusDisplay(activity.actionType);
  const icon = getActivityIcon(activity.actionType);

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[18px] top-12 h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
      )}

      {/* Timeline dot + icon */}
      <div className="flex-shrink-0">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${statusDisplay.borderColor} ${statusDisplay.bgColor} bg-gradient-to-br`}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#dce5d9]">{activity.actionText}</p>
            <p className="mt-1 text-xs text-[#bccbb9]">
              Por: <span className="font-semibold text-[#adc6ff]">{activity.userName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#bccbb9]">
            <Clock className="h-3.5 w-3.5" />
            <span>{getRelativeTime(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Retorna el ícono correcto según el tipo de acción
 */
function getActivityIcon(actionType: string) {
  switch (actionType) {
    case "confirmed":
      return <CheckCircle2 className="h-5 w-5 text-[#6bfe8f]" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-[#ff6b6b]" />;
    case "cancelled":
      return <Trash2 className="h-5 w-5 text-[#ffd05a]" />;
    case "pending":
    default:
      return <AlertCircle className="h-5 w-5 text-[#adc6ff]" />;
  }
}

/**
 * Calcula tiempo relativo desde una fecha
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Hace unos segundos";
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return formatBookingDate(date.toISOString());
}
