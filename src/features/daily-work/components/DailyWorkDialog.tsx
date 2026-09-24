import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { AppButton, AppDialog, AppInput, AppSelect } from "@/components/ui";
import { dailyWorkSchema } from "../schemas/dailyWork.schema";
import type { DailyWorkFormValues } from "../types";
import type { Contractor, ExternalContractor } from "@/features/contractors/types";
import { externalContractorService } from "@/features/contractors/services/externalContractor.service";
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
  onSubmit: (values: DailyWorkFormValues) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [externalContractors, setExternalContractors] = useState<ExternalContractor[]>([]);
  const [isAddingExternal, setIsAddingExternal] = useState(false);
  const [newExternalName, setNewExternalName] = useState("");
  const [creatingExternal, setCreatingExternal] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const { control, handleSubmit, reset, setValue, watch, setError, clearErrors } =
    useForm<DailyWorkFormValues>({
      resolver: zodResolver(dailyWorkSchema),
      defaultValues: {
        date: new Date().toISOString().split("T")[0],
        projectId: "",
        contractorId: "",
        isExternal: false,
        externalContractorId: "",
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

  const [contractorId, isExternal, equipmentId, workingHours, hourRate] =
    watch([
      "contractorId",
      "isExternal",
      "equipmentId",
      "workingHours",
      "hourRate",
    ]);

  useEffect(() => {
    if (open) {
      externalContractorService.getAll().then(setExternalContractors);
      setIsAddingExternal(false);
      setNewExternalName("");
    }
  }, [open]);

  useEffect(() => {
    if (isAddingExternal) {
      clearErrors("externalContractorId");
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAddingExternal, clearErrors]);



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
          label: `${item.name || item.model || item.id}`,
        })),
    [equipment, contractorId],
  );

  const projectOptions = useMemo(
    () => projects.map((item) => ({ value: item.id, label: item.name })),
    [projects],
  );

  const contractorOptions = useMemo(
    () => contractors.map((item) => ({ value: item.id, label: item.name })),
    [contractors],
  );

  const externalContractorOptions = useMemo(
    () =>
      externalContractors.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [externalContractors],
  );

  const taskOptions = useMemo(
    () =>
      tasks.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [tasks],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const isExternal = Boolean(
      dailyWork?.contractorId?.startsWith("external-"),
    );
    const initialExternalContractorId = isExternal
      ? (dailyWork?.contractorId ?? "")
      : "";

    reset({
      date: dailyWork?.date ?? new Date().toISOString().split("T")[0],
      projectId: dailyWork?.projectId ?? "",
      contractorId: isExternal ? "" : (dailyWork?.contractorId ?? ""),
      isExternal,
      externalContractorId: initialExternalContractorId,
      equipmentId: isExternal ? "" : (dailyWork?.equipmentId ?? ""),
      temporaryEquipmentName: isExternal
        ? (dailyWork?.temporaryEquipmentName ?? "")
        : "",
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
    const hours = Number(workingHours) || 0;
    const rate = Number(hourRate) || 0;
    setValue("cost", Math.round(hours * rate * 100) / 100, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [workingHours, hourRate, setValue]);

  const handleCreateExternalContractor = async () => {
    const trimmed = newExternalName.trim();
    if (!trimmed) {
      return;
    }

    setCreatingExternal(true);
    try {
      const created = await externalContractorService.create({ name: trimmed });
      setExternalContractors((prev) => [
        created,
        ...prev.filter((c) => c.id !== created.id),
      ]);
      setValue("externalContractorId", created.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setNewExternalName("");
      setIsAddingExternal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingExternal(false);
    }
  };

  const handleFormSubmit = async (values: DailyWorkFormValues) => {
    if (!values.isExternal) {
      if (!values.contractorId) {
        setError("contractorId", {
          type: "manual",
          message: t("contractorRequired"),
        });
        return;
      }

      if (!values.equipmentId) {
        setError("equipmentId", {
          type: "manual",
          message: t("equipmentRequired"),
        });
        return;
      }
    } else {
      if (!values.externalContractorId) {
        setError("externalContractorId", {
          type: "manual",
          message: t("externalContractorRequired"),
        });
        return;
      }

      if (!values.temporaryEquipmentName?.trim()) {
        setError("temporaryEquipmentName", {
          type: "manual",
          message: t("temporaryEquipmentNameRequired"),
        });
        return;
      }
    }

    setLoading(true);
    try {
      const payload: DailyWorkFormValues = {
        date: values.date,
        projectId: values.projectId,
        contractorId: values.isExternal
          ? values.externalContractorId!
          : values.contractorId!,
        equipmentId: values.isExternal
          ? undefined
          : values.equipmentId || undefined,
        temporaryEquipmentName: values.isExternal
          ? values.temporaryEquipmentName || undefined
          : undefined,
        hourRate: values.hourRate,
        workingHours: values.workingHours,
        fuelConsumption: values.fuelConsumption,
        taskId: values.taskId,
        cost: values.cost,
        deduction: values.deduction,
        deductionReason: values.deductionReason || undefined,
        notes: values.notes || undefined,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <AppDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? t("addDailyWork") : t("editDailyWork")}
      </DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 8,
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <AppDatePicker
                label={t("date")}
                value={field.value ? dayjs(field.value) : null}
                onChange={(value) =>
                  field.onChange(value ? value.format("YYYY-MM-DD") : "")
                }
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
            name="isExternal"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(field.value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      field.onChange(checked);
                      if (checked) {
                        setValue("contractorId", "");
                        setValue("equipmentId", "");
                      } else {
                        setValue("externalContractorId", "");
                        setValue("temporaryEquipmentName", "");
                        setValue("hourRate", 0, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                    color="primary"
                  />
                }
                label={t("externalContractor")}
                sx={{ userSelect: "none" }}
              />
            )}
          />

          {!isExternal ? (
            <>
              <Controller
                name="contractorId"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    label={t("contractor")}
                    required
                    options={contractorOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("equipmentId", "");
                      setValue("hourRate", 0, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    placeholder={t("selectContractor")}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="equipmentId"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    label={t("equipment")}
                    required
                    options={equipmentOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      const eq = equipment.find((item) => item.id === val);
                      if (eq) {
                        setValue("hourRate", eq.hourRate ?? 0, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      } else {
                        setValue("hourRate", 0, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    placeholder={t("selectEquipment")}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </>
          ) : (

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Controller
                name="externalContractorId"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    label={t("externalContractor")}
                    required
                    options={externalContractorOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("selectExternalContractor")}
                    error={
                      isAddingExternal ? undefined : fieldState.error?.message
                    }
                  />
                )}
              />

              {!isAddingExternal ? (
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <AppButton
                    size="small"
                    variant="text"
                    onClick={() => setIsAddingExternal(true)}
                    sx={{ px: 0.5, fontWeight: 600 }}
                  >
                    + {t("addExternalContractor")}
                  </AppButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    p: 2,
                    mt: 0.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "background.paper"
                        : "grey.50",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {t("addExternalContractor")}
                  </Typography>

                  <AppInput
                    inputRef={nameInputRef}
                    autoFocus
                    label={t("externalContractorName")}
                    placeholder={t("externalContractorNamePlaceholder")}
                    value={newExternalName}
                    onChange={(e) => setNewExternalName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newExternalName.trim() && !creatingExternal) {
                          handleCreateExternalContractor();
                        }
                      } else if (e.key === "Escape") {
                        setIsAddingExternal(false);
                        setNewExternalName("");
                      }
                    }}
                    size="small"
                    fullWidth
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <AppButton
                      size="small"
                      variant="contained"
                      loading={creatingExternal}
                      onClick={handleCreateExternalContractor}
                      disabled={!newExternalName.trim()}
                    >
                      {t("add")}
                    </AppButton>
                    <AppButton
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        setIsAddingExternal(false);
                        setNewExternalName("");
                      }}
                    >
                      {t("cancel")}
                    </AppButton>
                  </Box>
                </Box>
              )}


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
            </Box>
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
                InputProps={{
                  readOnly: !isExternal && Boolean(selectedEquipment),
                }}
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
              <AppInput label={t("deductionReason")} {...field} />
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
              <AppInput label={t("notes")} multiline minRows={3} {...field} />
            )}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton
          loading={loading}
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
        >
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}

