"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number; // 0-based (matches Spring)
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visiblePages = pages.filter(
    (p) =>
      p === 0 ||
      p === totalPages - 1 ||
      Math.abs(p - currentPage) <= 1
  );

  // Insert ellipsis markers
  const withEllipsis: (number | "...")[] = [];
  let prev = -1;
  for (const p of visiblePages) {
    if (prev !== -1 && p - prev > 1) withEllipsis.push("...");
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-8"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {withEllipsis.map((item, idx) =>
        item === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(
              "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
              item === currentPage
                ? "bg-amber-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item + 1}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
