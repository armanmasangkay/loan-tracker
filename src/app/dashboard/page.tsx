import { Suspense } from "react";
import { getLoans, getTotalReleasedAmount, type LoanFilters } from "@/lib/actions/loans";
import { LoanList, LoanFilters as LoanFiltersComponent, LoanSummary } from "@/components/loans";
import { SkeletonList } from "@/components/ui";
import { type LoanStatus, type LoanWithRelations } from "@/lib/db/schema";

export interface YearlyBreakdown {
  year: number;
  months: { month: number; total: number }[];
  yearTotal: number;
}

function computeReleasedBreakdown(loans: LoanWithRelations[]): YearlyBreakdown[] {
  const released = loans.filter((l) => l.status === "released");

  const map = new Map<number, Map<number, number>>();

  for (const loan of released) {
    const date = new Date(loan.applicationDate);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    if (!map.has(year)) map.set(year, new Map());
    const monthMap = map.get(year)!;
    monthMap.set(month, (monthMap.get(month) || 0) + parseFloat(loan.amount));
  }

  const result: YearlyBreakdown[] = [];
  for (const [year, monthMap] of map) {
    const months = Array.from(monthMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => b.month - a.month);
    const yearTotal = months.reduce((sum, m) => sum + m.total, 0);
    result.push({ year, months, yearTotal });
  }

  return result.sort((a, b) => b.year - a.year);
}

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

  const breakdown = computeReleasedBreakdown(loans);

  return (
    <>
      <LoanList loans={loans} />

      <div className="sticky bottom-[5.5rem] md:bottom-4 z-30 mt-12">
        <LoanSummary totalReleased={totalReleased} loanCount={loans.length} breakdown={breakdown} />
      </div>
    </>
  );
}
