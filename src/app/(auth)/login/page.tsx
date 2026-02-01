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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Loan Tracker</h1>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
