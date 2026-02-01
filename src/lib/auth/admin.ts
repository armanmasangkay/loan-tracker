import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function assertAuth() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session;
}

export async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user.role === "admin";
}

export async function getAdminSession() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}
