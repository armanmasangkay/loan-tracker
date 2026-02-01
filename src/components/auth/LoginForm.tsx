"use client";

import { useActionState } from "react";
import { Input, Button } from "@/components/ui";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <Input
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        placeholder="Enter your username"
        required
        disabled={isPending}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        disabled={isPending}
      />

      <Button
        type="submit"
        isLoading={isPending}
        loadingText="Signing in..."
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
}
