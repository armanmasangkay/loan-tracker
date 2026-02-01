"use server";

import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { assertAdmin } from "@/lib/auth/admin";
import { hashPassword } from "@/lib/auth";
import { userSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

const DEFAULT_PASSWORD = "password";

export async function createUser(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  await assertAdmin();

  const rawData = {
    username: formData.get("username") as string,
    displayName: formData.get("displayName") as string,
    role: formData.get("role") as string,
  };

  const result = userSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const validated = result.data;

  // Check if username exists
  const existing = await db.query.users.findFirst({
    where: eq(users.username, validated.username.toLowerCase()),
  });

  if (existing) {
    return { error: "Username already exists" };
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  await db.insert(users).values({
    username: validated.username.toLowerCase(),
    displayName: validated.displayName,
    role: validated.role,
    passwordHash,
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function resetUserPassword(userId: number) {
  await assertAdmin();

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Invalidate all user sessions
  await db.delete(sessions).where(eq(sessions.userId, userId));

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function toggleUserStatus(userId: number) {
  await assertAdmin();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: "User not found" };
  }

  await db
    .update(users)
    .set({ isActive: !user.isActive, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // If disabling, invalidate all user sessions
  if (user.isActive) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function getUsers() {
  await assertAdmin();

  return db.query.users.findMany({
    columns: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: [desc(users.createdAt)],
  });
}

export async function getUserById(userId: number) {
  await assertAdmin();

  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
}
