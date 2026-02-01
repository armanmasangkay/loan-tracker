import { format } from "date-fns";
import { LOAN_STATUS_LABELS, type LoanStatus } from "@/lib/db/schema";

interface HistoryEntry {
  id: number;
  previousStatus: string | null;
  newStatus: string;
  changedAt: Date;
  notes: string | null;
  changedBy: {
    id: number;
    displayName: string;
  };
}

interface LoanHistoryProps {
  history: HistoryEntry[];
}

export function LoanHistory({ history }: LoanHistoryProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-4">
        No status changes recorded
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div
          key={entry.id}
          className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-l-0 last:pb-0"
        >
          {/* Timeline dot */}
          <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500" />

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">
              {entry.previousStatus ? (
                <>
                  {LOAN_STATUS_LABELS[entry.previousStatus as LoanStatus]}
                  {" → "}
                  {LOAN_STATUS_LABELS[entry.newStatus as LoanStatus]}
                </>
              ) : (
                <>{LOAN_STATUS_LABELS[entry.newStatus as LoanStatus]} (Initial)</>
              )}
            </p>

            <p className="text-xs text-slate-500">
              by {entry.changedBy.displayName} •{" "}
              {format(new Date(entry.changedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>

            {entry.notes && (
              <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded-lg">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
