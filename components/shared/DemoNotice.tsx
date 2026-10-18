import { Info } from "lucide-react";

/**
 * Visible marker shown whenever a view renders demo data because the backend
 * endpoint is unavailable. Prevents demo data from being mistaken for live data.
 *
 * Shared across the Doctor Module and the public pages.
 */
export function DemoNotice({
  className = "",
  description = "The backend service for this page is not implemented yet, so placeholder records are shown. Every action still requires a live API and will report real errors.",
}: {
  className?: string;
  description?: string;
}) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 ${className}`}
    >
      <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Demo data.</strong> {description}
      </span>
    </div>
  );
}
