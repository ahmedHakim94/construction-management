import { useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { TaskTable } from "../components/TaskTable";
import { TaskDialog } from "../components/TaskDialog";
import type { Task, TaskFormValues } from "../types";
import { AddTask } from "@mui/icons-material";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "../services/task.api";

const LIMIT = 10;

export function TaskPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const { data, isLoading, isFetching } = useGetTasksQuery({
    page,
    limit: LIMIT,
  });
  const [addTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasks = data?.data ?? [];
  const paginationMeta = data?.pagination;

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
        await updateTask({
          id: selectedTask.id,
          data: values,
        }).unwrap();
        notify.success(t("updatedSuccessfully"));
      } else {
        await addTask(values).unwrap();
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
      await deleteTask(selectedTask.id).unwrap();
      notify.success(t("deletedSuccessfully"));
      if (tasks.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
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
              <AppButton
                variant="contained"
                startIcon={<AddTask />}
                onClick={handleOpenCreate}
              >
                {t("addTask")}
              </AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <TaskTable
            rows={tasks}
            loading={isLoading || isFetching}
            pagination={
              paginationMeta
                ? {
                    page,
                    limit: LIMIT,
                    total: paginationMeta.total,
                    totalPages: paginationMeta.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
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
