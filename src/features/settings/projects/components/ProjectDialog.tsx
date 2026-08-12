import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog, AppInput } from "@/components/ui";
import { projectSchema } from "../schemas/project.schema";
import type { Project, ProjectFormValues } from "../types";

interface ProjectDialogProps {
  open: boolean;
  mode: "create" | "edit";
  project?: Project;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

export function ProjectDialog({ open, mode, project, onClose, onSubmit }: ProjectDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  useEffect(() => {
    reset({
      name: project?.name ?? "",
      address: project?.address ?? "",
    });
  }, [project, open, reset]);

  const submit = async (values: ProjectFormValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === "create" ? t("addProject") : t("editProject")}</DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(submit)}
          style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8, direction: isArabic ? "rtl" : "ltr" }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("projectName")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("address")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>

        <AppButton loading={loading} onClick={handleSubmit(submit)}>
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
