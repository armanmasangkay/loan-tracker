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
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
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

      <p className="text-sm text-slate-500">
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
