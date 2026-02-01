"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";
import { loginSchema, changePasswordSchema } from "@/lib/validations/auth";
import { assertAuth } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const rawData = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const validated = result.data;

  const user = await db.query.users.findFirst({
    where: eq(users.username, validated.username.toLowerCase()),
  });

  if (!user || !user.isActive) {
    return { error: "Invalid username or password" };
  }

  const isValid = await verifyPassword(validated.password, user.passwordHash);

  if (!isValid) {
    return { error: "Invalid username or password" };
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function changePassword(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await assertAuth();

  const rawData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = changePasswordSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const validated = result.data;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return { error: "User not found" };
  }

  const isValid = await verifyPassword(
    validated.currentPassword,
    user.passwordHash
  );

  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const newHash = await hashPassword(validated.newPassword);

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
