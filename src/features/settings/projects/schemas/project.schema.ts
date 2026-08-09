import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  address: z.string().trim().min(1, "Address is required"),
});

export type ProjectSchemaValues = z.infer<typeof projectSchema>;
