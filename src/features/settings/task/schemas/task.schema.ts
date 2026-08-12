import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type TaskSchemaValues = z.infer<typeof taskSchema>;
