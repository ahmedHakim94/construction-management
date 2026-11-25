import { useMemo } from "react";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog, DialogLoadingOverlay } from "@/components/ui";
import { useInitialEditLoading } from "@/hooks/useInitialEditLoading";
import { useGetProjectsQuery } from "@/features/settings/projects/services/projects.api";
import { useGetAllTasksQuery } from "@/features/settings/task/services/task.api";
import {
  useGetAllContractorsQuery,
  useGetContractorByIdQuery,
  useGetExternalContractorsQuery,
} from "@/features/contractors/services/contractors.api";
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
  contractors: _contractors,
  equipment,
  tasks: _tasks,
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
    projectId,
  } = useDailyWorkForm({
    open,
    dailyWork,
    onSubmit,
  });

  const isEdit = mode === "edit";
  const editIsExternal = Boolean(Number(dailyWork?.isExternal));
  const editProjectId = dailyWork?.projectId ? Number(dailyWork.projectId) : 0;
  const editContractorId =
    !editIsExternal && dailyWork?.contractorId
      ? Number(dailyWork.contractorId)
      : 0;

  // Subscribe to the same RTK Query cache keys in Edit mode (deduplicated — zero extra requests)
  const projectsQuery = useGetProjectsQuery(undefined, {
    skip: !open || !isEdit,
  });
  const tasksQuery = useGetAllTasksQuery(undefined, {
    skip: !open || !isEdit,
  });
  const contractorsQuery = useGetAllContractorsQuery(
    (editProjectId || undefined) as any,
    {
      skip: !open || !isEdit || !editProjectId || editIsExternal,
    },
  );
  const contractorByIdQuery = useGetContractorByIdQuery(
    {
      contractorId: editContractorId,
      projectId: editProjectId || undefined,
    },
    {
      skip:
        !open ||
        !isEdit ||
        !editContractorId ||
        !editProjectId ||
        editIsExternal,
    },
  );
  const externalContractorsQuery = useGetExternalContractorsQuery(undefined, {
    skip: !open || !isEdit || !editIsExternal,
  });

  const isEditFetching =
    projectsQuery.isFetching ||
    tasksQuery.isFetching ||
    contractorsQuery.isFetching ||
    contractorByIdQuery.isFetching ||
    externalContractorsQuery.isFetching;

  const isEditDataReady =
    Boolean(projectsQuery.data) &&
    Boolean(tasksQuery.data) &&
    (editIsExternal
      ? Boolean(externalContractorsQuery.data)
      : (!editProjectId || Boolean(contractorsQuery.data)) &&
        (!editContractorId ||
          !editProjectId ||
          Boolean(contractorByIdQuery.data)));

  const hasEditError =
    projectsQuery.isError ||
    tasksQuery.isError ||
    contractorsQuery.isError ||
    contractorByIdQuery.isError ||
    externalContractorsQuery.isError;

  const isInitialEditLoading = useInitialEditLoading({
    open,
    isEdit,
    recordKey: dailyWork?.id,
    isFetching: isEditFetching,
    isReady: isEditDataReady,
    hasError: hasEditError,
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

      <DialogContent
        sx={{
          position: "relative",
          minHeight: isInitialEditLoading ? 280 : undefined,
        }}
      >
        <DialogLoadingOverlay loading={isInitialEditLoading} />

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
          <ProjectField control={control} open={open} />

          <DailyWorkContractorFields
            open={open}
            control={control}
            setValue={setValue}
            clearErrors={clearErrors}
            contractorId={contractorId}
            isExternal={isExternal}
            projectId={projectId}
          />

          <DailyWorkDetailsFields
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
          disabled={isInitialEditLoading}
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
