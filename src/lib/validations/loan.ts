import { z } from "zod";
import { LOAN_STATUSES } from "@/lib/db/schema";

export const loanSchema = z.object({
  applicantName: z
    .string()
    .min(1, "Applicant name is required")
    .max(255, "Name is too long"),
  applicationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid application date is required",
  }),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val.replace(/,/g, ""));
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a valid positive number" }
  ),
});

export const statusChangeSchema = z.object({
  status: z.enum(LOAN_STATUSES),
  notes: z.string().optional(),
});

export const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(1000, "Note is too long"),
});

export type LoanFormData = z.infer<typeof loanSchema>;
export type StatusChangeFormData = z.infer<typeof statusChangeSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
