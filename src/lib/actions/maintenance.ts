"use server";

import { db } from "@/lib/db";
import { loans, sessions } from "@/lib/db/schema";
import { and, lt, inArray, count, sql } from "drizzle-orm";
import { assertAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function cleanupOldLoans() {
  await assertAdmin();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Delete released loans older than 1 year
  const deletedReleased = await db
    .delete(loans)
    .where(
      and(inArray(loans.status, ["released"]), lt(loans.updatedAt, oneYearAgo))
    )
    .returning({ id: loans.id });

  // Delete cancelled loans older than 6 months
  const deletedCancelled = await db
    .delete(loans)
    .where(
      and(
        inArray(loans.status, ["cancelled"]),
        lt(loans.updatedAt, sixMonthsAgo)
      )
    )
    .returning({ id: loans.id });

  revalidatePath("/dashboard", "page");
  revalidatePath("/dashboard/maintenance");

  return {
    deletedReleasedCount: deletedReleased.length,
    deletedCancelledCount: deletedCancelled.length,
    success: true,
  };
}

export async function cleanupExpiredSessions() {
  await assertAdmin();

  const deleted = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning({ id: sessions.id });

  return {
    deletedCount: deleted.length,
    success: true,
  };
}

export async function getStorageStats() {
  await assertAdmin();

  const loanCounts = await db
    .select({
      status: loans.status,
      count: count(),
    })
    .from(loans)
    .groupBy(loans.status);

  const totalLoans = await db.select({ count: count() }).from(loans);

  // Get loans eligible for cleanup
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const eligibleForCleanup = await db
    .select({ count: count() })
    .from(loans)
    .where(
      sql`(${loans.status} = 'released' AND ${loans.updatedAt} < ${oneYearAgo}) OR (${loans.status} = 'cancelled' AND ${loans.updatedAt} < ${sixMonthsAgo})`
    );

  return {
    totalLoans: totalLoans[0]?.count || 0,
    byStatus: loanCounts.reduce(
      (acc, item) => {
        acc[item.status] = item.count;
        return acc;
      },
      {} as Record<string, number>
    ),
    eligibleForCleanup: eligibleForCleanup[0]?.count || 0,
  };
}
