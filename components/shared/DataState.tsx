"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/errors";

interface DataStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  skeleton?: ReactNode;
  children: ReactNode;
}

const defaultSkeleton = (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
        <Skeleton className="mb-3 h-4 w-1/3" />
        <Skeleton className="mb-2 h-3 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    ))}
  </div>
);

/**
 * Renders the correct loading / error / empty / success state for a data view.
 * Never hides real API failures behind placeholder content.
 *
 * Shared across the Doctor Module and the public pages.
 */
export function DataState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyMessage = "There is no data to display.",
  onRetry,
  skeleton,
  children,
}: DataStateProps) {
  if (isLoading) {
    return <>{skeleton ?? defaultSkeleton}</>;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center"
      >
        <AlertTriangle className="mx-auto mb-3 text-rose-500" size={22} />
        <p className="text-sm font-semibold text-rose-800">
          Could not load this data
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-rose-700">
          {getApiErrorMessage(error)}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onRetry}
          >
            <RefreshCw size={14} /> Retry
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Inbox className="mx-auto mb-3 text-slate-400" size={22} />
        <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
