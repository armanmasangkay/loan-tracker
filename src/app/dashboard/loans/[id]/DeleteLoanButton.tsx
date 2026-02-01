"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "@/components/ui";
import { deleteLoan } from "@/lib/actions/loans";

interface DeleteLoanButtonProps {
  loanId: number;
}

export function DeleteLoanButton({ loanId }: DeleteLoanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteLoan(loanId);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowModal(true)}
      >
        Delete
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Loan"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <p className="text-slate-600">
            Are you sure you want to delete this loan? This action cannot be
            undone.
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
              onClick={handleDelete}
              isLoading={isPending}
              loadingText="Deleting..."
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
