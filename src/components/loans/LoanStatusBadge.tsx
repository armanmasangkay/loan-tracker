import { cn } from "@/lib/utils";
import { type LoanStatus, LOAN_STATUS_LABELS } from "@/lib/db/schema";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

const statusConfig: Record<
  LoanStatus,
  { className: string }
> = {
  applied: { className: "bg-blue-100 text-blue-700" },
  verified: { className: "bg-cyan-100 text-cyan-700" },
  approved: { className: "bg-emerald-100 text-emerald-700" },
  encoded: { className: "bg-purple-100 text-purple-700" },
  vouchered: { className: "bg-amber-100 text-amber-700" },
  released: { className: "bg-green-100 text-green-700" },
  cancelled: { className: "bg-red-100 text-red-700" },
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        config.className,
        className
      )}
    >
      {LOAN_STATUS_LABELS[status]}
    </span>
  );
}
