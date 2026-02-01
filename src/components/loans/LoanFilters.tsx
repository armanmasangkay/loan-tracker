"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Button } from "@/components/ui";
import { LOAN_STATUSES, LOAN_STATUS_LABELS } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function LoanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";

  // Sync searchValue with URL params
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/dashboard${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  const hasFilters =
    currentStatus || currentSearch || currentStartDate || currentEndDate;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...LOAN_STATUSES.map((status) => ({
      value: status,
      label: LOAN_STATUS_LABELS[status],
    })),
  ];

  return (
    <div className="space-y-4" style={{ marginBottom: '2.5rem' }}>
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by name..."
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              // Debounce search
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              debounceRef.current = setTimeout(() => {
                updateFilters({ search: value });
              }, 300);
            }}
            className="w-full pr-8"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }
                updateFilters({ search: "" });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "shrink-0",
            hasFilters && "border-[var(--primary)] text-[var(--primary)]"
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="hidden sm:inline ml-2">Filters</span>
          {hasFilters && (
            <span className="ml-1 bg-[var(--primary-light)] text-[var(--primary)] text-xs px-1.5 py-0.5 rounded-full">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-[var(--border)] rounded-lg p-4 sm:p-5 space-y-4 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={currentStatus}
              onChange={(e) => updateFilters({ status: e.target.value })}
            />

            <Input
              label="From Date"
              type="date"
              value={currentStartDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />

            <Input
              label="To Date"
              type="date"
              value={currentEndDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>

          {hasFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Filtering...
        </div>
      )}
    </div>
  );
}
