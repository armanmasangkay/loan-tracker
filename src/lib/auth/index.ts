import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())),
  });

  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: and(eq(users.id, session.userId), eq(users.isActive, true)),
  });

  if (!user) return null;

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role as "admin" | "user",
    },
    sessionId,
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    cookieStore.delete("session");
  }
}

export async function auth() {
  return getSession();
}

export type AuthSession = Awaited<ReturnType<typeof auth>>;
