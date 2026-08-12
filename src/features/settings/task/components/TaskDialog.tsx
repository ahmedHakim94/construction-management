import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog, AppInput } from "@/components/ui";
import { taskSchema } from "../schemas/task.schema";
import type { Task, TaskFormValues } from "../types";

interface TaskDialogProps {
  open: boolean;
  mode: "create" | "edit";
  task?: Task;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export function TaskDialog({
  open,
  mode,
  task,
  onClose,
  onSubmit,
}: TaskDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    reset({
      name: task?.name ?? "",
    });
  }, [task, open, reset]);

  const submit = (values: TaskFormValues) => {
    setLoading(true);
    setTimeout(() => {
      onSubmit(values);
      setLoading(false);
    }, 500);
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? t("addTask") : t("editTask")}
      </DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(submit)}
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
                label={t("name")}
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
