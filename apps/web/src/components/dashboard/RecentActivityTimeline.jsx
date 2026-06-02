"use client";

import React from "react";
import { formatBookingDate } from "@/services/bookings.service";
import { Check, X, Loader2 } from "lucide-react";

export function RecentActivityTimeline({ activities = [] }) {
  if (!activities) return null;

  return (
    <ol className="relative border-l border-white/10">
      {activities.map((act) => (
        <li key={act.id} className="mb-6 ml-6">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0b120b] ring-8 ring-[#0b120b]">
            {act.actionType === "confirmed" ? (
              <Check className="h-3 w-3 text-[#6bfe8f]" />
            ) : act.actionType === "rejected" ? (
              <X className="h-3 w-3 text-[#ff6b6b]" />
            ) : (
              <Loader2 className="h-3 w-3 text-[#ffd05a]" />
            )}
          </span>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#dce5d9]">{act.actionText}</p>
              <p className="mt-1 text-xs text-[#bccbb9]">{act.userName}</p>
            </div>
            <div className="text-xs text-[#9ab59d]">{formatBookingDate(act.timestamp)}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default RecentActivityTimeline;
