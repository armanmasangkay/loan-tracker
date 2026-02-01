"use client";

import { useActionState } from "react";
import { Input, Select, Button } from "@/components/ui";
import { createUser } from "@/lib/actions/users";

interface UserFormProps {
  onSuccess?: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createUser(prevState, formData);
      if (result?.success && onSuccess) {
        onSuccess();
      }
      return result;
    },
    null
  );

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="p-4 bg-[var(--status-danger)] border border-red-200 rounded-lg text-[var(--status-danger-text)] text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-4 bg-[var(--status-success)] border border-green-200 rounded-lg text-[var(--status-success-text)] text-sm">
          User created successfully! Default password is &quot;password&quot;.
        </div>
      )}

      <Input
        label="Username"
        name="username"
        placeholder="Enter username"
        required
        disabled={isPending}
      />

      <Input
        label="Display Name"
        name="displayName"
        placeholder="Enter display name"
        required
        disabled={isPending}
      />

      <Select
        label="Role"
        name="role"
        options={roleOptions}
        defaultValue="user"
        disabled={isPending}
      />

      <p className="text-sm text-[var(--muted-foreground)]">
        Default password will be set to &quot;password&quot;. The user should change it
        after first login.
      </p>

      <Button
        type="submit"
        isLoading={isPending}
        loadingText="Creating..."
        className="w-full"
      >
        Create User
      </Button>
    </form>
  );
}
