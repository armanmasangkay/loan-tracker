import { Card } from "@/components/ui";
import { formatPHP } from "@/lib/utils";

interface LoanSummaryProps {
  totalReleased: string;
  loanCount: number;
}

export function LoanSummary({ totalReleased, loanCount }: LoanSummaryProps) {
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
        <div className="text-right">
          <p className="text-sm text-[var(--muted-foreground)]">
            {loanCount} loan{loanCount !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>
    </Card>
  );
}
