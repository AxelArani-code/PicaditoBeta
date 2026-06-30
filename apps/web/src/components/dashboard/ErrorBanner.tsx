import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
}

// Shared error banner used across all dashboard sections
export function ErrorBanner({ message = "Ocurrió un error al cargar los datos.", onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#ff6b6b]/30 bg-[#ff6b6b]/10">
        <AlertTriangle className="h-6 w-6 text-[#ff6b6b]" />
      </div>
      <p className="text-sm font-semibold text-[#ff6b6b]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-[#1d3b52] bg-transparent px-4 text-[12px] font-bold text-[#9fb3c5] transition hover:border-[#2d5a73] hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </button>
      )}
    </div>
  );
}
