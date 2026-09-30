import { useState } from "react";
import { Box } from "@mui/material";
import { AddBusiness } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { ProjectTable } from "../components/ProjectTable";
import { ProjectDialog } from "../components/ProjectDialog";
import type { Project, ProjectFormValues } from "../types";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "../services/projects.api";

const LIMIT = 3;

export function ProjectPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const { data, isLoading, isFetching } = useGetProjectsQuery({
    page,
    limit: LIMIT,
  });
  const [addProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const projects = data?.data ?? [];
  const paginationMeta = data?.pagination;

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedProject(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (project: Project) => {
    setMode("edit");
    setSelectedProject(project);
    dialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedProject(undefined);
  };

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      if (mode === "edit" && selectedProject) {
        await updateProject({ id: selectedProject.id, data: values }).unwrap();
        notify.success(t("updatedSuccessfully"));
      } else {
        await addProject(values).unwrap();
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
      if (!selectedProject) {
        return;
      }

      await deleteProject(selectedProject.id).unwrap();
      notify.success(t("deletedSuccessfully"));
      if (projects.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
      deleteDialog.closeDialog();
      setSelectedProject(undefined);
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
          title={t("projects")}
          description={t("projectsDescription")}
          actions={
            <>
              <AppButton
                variant="contained"
                startIcon={<AddBusiness />}
                onClick={handleOpenCreate}
              >
                {t("addProject")}
              </AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <ProjectTable
            rows={projects}
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
            onDelete={(project) => {
              setSelectedProject(project);
              deleteDialog.openDialog();
            }}
          />
        </AppCard>
      </Box>

      <ProjectDialog
        open={dialog.open}
        mode={mode}
        project={selectedProject}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteProject")}
        message={
          <>
            {t("deleteProject")}
            <strong>{` ${selectedProject?.name} ?`}</strong>
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
