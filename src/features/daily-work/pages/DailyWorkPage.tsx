import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Today } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { DailyWorkTable } from "../components/DailyWorkTable";
import { DailyWorkDialog } from "../components/DailyWorkDialog";
import { dailyWorkService } from "../services/dailyWork.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { projectService } from "@/features/settings/projects/services/project.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import { taskService } from "@/features/settings/task/services/task.service";
import type { DailyWork, DailyWorkFormValues } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { Project } from "@/features/settings/projects/types";
import type { Equipment } from "@/features/equipment/types";
import type { Task } from "@/features/settings/task/types";
import { AppFilters } from "@/components/ui/AppFilters";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import type { Dayjs } from "dayjs";
import { hasPaidPaymentForDailyWork } from "@/features/payments/services/payment.service";

export function DailyWorkPage() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<DailyWork[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<DailyWork | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    async function loadData() {
      const [recordData, projectData, contractorData, equipmentData, taskData] =
        await Promise.all([
          dailyWorkService.getAll(),
          projectService.getAll(),
          contractorService.getAll(),
          equipmentService.getAll(),
          taskService.getAll(),
        ]);

      setRecords(recordData);
      setProjects(projectData);
      setContractors(contractorData);
      setEquipment(equipmentData);
      setTasks(taskData);
    }

    loadData();
  }, []);

  const displayRows = useMemo(() => {
    return records.map((item) => ({
      ...item,
      projectName:
        projects.find((project) => project.id === item.projectId)?.name ?? "",
      contractorName:
        contractors.find((contractor) => contractor.id === item.contractorId)
          ?.name ?? "",
      equipmentLabel: item.equipmentId
        ? (equipment.find((eq) => eq.id === item.equipmentId)?.name ?? "")
        : (item.temporaryEquipmentName ?? ""),
      taskName: tasks.find((task) => task.id === item.taskId)?.name ?? "",
    }));
  }, [records, projects, contractors, equipment, tasks]);

  // const filteredRecords = useMemo(() => {
  //   const term = search.trim().toLowerCase();

  //   if (!term) {
  //     return displayRows;
  //   }

  //   return displayRows.filter((item) => {
  //     const values = [item.projectName, item.contractorName, item.equipmentLabel, item.taskName];
  //     return values.some((value) => value.toLowerCase().includes(term));
  //   });
  // }, [displayRows, search]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return displayRows.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.projectName,
          item.contractorName,
          item.equipmentLabel,
          item.taskName,
        ].some((value) => value.toLowerCase().includes(term));

      const matchesDate =
        !selectedDate || item.date === selectedDate.format("YYYY-MM-DD");

      return matchesSearch && matchesDate;
    });
  }, [displayRows, search, selectedDate]);

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedRecord(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (record: DailyWork) => {
    setMode("edit");
    setSelectedRecord(record);
    dialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedRecord(undefined);
  };

  const handleSubmit = async (values: DailyWorkFormValues) => {
    try {
      if (mode === "edit" && selectedRecord) {
        const updated = await dailyWorkService.update(
          selectedRecord.id,
          values,
        );

        if (updated) {
          setRecords((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await dailyWorkService.create(values);
        setRecords((current) => [created, ...current]);
        notify.success(t("createdSuccessfully"));
      }

      handleCloseDialog();
    } catch {
      notify.error(t("somethingWentWrong"));
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      if (!selectedRecord) {
        return;
      }

      const hasPaidPayment = await hasPaidPaymentForDailyWork(selectedRecord);

      if (hasPaidPayment) {
        notify.error(t("cannotDeleteDailyWorkWithPayment"));
        return;
      }

      await dailyWorkService.delete(selectedRecord.id);
      setRecords((current) =>
        current.filter((item) => item.id !== selectedRecord.id),
      );
      notify.success(t("deletedSuccessfully"));
      deleteDialog.closeDialog();
      setSelectedRecord(undefined);
    } catch {
      notify.error(t("somethingWentWrong"));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("dailyWork")}
          description={t("dailyWorkDescription")}
          actions={
            <>
              {/* <AppSearchInput value={search} onChange={setSearch} placeholder={t("searchDailyWork")} /> */}
              <AppButton startIcon={<Today />} onClick={handleOpenCreate}>
                {t("addDailyWork")}
              </AppButton>
            </>
          }
        />

        <AppFilters>
          <AppSearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("searchDailyWork")}
          />
          <AppDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            label={t("date")}
          />
        </AppFilters>

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <DailyWorkTable
            rows={filteredRecords}
            onEdit={handleOpenEdit}
            onDelete={(record) => {
              setSelectedRecord(record);
              deleteDialog.openDialog();
            }}
          />
        </AppCard>
      </Box>

      <DailyWorkDialog
        open={dialog.open}
        mode={mode}
        dailyWork={selectedRecord}
        projects={projects}
        contractors={contractors}
        equipment={equipment}
        tasks={tasks}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteDailyWork")}
        message={
          <>
            {t("deleteDailyWork")}
            <strong>{` ${selectedRecord?.projectId ?? ""} ?`}</strong>
          </>
        }
        confirmText={t("delete")}
        onClose={deleteDialog.closeDialog}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </PageContainer>
  );
}
