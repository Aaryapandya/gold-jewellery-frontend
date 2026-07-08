"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 mb-6 max-w-sm text-sm">
        An unexpected error occurred. If this keeps happening, please contact support.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
