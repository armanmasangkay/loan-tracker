import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStorageStats } from "@/lib/actions/maintenance";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { LOAN_STATUS_LABELS, type LoanStatus } from "@/lib/db/schema";
import { CleanupButton } from "./CleanupButton";

export default async function MaintenancePage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const stats = await getStorageStats();

  return (
    <div className="flex flex-col gap-10">
      {/* Storage Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Storage Statistics
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Total Count */}
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Total Loans</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {stats.totalLoans}
              </p>
            </div>

            {/* By Status */}
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Loans by Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(LOAN_STATUS_LABELS).map(([status, label]) => (
                  <div
                    key={status}
                    className="bg-[var(--muted)] rounded-lg p-3 text-center"
                  >
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {stats.byStatus[status] || 0}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible for Cleanup */}
            <div className="p-4 bg-[var(--status-warning)] border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-[var(--status-warning-text)]">
                Eligible for Cleanup
              </p>
              <p className="text-2xl font-bold text-[var(--status-warning-text)] mt-1">
                {stats.eligibleForCleanup} loans
              </p>
              <p className="text-xs text-[var(--status-warning-text)] mt-2">
                Released loans older than 1 year and cancelled loans older than 6
                months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Policy */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Data Retention Policy
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 font-medium text-[var(--foreground)]">
                      Status
                    </th>
                    <th className="text-left py-2 font-medium text-[var(--foreground)]">
                      Retention Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 text-[var(--secondary-foreground)]">
                      Active (Applied → Vouchered)
                    </td>
                    <td className="py-2 text-[var(--secondary-foreground)]">Keep indefinitely</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 text-[var(--secondary-foreground)]">Released</td>
                    <td className="py-2 text-[var(--secondary-foreground)]">Delete after 1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[var(--secondary-foreground)]">Cancelled</td>
                    <td className="py-2 text-[var(--secondary-foreground)]">
                      Delete after 6 months
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              Vercel Postgres free tier: 256MB storage. Estimated capacity:
              ~100,000 loans with full history.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Action */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Manual Cleanup
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-[var(--secondary-foreground)]">
              Run cleanup to delete old released and cancelled loans based on the
              retention policy above.
            </p>

            <CleanupButton eligibleCount={stats.eligibleForCleanup} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
