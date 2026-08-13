import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { TaskTable } from "../components/TaskTable";
import { TaskDialog } from "../components/TaskDialog";
import { taskService } from "../services/task.service";
import type { Task, TaskFormValues } from "../types";
import { AddTask } from "@mui/icons-material";

export function TaskPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    async function loadData() {
      const data = await taskService.getAll();
      setTasks(data);
    }

    loadData();
  }, []);



  const handleOpenCreate = () => {
    setMode("create");
    setSelectedTask(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (task: Task) => {
    setMode("edit");
    setSelectedTask(task);
    dialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedTask(undefined);
  };

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      if (mode === "edit" && selectedTask) {
        const updated = await taskService.update(selectedTask.id, values);

        if (updated) {
          setTasks((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await taskService.create(values);
        setTasks((current) => [created, ...current]);
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
      if (!selectedTask) {
        return;
      }

      await taskService.delete(selectedTask.id);
      setTasks((current) =>
        current.filter((item) => item.id !== selectedTask.id),
      );
      notify.success(t("deletedSuccessfully"));
      deleteDialog.closeDialog();
      setSelectedTask(undefined);
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
          title={t("tasks")}
          description={t("tasksDescription")}
          actions={
            <>
              <AppButton variant="contained" startIcon={<AddTask />} onClick={handleOpenCreate}>
                {t("addTask")}
              </AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <TaskTable
            rows={tasks}
            onEdit={handleOpenEdit}
            onDelete={(task) => {
              setSelectedTask(task);
              deleteDialog.openDialog();
            }}
          />
        </AppCard>
      </Box>

      <TaskDialog
        open={dialog.open}
        mode={mode}
        task={selectedTask}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteTask")}
        message={
          <>
            {t("deleteTask")}
            <strong>{` ${selectedTask?.name} ?`}</strong>
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
