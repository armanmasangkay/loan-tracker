import { LoanCard } from "./LoanCard";
import { type LoanWithRelations } from "@/lib/db/schema";

interface LoanListProps {
  loans: LoanWithRelations[];
}

export function LoanList({ loans }: LoanListProps) {
  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-slate-300"
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
        <p className="mt-4 text-slate-500">No loans found</p>
        <p className="text-sm text-slate-400">
          Try adjusting your filters or create a new loan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loans.map((loan, index) => (
        <div
          key={loan.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <LoanCard loan={loan} />
        </div>
      ))}
    </div>
  );
}
