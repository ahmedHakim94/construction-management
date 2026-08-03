import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email"),

  password: z
    .string()
    .trim()
    .min(1, "Password is required"),

  role: z
    .string()
    .min(1, "Role is required"),

  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;