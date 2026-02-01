import Link from "next/link";
import { Card, CardContent, Button } from "@/components/ui";
import { LoanForm } from "@/components/loans";

export default function NewLoanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="shrink-0">
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
      </div>

      <Card>
        <CardContent className="pt-6">
          <LoanForm />
        </CardContent>
      </Card>
    </div>
  );
}
