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
    <div className="space-y-6">
      {/* Storage Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">
            Storage Statistics
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Total Count */}
            <div>
              <p className="text-sm text-slate-500">Total Loans</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalLoans}
              </p>
            </div>

            {/* By Status */}
            <div>
              <p className="text-sm text-slate-500 mb-3">Loans by Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(LOAN_STATUS_LABELS).map(([status, label]) => (
                  <div
                    key={status}
                    className="bg-slate-50 rounded-lg p-3 text-center"
                  >
                    <p className="text-2xl font-bold text-slate-900">
                      {stats.byStatus[status] || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible for Cleanup */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800">
                Eligible for Cleanup
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {stats.eligibleForCleanup} loans
              </p>
              <p className="text-xs text-amber-700 mt-2">
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
          <h2 className="text-lg font-semibold text-slate-900">
            Data Retention Policy
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-2 font-medium text-slate-700">
                      Retention Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">
                      Active (Applied → Vouchered)
                    </td>
                    <td className="py-2 text-slate-600">Keep indefinitely</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Released</td>
                    <td className="py-2 text-slate-600">Delete after 1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">Cancelled</td>
                    <td className="py-2 text-slate-600">
                      Delete after 6 months
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500">
              Vercel Postgres free tier: 256MB storage. Estimated capacity:
              ~100,000 loans with full history.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Action */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">
            Manual Cleanup
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
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
