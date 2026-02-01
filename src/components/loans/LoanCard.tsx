import Link from "next/link";
import { Card } from "@/components/ui";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { formatPHP } from "@/lib/utils";
import { format } from "date-fns";
import { type LoanWithRelations, type LoanStatus } from "@/lib/db/schema";

interface LoanCardProps {
  loan: LoanWithRelations;
}

export function LoanCard({ loan }: LoanCardProps) {
  return (
    <Link href={`/loans/${loan.id}`}>
      <Card hoverable className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 sm:block">
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {loan.applicantName}
              </h3>
              <div className="sm:hidden">
                <LoanStatusBadge status={loan.status as LoanStatus} />
              </div>
            </div>

            <div className="mt-1.5 space-y-1">
              <p className="text-lg font-bold text-slate-900">
                {formatPHP(loan.amount)}
              </p>
              <p className="text-sm text-slate-500">
                Applied: {format(new Date(loan.applicationDate), "MMM d, yyyy")}
              </p>
            </div>

            {/* Notes count */}
            {loan.notes.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                {loan.notes.length} note{loan.notes.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Status Badge - Desktop */}
          <div className="hidden sm:block shrink-0">
            <LoanStatusBadge status={loan.status as LoanStatus} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
