import { notFound } from "next/navigation";
import Link from "next/link";
import { getLoanById } from "@/lib/actions/loans";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { LoanHistory, LoanNotes } from "@/components/loans";
import { type LoanStatus } from "@/lib/db/schema";
import { DeleteLoanButton } from "./DeleteLoanButton";
import { LoanDetailEdit } from "./LoanDetailEdit";

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
    <div className="flex flex-col gap-10">
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
        <LoanDetailEdit
          key={loan.updatedAt.toString()}
          loanId={loan.id}
          applicantName={loan.applicantName}
          applicationDate={loan.applicationDate}
          amount={loan.amount}
          maturityDate={loan.maturityDate}
          isAdmin={isAdmin}
          createdByName={loan.createdBy.displayName}
          currentStatus={loan.status as LoanStatus}
        />
      </Card>

      {/* Tabs for Mobile / Side-by-side for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
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
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
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
