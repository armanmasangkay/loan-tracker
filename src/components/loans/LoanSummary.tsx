"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { formatPHP } from "@/lib/utils";
import { type YearlyBreakdown } from "@/app/dashboard/page";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface LoanSummaryProps {
  totalReleased: string;
  loanCount: number;
  breakdown: YearlyBreakdown[];
}

export function LoanSummary({ totalReleased, loanCount, breakdown }: LoanSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-6 sm:p-7 bg-[var(--primary-light)] border-[var(--primary)]" style={{ marginTop: '2.5rem' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            Total Released Amount
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
            {formatPHP(totalReleased)}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="text-sm text-[var(--muted-foreground)]">
            {loanCount} loan{loanCount !== 1 ? "s" : ""} shown
          </p>
          {breakdown.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              {expanded ? "Hide" : "Show"} breakdown
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {expanded && breakdown.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--primary)] border-opacity-30 space-y-4">
          {breakdown.map(({ year, months, yearTotal }) => (
            <div key={year}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">{year}</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">{formatPHP(yearTotal)}</p>
              </div>
              <div className="space-y-1 pl-3">
                {months.map(({ month, total }) => (
                  <div key={month} className="flex items-center justify-between">
                    <p className="text-sm text-[var(--muted-foreground)]">{MONTH_NAMES[month]}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{formatPHP(total)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
