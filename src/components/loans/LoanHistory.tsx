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
      <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
        No status changes recorded
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {history.map((entry, index) => (
        <div
          key={entry.id}
          className="relative pl-8 pb-6 border-l-2 border-[var(--border)] last:border-l-0 last:pb-0"
        >
          {/* Timeline dot */}
          <div className="absolute left-[-5px] top-0.5 w-2 h-2 rounded-full bg-[var(--primary)]" />

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">
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

            <p className="text-xs text-[var(--muted-foreground)]">
              by {entry.changedBy.displayName} •{" "}
              {format(new Date(entry.changedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>

            {entry.notes && (
              <p className="text-sm text-[var(--secondary-foreground)] mt-4 p-4 bg-[var(--muted)] rounded-lg">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
