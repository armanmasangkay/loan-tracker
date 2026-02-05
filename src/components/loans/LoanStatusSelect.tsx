"use client";

import { useState, useTransition } from "react";
import { Select, Button, Textarea, Modal, Input } from "@/components/ui";
import { updateLoanStatus } from "@/lib/actions/loans";
import { LOAN_STATUSES, LOAN_STATUS_LABELS, type LoanStatus } from "@/lib/db/schema";

interface LoanStatusSelectProps {
  loanId: number;
  currentStatus: LoanStatus;
}

export function LoanStatusSelect({
  loanId,
  currentStatus,
}: LoanStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const statusOptions = LOAN_STATUSES.map((status) => ({
    value: status,
    label: LOAN_STATUS_LABELS[status],
  }));

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      setSelectedStatus(newStatus as LoanStatus);
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateLoanStatus(
        loanId,
        selectedStatus,
        notes || undefined,
        selectedStatus === "encoded" ? maturityDate || undefined : undefined
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setShowModal(false);
        setNotes("");
        setMaturityDate("");
      }
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedStatus(currentStatus);
    setNotes("");
    setMaturityDate("");
    setError(null);
  };

  return (
    <>
      <Select
        label="Status"
        options={statusOptions}
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title="Change Status"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--status-danger)] border border-red-200 rounded-lg text-[var(--status-danger-text)] text-sm">
              {error}
            </div>
          )}

          <p className="text-[var(--secondary-foreground)]">
            Change status from{" "}
            <span className="font-semibold">{LOAN_STATUS_LABELS[currentStatus]}</span>{" "}
            to{" "}
            <span className="font-semibold">{LOAN_STATUS_LABELS[selectedStatus]}</span>
            ?
          </p>

          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this status change..."
            disabled={isPending}
          />

          {selectedStatus === "encoded" && (
            <div>
              <Input
                label="Maturity Date"
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                disabled={isPending}
                required
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Required for encoded loans
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={isPending}
              loadingText="Updating..."
              disabled={selectedStatus === "encoded" && !maturityDate}
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
