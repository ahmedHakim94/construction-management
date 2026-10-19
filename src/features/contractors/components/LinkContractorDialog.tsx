import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/ui";
import { useAppSelector } from "@/app/store/hooks";
import {
  useGetAvailableContractorsQuery,
  useLinkContractorToProjectMutation,
} from "../services/contractors.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import type { Project } from "@/features/settings/projects/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LinkContractorDialog({ open, onClose }: Props) {
  const { t } = useTranslation();
  const role = useAppSelector((state) => state.auth.user?.role);
  const isSuperAdmin = role === "super_admin";

  const [project, setProject] = useState<Project | null>(null);
  const [contractorId, setContractorId] = useState<number | null>(null);

  const { data: projects = [], isFetching: projectsLoading } =
    useGetAllProjectsQuery(undefined, {
      skip: !open || !isSuperAdmin,
    });

  const projectId =
    isSuperAdmin && project ? Number(project.id) : undefined;

  const { data: contractors = [], isFetching } =
    useGetAvailableContractorsQuery(projectId, {
      skip: !open || (isSuperAdmin && !projectId),
    });

  const [linkContractor, { isLoading }] = useLinkContractorToProjectMutation();

  useEffect(() => {
    if (!open) {
      setProject(null);
      setContractorId(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!contractorId || (isSuperAdmin && !projectId)) return;

    try {
      await linkContractor({
        contractor_id: contractorId,
        ...(isSuperAdmin ? { project_id: projectId } : {}),
      }).unwrap();

      onClose();
    } catch (error) {
      console.error("Failed to link contractor:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("linkExistingContractor")}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {isSuperAdmin && (
            <Autocomplete
              options={projects}
              loading={projectsLoading}
              value={project}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                setProject(value);
                setContractorId(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("selectProject")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {projectsLoading && <CircularProgress size={18} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          <Autocomplete
            options={contractors}
            loading={isFetching}
            disabled={isSuperAdmin && !projectId}
            value={contractors.find((item) => item.id === contractorId) ?? null}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => setContractorId(value?.id ?? null)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Box>{option.name}</Box>
                  <Box sx={{ fontSize: 12, color: "text.secondary" }}>
                    {option.phone}
                  </Box>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("selectContractor")}
                placeholder={t("searchContractors")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isFetching && <CircularProgress size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <AppButton variant="outlined" onClick={onClose}>
          {t("cancel")}
        </AppButton>

        <AppButton
          variant="contained"
          disabled={!contractorId || (isSuperAdmin && !projectId)}
          loading={isLoading}
          onClick={handleSubmit}
        >
          {t("linkContractor")}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
