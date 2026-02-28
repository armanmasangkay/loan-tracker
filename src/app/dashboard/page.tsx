import { Suspense } from "react";
import { getLoans, getLoanCount, getTotalReleasedAmount, getReleasedBreakdown, type LoanFilters } from "@/lib/actions/loans";
import { LoanListPaginated, LoanFilters as LoanFiltersComponent, LoanSummary } from "@/components/loans";
import { SkeletonList } from "@/components/ui";
import { type LoanStatus } from "@/lib/db/schema";

const PAGE_SIZE = 10;

export interface YearlyBreakdown {
  year: number;
  months: { month: number; total: number }[];
  yearTotal: number;
}

function formatBreakdown(
  rows: { year: number; month: number; total: string }[]
): YearlyBreakdown[] {
  const map = new Map<number, { month: number; total: number }[]>();

  for (const row of rows) {
    if (!map.has(row.year)) map.set(row.year, []);
    map.get(row.year)!.push({ month: row.month, total: parseFloat(row.total) });
  }

  return Array.from(map.entries())
    .map(([year, months]) => ({
      year,
      months: months.sort((a, b) => b.month - a.month),
      yearTotal: months.reduce((sum, m) => sum + m.total, 0),
    }))
    .sort((a, b) => b.year - a.year);
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

  const [loans, totalCount, totalReleased, breakdownRows] = await Promise.all([
    getLoans({ ...loanFilters, limit: PAGE_SIZE, offset: 0 }),
    getLoanCount(loanFilters),
    getTotalReleasedAmount({
      search: filters.search,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    getReleasedBreakdown({
      search: filters.search,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
  ]);

  const breakdown = formatBreakdown(breakdownRows);

  return (
    <>
      <LoanListPaginated
        key={JSON.stringify(loanFilters)}
        initialLoans={loans}
        totalCount={totalCount}
        filters={loanFilters}
        pageSize={PAGE_SIZE}
      />

      <div className="sticky bottom-[5.5rem] md:bottom-4 z-30 mt-12">
        <LoanSummary totalReleased={totalReleased} loanCount={totalCount} breakdown={breakdown} />
      </div>
    </>
  );
}
