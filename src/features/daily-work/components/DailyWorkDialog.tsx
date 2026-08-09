import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { AppButton, AppDialog, AppInput, AppSelect } from "@/components/ui";
import { dailyWorkSchema } from "../schemas/dailyWork.schema";
import type { DailyWorkFormValues } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { Equipment } from "@/features/equipment/types";
import type { Project } from "@/features/settings/projects/types";
import type { Task } from "@/features/settings/task/types";
import { AppDatePicker } from "@/components/ui/AppDatePicker";

interface DailyWorkDialogProps {
  open: boolean;
  mode: "create" | "edit";
  dailyWork?: DailyWorkFormValues & { id: string; createdAt: string };
  projects: Project[];
  contractors: Contractor[];
  equipment: Equipment[];
  tasks: Task[];
  onClose: () => void;
  onSubmit: (values: DailyWorkFormValues) => void;
}

export function DailyWorkDialog({
  open,
  mode,
  dailyWork,
  projects,
  contractors,
  equipment,
  tasks,
  onClose,
  onSubmit,
}: DailyWorkDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
  } = useForm<DailyWorkFormValues>({
    resolver: zodResolver(dailyWorkSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      projectId: "",
      contractorId: "",
      equipmentId: "",
      temporaryEquipmentName: "",
      hourRate: 0,
      workingHours: 0,
      fuelConsumption: 0,
      taskId: "",
      cost: 0,
      deduction: 0,
      deductionReason: "",
      notes: "",
    },
  });

  const [contractorId] = watch(["contractorId"]);
  const [equipmentId] = watch(["equipmentId"]);
  const [workingHours] = watch(["workingHours"]);
  const [hourRate] = watch(["hourRate"]);

  const selectedContractor = useMemo(
    () => contractors.find((item) => item.id === contractorId),
    [contractors, contractorId],
  );

  const selectedEquipment = useMemo(
    () => equipment.find((item) => item.id === equipmentId),
    [equipment, equipmentId],
  );

  const equipmentOptions = useMemo(
    () =>
      equipment
        .filter((item) => item.contractorId === contractorId)
        .map((item) => ({
          value: item.id,
          label: `${item.equipmentNumber || item.model || item.id}`,
        })),
    [equipment, contractorId],
  );

  const projectOptions = useMemo(
    () =>
      projects.map((item) => ({ value: item.id, label: item.name })),
    [projects],
  );

  const contractorOptions = useMemo(
    () =>
      contractors.map((item) => ({ value: item.id, label: item.name })),
    [contractors],
  );

  const taskOptions = useMemo(
    () =>
      tasks.map((item) => ({
        value: item.id,
        label: isArabic ? item.nameAr : item.nameEn,
      })),
    [tasks, isArabic],
  );

  useEffect(() => {
    reset({
      date: dailyWork?.date ?? new Date().toISOString().split("T")[0],
      projectId: dailyWork?.projectId ?? "",
      contractorId: dailyWork?.contractorId ?? "",
      equipmentId: dailyWork?.equipmentId ?? "",
      temporaryEquipmentName: dailyWork?.temporaryEquipmentName ?? "",
      hourRate: dailyWork?.hourRate ?? 0,
      workingHours: dailyWork?.workingHours ?? 0,
      fuelConsumption: dailyWork?.fuelConsumption ?? 0,
      taskId: dailyWork?.taskId ?? "",
      cost: dailyWork?.cost ?? 0,
      deduction: dailyWork?.deduction ?? 0,
      deductionReason: dailyWork?.deductionReason ?? "",
      notes: dailyWork?.notes ?? "",
    });
  }, [dailyWork, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedContractor?.isSystem) {
      setValue("equipmentId", "");
      return;
    }

    setValue("temporaryEquipmentName", "");
    if (selectedEquipment) {
      setValue("hourRate", selectedEquipment.hourRate ?? 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue("hourRate", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedContractor?.isSystem, selectedEquipment, open, setValue]);

  useEffect(() => {
    const hours = Number(workingHours) || 0;
    const rate = Number(hourRate) || 0;
    setValue("cost", Math.round(hours * rate * 100) / 100, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [workingHours, hourRate, setValue]);

  const handleFormSubmit = (values: DailyWorkFormValues) => {
    if (!selectedContractor) {
      setError("contractorId", { type: "manual", message: t("contractorRequired") });
      return;
    }

    if (selectedContractor.isSystem) {
      if (!values.temporaryEquipmentName?.trim()) {
        setError("temporaryEquipmentName", {
          type: "manual",
          message: t("temporaryEquipmentNameRequired"),
        });
        return;
      }
    } else {
      if (!values.equipmentId) {
        setError("equipmentId", {
          type: "manual",
          message: t("equipmentRequired"),
        });
        return;
      }
    }

    onSubmit(values);
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? t("addDailyWork") : t("editDailyWork")}
      </DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8, direction: isArabic ? "rtl" : "ltr" }}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <AppDatePicker
                label={t("date")}
                value={field.value ? dayjs(field.value) : null}
                onChange={(value) => field.onChange(value ? value.format("YYYY-MM-DD") : "")}
                format="DD/MM/YYYY"
                disabled={false}
              />
            )}
          />

          <Controller
            name="projectId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("project")}
                required
                options={projectOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={t("selectProject")}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="contractorId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("contractor")}
                required
                options={contractorOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={t("selectContractor")}
                error={fieldState.error?.message}
              />
            )}
          />

          {!selectedContractor?.isSystem && (
            <Controller
              name="equipmentId"
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("equipment")}
                  required
                  options={equipmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("selectEquipment")}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}

          <Controller
            name="taskId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("task")}
                required
                options={taskOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={t("selectTask")}
                error={fieldState.error?.message}
              />
            )}
          />

          {selectedContractor?.isSystem && (
            <Controller
              name="temporaryEquipmentName"
              control={control}
              render={({ field, fieldState }) => (
                <AppInput
                  label={t("temporaryEquipmentName")}
                  required
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}

          <Controller
            name="hourRate"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("hourRate")}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                InputProps={{ readOnly: !selectedContractor?.isSystem && Boolean(selectedEquipment) }}
              />
            )}
          />

          <Controller
            name="workingHours"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("workingHours")}
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="cost"
            control={control}
            render={({ field }) => (
              <AppInput
                label={t("cost")}
                type="number"
                {...field}
                InputProps={{ readOnly: true }}
              />
            )}
          />

          <Controller
            name="deduction"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("deduction")}
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="deductionReason"
            control={control}
            render={({ field }) => (
              <AppInput
                label={t("deductionReason")}
                {...field}
              />
            )}
          />

          <Controller
            name="fuelConsumption"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("fuelConsumption")}
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <AppInput
                label={t("notes")}
                multiline
                minRows={3}
                {...field}
              />
            )}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>

        <AppButton loading={false} onClick={handleSubmit(handleFormSubmit)}>
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
