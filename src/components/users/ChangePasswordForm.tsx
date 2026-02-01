"use client";

import { useActionState } from "react";
import { Input, Button } from "@/components/ui";
import { changePassword } from "@/lib/actions/auth";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Password changed successfully!
        </div>
      )}

      <Input
        label="Current Password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your current password"
        required
        disabled={isPending}
      />

      <Input
        label="New Password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your new password"
        required
        disabled={isPending}
      />

      <Input
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Confirm your new password"
        required
        disabled={isPending}
      />

      <div className="text-sm text-slate-500 space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside text-xs space-y-0.5 text-slate-400">
          <li>At least 8 characters</li>
          <li>At least one uppercase letter</li>
          <li>At least one lowercase letter</li>
          <li>At least one number</li>
        </ul>
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        loadingText="Changing..."
        className="w-full"
      >
        Change Password
      </Button>
    </form>
  );
}
