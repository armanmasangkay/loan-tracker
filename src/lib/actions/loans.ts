"use server";

import { db } from "@/lib/db";
import {
  loans,
  statusHistory,
  loanNotes,
  LoanStatus,
  LoanWithRelations,
} from "@/lib/db/schema";
import { eq, and, gte, lte, ilike, desc, asc, sum } from "drizzle-orm";
import { assertAuth } from "@/lib/auth/admin";
import { loanSchema, statusChangeSchema, noteSchema } from "@/lib/validations/loan";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLoan(
  _prevState: { error?: string; success?: boolean; loanId?: number } | null,
  formData: FormData
) {
  const session = await assertAuth();

  const rawData = {
    applicantName: formData.get("applicantName") as string,
    applicationDate: formData.get("applicationDate") as string,
    amount: formData.get("amount") as string,
  };

  const result = loanSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const validated = result.data;
  const cleanAmount = validated.amount.replace(/,/g, "");

  const [newLoan] = await db
    .insert(loans)
    .values({
      applicantName: validated.applicantName.trim(),
      applicationDate: new Date(validated.applicationDate),
      amount: cleanAmount,
      status: "applied",
      createdById: session.user.id,
    })
    .returning();

  // Create initial status history entry
  await db.insert(statusHistory).values({
    loanId: newLoan.id,
    previousStatus: null,
    newStatus: "applied",
    changedById: session.user.id,
    notes: "Loan application created",
  });

  revalidatePath("/dashboard", "page");
  redirect("/dashboard");
}

export async function updateLoanStatus(
  loanId: number,
  newStatus: LoanStatus,
  notes?: string,
  maturityDate?: string
) {
  const session = await assertAuth();

  const result = statusChangeSchema.safeParse({ status: newStatus, notes, maturityDate });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const validated = result.data;

  // Require maturity date when changing to encoded
  if (validated.status === "encoded" && !validated.maturityDate) {
    return { error: "Maturity date is required when changing status to Encoded" };
  }

  const loan = await db.query.loans.findFirst({
    where: eq(loans.id, loanId),
  });

  if (!loan) {
    return { error: "Loan not found" };
  }

  // Build update object
  const updateData: { status: string; updatedAt: Date; maturityDate?: Date } = {
    status: validated.status,
    updatedAt: new Date(),
  };

  // Set maturity date when changing to encoded
  if (validated.status === "encoded" && validated.maturityDate) {
    updateData.maturityDate = new Date(validated.maturityDate);
  }

  // Update loan status
  await db
    .update(loans)
    .set(updateData)
    .where(eq(loans.id, loanId));

  // Record status change in history
  await db.insert(statusHistory).values({
    loanId,
    previousStatus: loan.status,
    newStatus: validated.status,
    changedById: session.user.id,
    notes: validated.notes || null,
  });

  revalidatePath("/dashboard", "page");
  revalidatePath(`/dashboard/loans/${loanId}`);
  return { success: true };
}

export async function addLoanNote(loanId: number, content: string) {
  const session = await assertAuth();

  const result = noteSchema.safeParse({ content });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const validated = result.data;

  await db.insert(loanNotes).values({
    loanId,
    content: validated.content.trim(),
    createdById: session.user.id,
  });

  revalidatePath(`/dashboard/loans/${loanId}`);
  return { success: true };
}

export interface LoanFilters {
  status?: LoanStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  maturityStartDate?: string;
  maturityEndDate?: string;
  sortOrder?: "asc" | "desc";
}

export async function getLoans(
  filters: LoanFilters = {}
): Promise<LoanWithRelations[]> {
  await assertAuth();

  const conditions = [];

  if (filters.status) {
    conditions.push(eq(loans.status, filters.status));
  }

  if (filters.search) {
    conditions.push(ilike(loans.applicantName, `%${filters.search}%`));
  }

  if (filters.startDate) {
    conditions.push(gte(loans.applicationDate, new Date(filters.startDate)));
  }

  if (filters.endDate) {
    // Add one day to include the end date
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    conditions.push(lte(loans.applicationDate, endDate));
  }

  if (filters.maturityStartDate) {
    conditions.push(gte(loans.maturityDate, new Date(filters.maturityStartDate)));
  }

  if (filters.maturityEndDate) {
    // Add one day to include the end date
    const maturityEndDate = new Date(filters.maturityEndDate);
    maturityEndDate.setDate(maturityEndDate.getDate() + 1);
    conditions.push(lte(loans.maturityDate, maturityEndDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db.query.loans.findMany({
    where: whereClause,
    with: {
      createdBy: {
        columns: { id: true, displayName: true },
      },
      statusHistory: {
        with: {
          changedBy: { columns: { id: true, displayName: true } },
        },
        orderBy: [desc(statusHistory.changedAt)],
      },
      notes: {
        with: {
          createdBy: { columns: { id: true, displayName: true } },
        },
        orderBy: [desc(loanNotes.createdAt)],
      },
    },
    orderBy:
      filters.sortOrder === "asc"
        ? [asc(loans.applicationDate)]
        : [desc(loans.applicationDate)],
  });
}

export async function getLoanById(
  id: number
): Promise<LoanWithRelations | null> {
  await assertAuth();

  const result = await db.query.loans.findFirst({
    where: eq(loans.id, id),
    with: {
      createdBy: {
        columns: { id: true, displayName: true },
      },
      statusHistory: {
        with: {
          changedBy: { columns: { id: true, displayName: true } },
        },
        orderBy: [desc(statusHistory.changedAt)],
      },
      notes: {
        with: {
          createdBy: { columns: { id: true, displayName: true } },
        },
        orderBy: [desc(loanNotes.createdAt)],
      },
    },
  });

  return result || null;
}

export async function getTotalReleasedAmount(
  filters: Omit<LoanFilters, "status"> = {}
): Promise<string> {
  await assertAuth();

  const conditions = [eq(loans.status, "released")];

  if (filters.search) {
    conditions.push(ilike(loans.applicantName, `%${filters.search}%`));
  }

  if (filters.startDate) {
    conditions.push(gte(loans.applicationDate, new Date(filters.startDate)));
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    conditions.push(lte(loans.applicationDate, endDate));
  }

  const result = await db
    .select({ total: sum(loans.amount) })
    .from(loans)
    .where(and(...conditions));

  return result[0]?.total || "0";
}

export async function deleteLoan(id: number) {
  const session = await assertAuth();

  // Only admin can delete
  if (session.user.role !== "admin") {
    return { error: "Only admin can delete loans" };
  }

  await db.delete(loans).where(eq(loans.id, id));

  revalidatePath("/dashboard", "page");
  return { success: true };
}
