"use client";

import { useState, useTransition } from "react";
import { Button, Modal } from "@/components/ui";
import { cleanupOldLoans } from "@/lib/actions/maintenance";

interface CleanupButtonProps {
  eligibleCount: number;
}

export function CleanupButton({ eligibleCount }: CleanupButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{
    deletedReleasedCount: number;
    deletedCancelledCount: number;
  } | null>(null);

  const handleCleanup = () => {
    startTransition(async () => {
      const res = await cleanupOldLoans();
      if (res.success) {
        setResult({
          deletedReleasedCount: res.deletedReleasedCount,
          deletedCancelledCount: res.deletedCancelledCount,
        });
      }
      setShowModal(false);
    });
  };

  return (
    <>
      <div className="space-y-4">
        {result && (
          <div className="p-4 bg-[var(--status-success)] border border-green-200 rounded-lg text-[var(--status-success-text)] text-sm">
            Cleanup completed! Deleted {result.deletedReleasedCount} released
            loan(s) and {result.deletedCancelledCount} cancelled loan(s).
          </div>
        )}

        <Button
          onClick={() => setShowModal(true)}
          disabled={eligibleCount === 0 || isPending}
          isLoading={isPending}
          loadingText="Cleaning up..."
        >
          Run Cleanup
        </Button>

        {eligibleCount === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]">
            No loans eligible for cleanup at this time.
          </p>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Cleanup"
      >
        <div className="space-y-4">
          <p className="text-[var(--secondary-foreground)]">
            This will permanently delete <strong>{eligibleCount}</strong>{" "}
            loan(s) that meet the retention policy criteria.
          </p>

          <p className="text-sm text-[var(--status-warning-text)]">
            This action cannot be undone. All associated status history and
            notes will also be deleted.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleCleanup}
              isLoading={isPending}
              loadingText="Cleaning..."
              className="flex-1"
            >
              Delete {eligibleCount} Loan(s)
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
