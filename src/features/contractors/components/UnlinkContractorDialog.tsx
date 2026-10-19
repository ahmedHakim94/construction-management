import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/app/store/hooks";
import {
  useUnlinkContractorMutation,
  useGetContractorProjectsQuery,
} from "../services/contractors.api";

type Props = {
  open: boolean;
  contractor?: { id: number; name: string };
  onClose: () => void;
  onSuccess?: () => void;
};

export default function UnlinkContractorDialog({
  open,
  contractor,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const role = useAppSelector((state) => state.auth.user?.role);
  const isSuperAdmin = role === "super_admin";

  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  const {
    data: projects = [],
    isLoading,
    isError,
  } = useGetContractorProjectsQuery(contractor?.id ?? 0, {
    skip: !open || !contractor || !isSuperAdmin,
  });

  const [unlinkContractor, { isLoading: isUnlinking }] =
    useUnlinkContractorMutation();

  useEffect(() => {
    setSelectedProjects([]);
  }, [contractor?.id, open]);

  const allSelected =
    projects.length > 0 && selectedProjects.length === projects.length;

  const toggleProject = (id: number) => {
    setSelectedProjects((current) =>
      current.includes(id)
        ? current.filter((projectId) => projectId !== id)
        : [...current, id],
    );
  };

  const handleUnlink = async () => {
    if (!contractor || (isSuperAdmin && selectedProjects.length === 0)) {
      return;
    }

    try {
      await unlinkContractor({
        contractorId: contractor.id,
        ...(isSuperAdmin && { project_ids: selectedProjects }),
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to unlink contractor:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isUnlinking ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t("unlinkContractor")}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography>
            {t("unlinkContractorMessage")} <strong>{contractor?.name}</strong>؟
          </Typography>

          {isSuperAdmin ? (
            <>
              <Typography variant="subtitle2">
                {t("selectProjectsToUnlink")}
              </Typography>

              {isLoading ? (
                <CircularProgress size={24} />
              ) : isError ? (
                <Typography color="error">
                  {t("failedToLoadProjects")}
                </Typography>
              ) : projects.length === 0 ? (
                <Typography color="text.secondary">
                  {t("noLinkedProjects")}
                </Typography>
              ) : (
                <Box>
                  <FormControlLabel
                    label={t("selectAll")}
                    control={
                      <Checkbox
                        checked={allSelected}
                        indeterminate={
                          selectedProjects.length > 0 && !allSelected
                        }
                        onChange={(event) =>
                          setSelectedProjects(
                            event.target.checked
                              ? projects.map((project) => project.id)
                              : [],
                          )
                        }
                      />
                    }
                  />

                  <Stack sx={{ pl: 2 }}>
                    {projects.map((project) => (
                      <FormControlLabel
                        key={project.id}
                        label={project.name}
                        control={
                          <Checkbox
                            checked={selectedProjects.includes(project.id)}
                            onChange={() => toggleProject(project.id)}
                          />
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            <Typography color="text.secondary">
              {t("unlinkFromCurrentProject")}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isUnlinking}>
          {t("cancel")}
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={handleUnlink}
          disabled={
            isUnlinking ||
            (isSuperAdmin &&
              (isLoading || isError || selectedProjects.length === 0))
          }
        >
          {isUnlinking ? t("loading") : t("unlink")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
