"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Card, Modal, Button, Textarea } from "@/components/ui";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { formatPHP } from "@/lib/utils";
import { format } from "date-fns";
import { type LoanWithRelations, type LoanStatus, LOAN_STATUSES, LOAN_STATUS_LABELS } from "@/lib/db/schema";
import { updateLoanStatus } from "@/lib/actions/loans";

interface LoanCardProps {
  loan: LoanWithRelations;
}

interface InlineStatusSelectorProps {
  loanId: number;
  currentStatus: LoanStatus;
}

function InlineStatusSelector({ loanId, currentStatus }: InlineStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleStatusSelect = (e: React.MouseEvent, status: LoanStatus) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== currentStatus) {
      setSelectedStatus(status);
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await updateLoanStatus(loanId, selectedStatus, notes || undefined);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowModal(false);
        setSelectedStatus(null);
        setNotes("");
      }
    });
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowModal(false);
    setSelectedStatus(null);
    setNotes("");
    setError(null);
  };

  return (
    <>
      <button
        onClick={handleBadgeClick}
        className="group relative focus:outline-none"
        aria-label="Change status"
      >
        <LoanStatusBadge
          status={currentStatus}
          className="cursor-pointer transition-all group-hover:ring-2 group-hover:ring-[var(--primary)] group-hover:ring-offset-1 group-focus:ring-2 group-focus:ring-[var(--primary)] group-focus:ring-offset-1"
        />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="w-2.5 h-2.5">
            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.762 9.763a1.75 1.75 0 0 0-.46.833l-.5 2.5a.75.75 0 0 0 .891.892l2.5-.5a1.75 1.75 0 0 0 .833-.46l7.25-7.251a1.75 1.75 0 0 0 0-2.475l-.788-.789ZM11.72 3.22a.25.25 0 0 1 .354 0l.787.788a.25.25 0 0 1 0 .354L5.612 11.61a.25.25 0 0 1-.119.066l-1.559.312.312-1.56a.25.25 0 0 1 .066-.118L11.72 3.22Z" />
          </svg>
        </span>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => handleCancel()}
        title="Change Status"
      >
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {error && (
            <div className="p-3 bg-[var(--status-danger)] border border-red-200 rounded-lg text-[var(--status-danger-text)] text-sm">
              {error}
            </div>
          )}

          <p className="text-[var(--secondary-foreground)] text-sm">
            Select a new status for this loan:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {LOAN_STATUSES.map((status) => (
              <button
                key={status}
                onClick={(e) => handleStatusSelect(e, status)}
                disabled={status === currentStatus || isPending}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  status === currentStatus
                    ? "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed opacity-50"
                    : selectedStatus === status
                    ? "border-[var(--primary)] bg-[var(--primary-foreground)]"
                    : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <LoanStatusBadge status={status} />
              </button>
            ))}
          </div>

          {selectedStatus && (
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-[var(--secondary-foreground)] text-sm mb-3">
                Change from{" "}
                <span className="font-semibold">{LOAN_STATUS_LABELS[currentStatus]}</span>{" "}
                to{" "}
                <span className="font-semibold">{LOAN_STATUS_LABELS[selectedStatus]}</span>
              </p>

              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                disabled={isPending}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={(e) => handleCancel(e)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => handleConfirm(e)}
              isLoading={isPending}
              loadingText="Updating..."
              disabled={!selectedStatus}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function LoanCard({ loan }: LoanCardProps) {
  return (
    <Link href={`/dashboard/loans/${loan.id}`}>
      <Card hoverable className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 sm:block">
              <h3 className="text-base font-semibold text-[var(--foreground)] truncate">
                {loan.applicantName}
              </h3>
              <div className="sm:hidden">
                <InlineStatusSelector loanId={loan.id} currentStatus={loan.status as LoanStatus} />
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <p className="text-lg font-bold text-[var(--foreground)]">
                {formatPHP(loan.amount)}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Applied: {format(new Date(loan.applicationDate), "MMM d, yyyy")}
              </p>
            </div>

            {/* Latest Note Preview */}
            {loan.notes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--primary)]">
                    <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 01-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 01-1.33 0l-1.713-3.293a.783.783 0 00-.642-.413 41.108 41.108 0 01-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-[var(--primary)]">
                    Note{loan.notes.length > 1 && `s (${loan.notes.length})`}
                  </span>
                </div>
                <p className="text-sm text-[var(--secondary-foreground)] line-clamp-2">
                  {loan.notes[0].content}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {loan.notes[0].createdBy.displayName} • {format(new Date(loan.notes[0].createdAt), "MMM d")}
                </p>
              </div>
            )}
          </div>

          {/* Status Badge - Desktop */}
          <div className="hidden sm:block shrink-0">
            <InlineStatusSelector loanId={loan.id} currentStatus={loan.status as LoanStatus} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
