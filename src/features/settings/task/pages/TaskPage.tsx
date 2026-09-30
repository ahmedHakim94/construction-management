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

export function TaskPage() {
  const { t } = useTranslation();
  // const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery();
  const [addTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // useEffect(() => {
  //   async function loadData() {
  //     const data = await taskService.getAll();
  //     setTasks(data);
  //   }

  //   loadData();
  // }, []);

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
        notify.success(t("updated Successfully"));
      } else {
        await addTask(values).unwrap();

        notify.success(t("created Successfully"));
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
