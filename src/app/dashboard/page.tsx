import { Suspense } from "react";
import { getLoans, getTotalReleasedAmount, type LoanFilters } from "@/lib/actions/loans";
import { LoanList, LoanFilters as LoanFiltersComponent, LoanSummary } from "@/components/loans";
import { SkeletonList } from "@/components/ui";
import { type LoanStatus } from "@/lib/db/schema";

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    maturityStartDate?: string;
    maturityEndDate?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-10 py-2">
      <Suspense fallback={null}>
        <LoanFiltersComponent />
      </Suspense>

      <Suspense fallback={<SkeletonList count={5} />}>
        <LoanListWithData filters={params} />
      </Suspense>
    </div>
  );
}

async function LoanListWithData({
  filters,
}: {
  filters: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    maturityStartDate?: string;
    maturityEndDate?: string;
  };
}) {
  const loanFilters: LoanFilters = {
    status: filters.status as LoanStatus | undefined,
    search: filters.search,
    startDate: filters.startDate,
    endDate: filters.endDate,
    maturityStartDate: filters.maturityStartDate,
    maturityEndDate: filters.maturityEndDate,
    sortOrder: "desc",
  };

  const [loans, totalReleased] = await Promise.all([
    getLoans(loanFilters),
    getTotalReleasedAmount({
      search: filters.search,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
  ]);

  return (
    <>
      <LoanList loans={loans} />

      <div className="sticky bottom-[5.5rem] md:bottom-4 z-30 mt-12">
        <LoanSummary totalReleased={totalReleased} loanCount={loans.length} />
      </div>
    </>
  );
}
