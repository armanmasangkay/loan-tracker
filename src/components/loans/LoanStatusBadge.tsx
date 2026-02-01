import { cn } from "@/lib/utils";
import { type LoanStatus, LOAN_STATUS_LABELS } from "@/lib/db/schema";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

const statusConfig: Record<LoanStatus, { className: string }> = {
  applied: { className: "bg-[var(--status-applied)] text-[var(--status-applied-text)]" },
  verified: { className: "bg-[var(--status-verified)] text-[var(--status-verified-text)]" },
  approved: { className: "bg-[var(--status-approved)] text-[var(--status-approved-text)]" },
  encoded: { className: "bg-[var(--status-encoded)] text-[var(--status-encoded-text)]" },
  vouchered: { className: "bg-[var(--status-vouchered)] text-[var(--status-vouchered-text)]" },
  released: { className: "bg-[var(--status-released)] text-[var(--status-released-text)]" },
  cancelled: { className: "bg-[var(--status-cancelled)] text-[var(--status-cancelled-text)]" },
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
