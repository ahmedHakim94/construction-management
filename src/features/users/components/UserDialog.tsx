import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  AppButton,
  AppDialog,
  AppInput,
  AppPasswordInput,
  AppSelect,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useAppSelector } from "@/app/store/hooks";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import {
  createUserSchema,
  type UserFormMode,
  type UserSchemaValues,
} from "../schemas/user.schema";
import type { User, UserFormValues, UserRole } from "../types";
import {
  getAssignableRoles,
  getUserProjectId,
  isProjectRequired,
} from "../utils/userAccess";

interface UserDialogProps {
  open: boolean;
  mode: UserFormMode;
  user?: User;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  super_admin: "roleSuperAdmin",
  admin: "roleAdmin",
  user: "roleUser",
};

export function UserDialog({
  open,
  mode,
  user,
  onClose,
  onSubmit,
}: UserDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const actor = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const { data: projects = [] } = useGetAllProjectsQuery();

  const isSuperAdmin = actor?.role === "super_admin";
  const actorProjectId = getUserProjectId(actor);
  const isEditingSelf =
    mode === "edit" &&
    !!user &&
    actor?.id !== undefined &&
    Number(user.id) === Number(actor.id);

  // Admin can only assign `user`; Super Admin cannot change own role.
  const assignableRoles = getAssignableRoles(actor);
  const canPickRole = isSuperAdmin && !isEditingSelf;
  const canPickProject = isSuperAdmin;

  const schema = useMemo(
    () => createUserSchema(mode, isSuperAdmin, t),
    [mode, isSuperAdmin, t],
  );

  const userRecord = user as unknown as {
    project_id?: number | string;
    project_name?: string;
  } | undefined;

  const getDefaults = (): UserSchemaValues => {
    if (!user) {
      return {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        projectId: isSuperAdmin ? null : actorProjectId,
        status: "ACTIVE",
      };
    }

    // 1. Resolve projectId (supports both projectId and project_id from any source)
    const rawProjectId =
      user.projectId ??
      userRecord?.project_id;

    let defaultProjectId: number | null = null;
    if (rawProjectId !== null && rawProjectId !== undefined && rawProjectId !== "") {
      defaultProjectId = Number(rawProjectId);
    } else if (!isSuperAdmin) {
      defaultProjectId = actorProjectId;
    }

    // 2. Resolve status (supports status string and is_active 1/0/boolean)
    let defaultStatus: "ACTIVE" | "INACTIVE" = "ACTIVE";
    const userAny = user as unknown as {
      status?: string;
      is_active?: number | boolean | string;
    };

    if (userAny.status !== undefined && userAny.status !== null) {
      const s = String(userAny.status).toUpperCase();
      defaultStatus = s === "INACTIVE" || s === "0" ? "INACTIVE" : "ACTIVE";
    } else if (userAny.is_active !== undefined && userAny.is_active !== null) {
      const active = userAny.is_active;
      defaultStatus =
        active === 0 || active === false || active === "0"
          ? "INACTIVE"
          : "ACTIVE";
    }

    // 3. Resolve role
    const defaultRole = user.role ?? "user";

    return {
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      confirmPassword: "",
      role: defaultRole,
      projectId: defaultRole === "super_admin" ? null : defaultProjectId,
      status: defaultStatus,
    };
  };

  const { control, handleSubmit, reset, setValue } = useForm<UserSchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(),
    shouldUnregister: false,
  });

  useEffect(() => {
    if (open) {
      reset(getDefaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, mode]);

  const role = useWatch({ control, name: "role" });
  const showProject = isProjectRequired(role);

  // If role is explicitly switched to super_admin, clear projectId
  useEffect(() => {
    if (role === "super_admin") {
      setValue("projectId", null);
    }
  }, [role, setValue]);

  const roleOptions: SelectOption[] = assignableRoles.map((value) => ({
    value,
    label: t(ROLE_LABEL_KEYS[value]),
  }));

  const projectOptions: SelectOption[] = useMemo(
    () =>
      projects.map((project) => ({
        value: Number(project.id),
        label: project.name,
      })),
    [projects],
  );

  const statusOptions: SelectOption[] = [
    { value: "ACTIVE", label: t("active", { defaultValue: "نشط" }) },
    { value: "INACTIVE", label: t("inactive", { defaultValue: "غير نشط" }) },
  ];

  const currentProjectId = useWatch({ control, name: "projectId" });
  const effectiveProjectId =
    currentProjectId ??
    user?.projectId ??
    userRecord?.project_id ??
    actorProjectId;

  const displayProjectName = useMemo(() => {
    if (!effectiveProjectId) return "—";
    const found = projects.find(
      (p) => Number(p.id) === Number(effectiveProjectId),
    );
    return (
      found?.name ??
      user?.projectName ??
      userRecord?.project_name ??
      `Project #${effectiveProjectId}`
    );
  }, [projects, effectiveProjectId, user, userRecord]);

  const submit = async (values: UserSchemaValues) => {
    setLoading(true);
    try {
      const finalRole = values.role ?? user?.role ?? "user";

      // For Admin, projectId is always derived automatically from actorProjectId.
      // For SuperAdmin, projectId comes from form (or null for super_admin role).
      let finalProjectId: number | null = null;
      if (isProjectRequired(finalRole)) {
        if (isSuperAdmin) {
          finalProjectId =
            values.projectId !== null && values.projectId !== undefined
              ? Number(values.projectId)
              : null;
        } else {
          finalProjectId = actorProjectId;
        }
      }

      const finalStatus = values.status ?? "ACTIVE";

      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password?.trim() ? values.password.trim() : undefined,
        role: finalRole,
        projectId: finalProjectId,
        status: finalStatus,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{mode === "create" ? t("addUser") : t("editUser")}</DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(submit, (errors) => {
            console.error("Form validation errors:", errors);
          })}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 8,
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                {...field}
                label={t("userName")}
                required
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                {...field}
                type="email"
                label={t("email")}
                required
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {mode === "create" && (
            <>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <AppPasswordInput
                    {...field}
                    value={field.value ?? ""}
                    label={t("password")}
                    required
                    fullWidth
                    autoComplete="new-password"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <AppPasswordInput
                    {...field}
                    value={field.value ?? ""}
                    label={t("confirmPassword")}
                    required
                    fullWidth
                    autoComplete="new-password"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </>
          )}

          {canPickRole ? (
            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("role")}
                  required
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("selectRole")}
                  error={fieldState.error?.message}
                />
              )}
            />
          ) : (
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <AppInput
                  label={t("role")}
                  value={t(ROLE_LABEL_KEYS[field.value ?? user?.role ?? "user"])}
                  fullWidth
                  disabled
                />
              )}
            />
          )}

          {showProject &&
            (canPickProject ? (
              <Controller
                name="projectId"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    label={t("project")}
                    required
                    options={projectOptions}
                    value={
                      field.value !== null &&
                      field.value !== undefined &&
                      field.value !== ""
                        ? Number(field.value)
                        : ""
                    }
                    onChange={(value) =>
                      field.onChange(
                        value === "" || value === null ? null : Number(value),
                      )
                    }
                    placeholder={t("selectProject")}
                    error={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <Controller
                name="projectId"
                control={control}
                render={() => (
                  <AppInput
                    label={t("project")}
                    value={displayProjectName}
                    fullWidth
                    disabled
                  />
                )}
              />
            ))}

          {!isEditingSelf ? (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <AppSelect
                  label={t("status")}
                  options={statusOptions}
                  value={field.value ?? "ACTIVE"}
                  onChange={field.onChange}
                  placeholder={t("selectStatus")}
                />
              )}
            />
          ) : (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <AppInput
                  label={t("status")}
                  value={t(
                    field.value === "ACTIVE"
                      ? "active"
                      : "inactive",
                    {
                      defaultValue:
                        field.value === "ACTIVE" ? "نشط" : "غير نشط",
                    },
                  )}
                  fullWidth
                  disabled
                />
              )}
            />
          )}
        </form>
      </DialogContent>

      <DialogActions>
        <AppButton
          variant="contained"
          loading={loading}
          onClick={handleSubmit(submit, (errors) => {
            console.error("Form validation errors:", errors);
          })}
        >
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
        >
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
