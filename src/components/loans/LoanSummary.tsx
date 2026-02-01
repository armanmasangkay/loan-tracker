import { Card } from "@/components/ui";
import { formatPHP } from "@/lib/utils";

interface LoanSummaryProps {
  totalReleased: string;
  loanCount: number;
}

export function LoanSummary({ totalReleased, loanCount }: LoanSummaryProps) {
  return (
    <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-700">
            Total Released Amount
          </p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {formatPHP(totalReleased)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            {loanCount} loan{loanCount !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>
    </Card>
  );
}
