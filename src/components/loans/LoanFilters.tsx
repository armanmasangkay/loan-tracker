"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Button } from "@/components/ui";
import { LOAN_STATUSES, LOAN_STATUS_LABELS } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function LoanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";

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
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value;
              // Debounce search
              const timeoutId = setTimeout(() => {
                updateFilters({ search: value });
              }, 300);
              return () => clearTimeout(timeoutId);
            }}
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "shrink-0",
            hasFilters && "border-blue-500 text-blue-600"
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
            <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 animate-slide-down">
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
        <div className="text-sm text-slate-500 flex items-center gap-2">
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
