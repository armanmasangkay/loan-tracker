"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CardHeader, CardContent, Input, Button } from "@/components/ui";
import { LoanStatusBadge, LoanStatusSelect } from "@/components/loans";
import { formatPHP } from "@/lib/utils";
import { updateLoanDetails } from "@/lib/actions/loans";
import { type LoanStatus } from "@/lib/db/schema";

interface LoanDetailEditProps {
  loanId: number;
  applicantName: string;
  applicationDate: Date;
  amount: string;
  maturityDate: Date | null;
  isAdmin: boolean;
  createdByName: string;
  currentStatus: LoanStatus;
}

type EditingField = "name" | "amount" | "date" | null;

export function LoanDetailEdit({
  loanId,
  applicantName,
  applicationDate,
  amount,
  maturityDate,
  isAdmin,
  createdByName,
  currentStatus,
}: LoanDetailEditProps) {
  const [isPending, startTransition] = useTransition();
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [error, setError] = useState<string | null>(null);

  const [editName, setEditName] = useState(applicantName);
  const [editAmount, setEditAmount] = useState(amount);
  const [editDate, setEditDate] = useState(
    format(new Date(applicationDate), "yyyy-MM-dd")
  );

  const handleSave = (field: EditingField) => {
    setError(null);
    startTransition(async () => {
      const data = {
        applicantName: field === "name" ? editName : applicantName,
        applicationDate:
          field === "date"
            ? editDate
            : format(new Date(applicationDate), "yyyy-MM-dd"),
        amount: field === "amount" ? editAmount.replace(/,/g, "") : amount,
      };

      const result = await updateLoanDetails(loanId, data);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditingField(null);
        setError(null);
      }
    });
  };

  const handleCancel = () => {
    setEditingField(null);
    setError(null);
    setEditName(applicantName);
    setEditAmount(amount);
    setEditDate(format(new Date(applicationDate), "yyyy-MM-dd"));
  };

  const editButton = (field: EditingField) => {
    if (!isAdmin) return null;
    return (
      <button
        onClick={() => {
          setEditingField(field);
          setError(null);
        }}
        className="ml-2 p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors rounded"
        aria-label={`Edit ${field}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.762 9.763a1.75 1.75 0 0 0-.46.833l-.5 2.5a.75.75 0 0 0 .891.892l2.5-.5a1.75 1.75 0 0 0 .833-.46l7.25-7.251a1.75 1.75 0 0 0 0-2.475l-.788-.789ZM11.72 3.22a.25.25 0 0 1 .354 0l.787.788a.25.25 0 0 1 0 .354L5.612 11.61a.25.25 0 0 1-.119.066l-1.559.312.312-1.56a.25.25 0 0 1 .066-.118L11.72 3.22Z" />
        </svg>
      </button>
    );
  };

  const saveCancel = (field: EditingField) => (
    <div className="flex gap-2 mt-2">
      <Button
        size="sm"
        onClick={() => handleSave(field)}
        isLoading={isPending}
        loadingText="Saving..."
      >
        Save
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCancel}
        disabled={isPending}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            {editingField === "name" ? (
              <div>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isPending}
                  placeholder="Applicant name"
                />
                {saveCancel("name")}
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  {applicantName}
                </h2>
                {editButton("name")}
              </div>
            )}
            <p className="text-sm text-[var(--muted-foreground)]">
              Created by {createdByName}
            </p>
          </div>
          <LoanStatusBadge status={currentStatus} />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-[var(--status-danger)] border border-red-200 rounded-lg text-[var(--status-danger-text)] text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Loan Amount */}
          <div className="space-y-3">
            <div className="flex items-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                Loan Amount
              </p>
              {editingField !== "amount" && editButton("amount")}
            </div>
            {editingField === "amount" ? (
              <div>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  disabled={isPending}
                  placeholder="0.00"
                />
                {saveCancel("amount")}
              </div>
            ) : (
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {formatPHP(amount)}
              </p>
            )}
          </div>

          {/* Application Date */}
          <div className="space-y-3">
            <div className="flex items-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                Application Date
              </p>
              {editingField !== "date" && editButton("date")}
            </div>
            {editingField === "date" ? (
              <div>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  disabled={isPending}
                />
                {saveCancel("date")}
              </div>
            ) : (
              <p className="text-lg font-semibold text-[var(--foreground)]">
                {format(new Date(applicationDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Maturity Date (always read-only) */}
          {maturityDate && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                Maturity Date
              </p>
              <p className="text-lg font-semibold text-[var(--foreground)]">
                {format(new Date(maturityDate), "MMMM d, yyyy")}
              </p>
            </div>
          )}
        </div>

        {/* Status Change */}
        <div className="mt-8 pt-8 border-t border-[var(--border)]">
          <LoanStatusSelect loanId={loanId} currentStatus={currentStatus} />
        </div>
      </CardContent>
    </>
  );
}
