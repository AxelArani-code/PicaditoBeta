"use client";

export default function VenueSkeleton() {
  return (
    <div className="animate-pulse rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-5">
      <div className="h-52 w-full rounded-3xl bg-white/5" />
      <div className="mt-5 space-y-4">
        <div className="h-5 w-3/4 rounded-full bg-white/5" />
        <div className="grid gap-3">
          <div className="h-10 rounded-3xl bg-white/5" />
          <div className="h-10 rounded-3xl bg-white/5" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-1/2 rounded-full bg-white/5" />
          <div className="h-8 w-1/3 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
