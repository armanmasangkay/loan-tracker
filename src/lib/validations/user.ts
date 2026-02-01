import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters"),
  role: z.enum(["admin", "user"]),
});

export type UserFormData = z.infer<typeof userSchema>;
