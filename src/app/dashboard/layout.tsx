import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header, BottomNav } from "@/components/layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header user={session.user} />

      <main className="pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <BottomNav isAdmin={session.user.role === "admin"} />
    </div>
  );
}
