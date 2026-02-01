import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getLoanById } from "@/lib/actions/loans";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import {
  LoanStatusBadge,
  LoanStatusSelect,
  LoanHistory,
  LoanNotes,
} from "@/components/loans";
import { formatPHP } from "@/lib/utils";
import { type LoanStatus } from "@/lib/db/schema";
import { DeleteLoanButton } from "./DeleteLoanButton";

interface LoanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;
  const loanId = parseInt(id, 10);

  if (isNaN(loanId)) {
    notFound();
  }

  const [loan, session] = await Promise.all([getLoanById(loanId), auth()]);

  if (!loan) {
    notFound();
  }

  const isAdmin = session?.user.role === "admin";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Button>
        </Link>

        {isAdmin && <DeleteLoanButton loanId={loan.id} />}
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {loan.applicantName}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Created by {loan.createdBy.displayName}
              </p>
            </div>
            <LoanStatusBadge status={loan.status as LoanStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Loan Amount</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatPHP(loan.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Application Date</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {format(new Date(loan.applicationDate), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Status Change */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <LoanStatusSelect
              loanId={loan.id}
              currentStatus={loan.status as LoanStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Mobile / Side-by-side for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Status History
            </h3>
          </CardHeader>
          <CardContent>
            <LoanHistory history={loan.statusHistory} />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Notes & Remarks
            </h3>
          </CardHeader>
          <CardContent>
            <LoanNotes loanId={loan.id} notes={loan.notes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
