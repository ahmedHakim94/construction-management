import { useMemo } from "react";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import type { CreateDailyWorkPayload, DailyWorkFormValues } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { Equipment } from "@/features/equipment/types";
import type { Project } from "@/features/settings/projects/types";
import type { Task } from "@/features/settings/task/types";
import { useDailyWorkForm } from "../hooks/useDailyWorkForm";
import { DailyWorkContractorFields } from "./DailyWorkContractorFields";
import { DailyWorkDetailsFields } from "./DailyWorkDetailsFields";
import ProjectField from "./ProjectField";
import CreateDateField from "./CreateDateField";
interface DailyWorkDialogProps {
  open: boolean;
  mode: "create" | "edit";

  dailyWork?: DailyWorkFormValues & {
    id: number;
    createdAt: string;
  };

  projects: Project[];
  contractors: Contractor[];
  equipment: Equipment[];
  tasks: Task[];

  onClose: () => void;
  onSubmit: (values: CreateDailyWorkPayload) => Promise<void>;
}

export function DailyWorkDialog({
  open,
  mode,
  dailyWork,
  contractors,
  equipment,
  tasks,
  onClose,
  onSubmit,
}: DailyWorkDialogProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    loading,
    isArabic,
    contractorId,
    isExternal,
    equipmentId,
    workingDuration,
    handleFormSubmit,
  } = useDailyWorkForm({
    open,
    dailyWork,
    onSubmit,
  });

  const selectedEquipment = useMemo(
    () => equipment.find((item) => item.id === Number(equipmentId)),
    [equipment, equipmentId],
  );

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
          {/* Date */}
          <CreateDateField control={control} />

          {/* Project */}
          <ProjectField control={control} />

          <DailyWorkContractorFields
            open={open}
            contractors={contractors}
            equipment={equipment}
            control={control}
            setValue={setValue}
            clearErrors={clearErrors}
            contractorId={contractorId}
            isExternal={isExternal}
          />

          <DailyWorkDetailsFields
            // tasks={tasks}
            control={control}
            isExternal={isExternal}
            workingDuration={workingDuration}
            selectedEquipment={selectedEquipment}
            open={open}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <AppButton
          loading={loading}
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
        >
          {mode === "create" ? t("create") : t("save")}
        </AppButton>

        <AppButton variant="outlined" color="inherit" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
