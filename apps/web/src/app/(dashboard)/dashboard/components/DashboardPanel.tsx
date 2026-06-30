import { type ReactNode } from "react";

type DashboardPanelProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({ children, className = "" }: DashboardPanelProps) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#102436]/80 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}
