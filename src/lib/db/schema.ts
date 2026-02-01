import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table - credentials-based auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'admin' | 'user'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

// Sessions table for session management
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // UUID
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loan applications table
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  applicantName: varchar("applicant_name", { length: 255 }).notNull(),
  applicationDate: timestamp("application_date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // PHP format
  status: varchar("status", { length: 20 }).notNull().default("applied"),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Status change history
export const statusHistory = pgTable("status_history", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  previousStatus: varchar("previous_status", { length: 20 }),
  newStatus: varchar("new_status", { length: 20 }).notNull(),
  changedById: integer("changed_by_id")
    .notNull()
    .references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Loan notes/remarks
export const loanNotes = pgTable("loan_notes", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  createdLoans: many(loans),
  statusChanges: many(statusHistory),
  notes: many(loanNotes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [loans.createdById],
    references: [users.id],
  }),
  statusHistory: many(statusHistory),
  notes: many(loanNotes),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  loan: one(loans, {
    fields: [statusHistory.loanId],
    references: [loans.id],
  }),
  changedBy: one(users, {
    fields: [statusHistory.changedById],
    references: [users.id],
  }),
}));

export const loanNotesRelations = relations(loanNotes, ({ one }) => ({
  loan: one(loans, {
    fields: [loanNotes.loanId],
    references: [loans.id],
  }),
  createdBy: one(users, {
    fields: [loanNotes.createdById],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
export type StatusHistoryEntry = typeof statusHistory.$inferSelect;
export type LoanNote = typeof loanNotes.$inferSelect;

export type LoanWithRelations = Loan & {
  createdBy: Pick<User, "id" | "displayName">;
  statusHistory: (StatusHistoryEntry & {
    changedBy: Pick<User, "id" | "displayName">;
  })[];
  notes: (LoanNote & { createdBy: Pick<User, "id" | "displayName"> })[];
};

export const LOAN_STATUSES = [
  "applied",
  "verified",
  "approved",
  "encoded",
  "vouchered",
  "released",
  "cancelled",
] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  applied: "Applied",
  verified: "Verified",
  approved: "Approved",
  encoded: "Encoded",
  vouchered: "Vouchered",
  released: "Released",
  cancelled: "Cancelled",
};
