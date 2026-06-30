// Shared loading spinner used across all dashboard sections

export function LoadingSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#1d3b52] border-t-[#4be176]" />
      <p className="mt-4 text-sm font-medium text-[#7890a3]">{message}</p>
    </div>
  );
}
