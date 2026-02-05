"use client";

import { useActionState } from "react";
import { Input, Button, Textarea } from "@/components/ui";
import { createLoan } from "@/lib/actions/loans";

export function LoanForm() {
  const [state, formAction, isPending] = useActionState(createLoan, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <Input
        label="Applicant Name"
        name="applicantName"
        placeholder="Enter applicant's full name"
        required
        disabled={isPending}
      />

      <Input
        label="Application Date"
        name="applicationDate"
        type="date"
        required
        disabled={isPending}
        defaultValue={new Date().toISOString().split("T")[0]}
      />

      <Input
        label="Loan Amount (PHP)"
        name="amount"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        required
        disabled={isPending}
      />

      <Textarea
        label="Notes (Optional)"
        name="notes"
        placeholder="Add any initial notes or remarks..."
        disabled={isPending}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isPending}
          loadingText="Creating..."
          className="flex-1"
        >
          Create Loan
        </Button>
      </div>
    </form>
  );
}
