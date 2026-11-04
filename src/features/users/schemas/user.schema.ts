import { z } from "zod";
import type { TFunction } from "i18next";
import { isProjectRequired } from "../utils/userAccess";

export type UserFormMode = "create" | "edit";

/**
 * Builds the Add/Edit user validation schema.
 * - Password fields are required only in create mode.
 * - Project is required only for SuperAdmin creating/editing users with admin or user roles.
 * - For Admin, project is derived automatically from req.user.project_id.
 */
export function createUserSchema(
  mode: UserFormMode,
  isSuperAdmin: boolean,
  t: TFunction,
) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t("nameRequired"))
        .min(2, t("nameLength"))
        .max(100, t("nameLength")),
      email: z
        .string()
        .trim()
        .min(1, t("emailRequired"))
        .email(t("invalidEmail")),
      password: z.string().optional().or(z.literal("")),
      confirmPassword: z.string().optional().or(z.literal("")),
      role: z.enum(["super_admin", "admin", "user"]).optional(),
      projectId: z.union([z.number(), z.string()]).nullable().optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    })
    .superRefine((values, ctx) => {
      if (mode === "create") {
        if (!values.password || values.password.length < 8) {
          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: t("passwordMin"),
          });
        }

        if (values.password !== values.confirmPassword) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message: t("passwordsMismatch"),
          });
        }
      }

      // Project selection validation applies ONLY to SuperAdmin.
      // For Admin, projectId is automatically derived from req.user.project_id.
      if (isSuperAdmin) {
        const role = values.role;
        if (role && isProjectRequired(role)) {
          const pid = values.projectId;
          if (pid === null || pid === undefined || pid === "" || pid === 0) {
            ctx.addIssue({
              code: "custom",
              path: ["projectId"],
              message: t("projectRequiredForRole"),
            });
          }
        }
      }
    });
}

export type UserSchemaValues = z.infer<ReturnType<typeof createUserSchema>>;
