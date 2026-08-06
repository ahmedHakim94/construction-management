import { z } from "zod";

export const taskSchema = z.object({
  nameAr: z.string().trim().min(1, "Arabic name is required"),
  nameEn: z.string().trim().min(1, "English name is required"),
});

export type TaskSchemaValues = z.infer<typeof taskSchema>;
