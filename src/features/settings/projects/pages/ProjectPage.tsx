import { useEffect, useState } from "react";
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
import { projectService } from "../services/project.service";
import type { Project, ProjectFormValues } from "../types";

export function ProjectPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    async function loadData() {
      const data = await projectService.getAll();
      setProjects(data);
    }

    loadData();
  }, []);

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
        const updated = await projectService.update(selectedProject.id, values);

        if (updated) {
          setProjects((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await projectService.create(values);
        setProjects((current) => [created, ...current]);
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

      await projectService.delete(selectedProject.id);
      setProjects((current) =>
        current.filter((item) => item.id !== selectedProject.id),
      );
      notify.success(t("deletedSuccessfully"));
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
              <AppButton startIcon={<AddBusiness />} onClick={handleOpenCreate}>{t("addProject")}</AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <ProjectTable
            rows={projects}
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
