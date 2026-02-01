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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <Header user={session.user} />

      <main className="flex justify-center pb-24 md:pb-8">
        <div className="w-full max-w-4xl mx-auto px-6 pt-6 pb-8 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>

      <BottomNav isAdmin={session.user.role === "admin"} />
    </div>
  );
}
