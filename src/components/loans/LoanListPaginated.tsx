"use client";

import { useState } from "react";
import { LoanCard } from "./LoanCard";
import { Button } from "@/components/ui";
import { type LoanWithRelations } from "@/lib/db/schema";
import { getLoans, type LoanFilters } from "@/lib/actions/loans";

interface LoanListPaginatedProps {
  initialLoans: LoanWithRelations[];
  totalCount: number;
  filters: LoanFilters;
  pageSize: number;
}

export function LoanListPaginated({
  initialLoans,
  totalCount,
  filters,
  pageSize,
}: LoanListPaginatedProps) {
  const [loans, setLoans] = useState(initialLoans);
  const [offset, setOffset] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const hasMore = loans.length < totalCount;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextLoans = await getLoans({
        ...filters,
        limit: pageSize,
        offset,
      });
      setLoans((prev) => [...prev, ...nextLoans]);
      setOffset((prev) => prev + pageSize);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="mt-4 text-[var(--foreground)]">No loans found</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Try adjusting your filters or create a new loan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {loans.map((loan, index) => (
          <div
            key={loan.id}
            className="animate-slide-up"
            style={{ animationDelay: `${(index % pageSize) * 0.05}s` }}
          >
            <LoanCard loan={loan} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
            loadingText="Loading..."
          >
            Load More ({loans.length} of {totalCount})
          </Button>
        </div>
      )}
    </div>
  );
}
