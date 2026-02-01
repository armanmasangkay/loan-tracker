import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui";
import { LoginForm } from "@/components/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--muted)]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Loan Tracker</h1>
          <p className="text-[var(--muted-foreground)] mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="py-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
