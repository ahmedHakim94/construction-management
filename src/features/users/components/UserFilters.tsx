import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AppSelect, type SelectOption } from "@/components/ui/AppSelect";
import type { UserFilters as UserFiltersType } from "../types";

interface UserFiltersProps {
  control: Control<UserFiltersType>;
  isSuperAdmin: boolean;
  roleOptions: readonly SelectOption[];
  projectOptions: readonly SelectOption[];
  statusOptions: readonly SelectOption[];
  onReset: () => void;
}

export function UserFilters({
  control,
  isSuperAdmin,
  roleOptions,
  projectOptions,
  statusOptions,
  onReset,
}: UserFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isSuperAdmin
          ? {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "minmax(0, 1.5fr) repeat(3, minmax(0, 1fr)) auto",
            }
          : {
              xs: "1fr",
              sm: "minmax(0, 2fr) minmax(0, 1fr) auto",
            },
        alignItems: "end",
        gap: 2,
        width: "100%",
      }}
    >
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={t("searchUsers")}
            placeholder={t("searchUsers")}
            size="small"
            fullWidth
          />
        )}
      />

      {isSuperAdmin && (
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <AppSelect
              label={t("role")}
              options={roleOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={t("selectRole")}
              width="100%"
            />
          )}
        />
      )}

      {isSuperAdmin && (
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <AppSelect
              label={t("project")}
              options={projectOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={t("selectProject")}
              width="100%"
            />
          )}
        />
      )}

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <AppSelect
            label={t("status")}
            options={statusOptions}
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={t("selectStatus")}
            width="100%"
          />
        )}
      />

      <Tooltip title={t("resetFilters")} arrow>
        <IconButton
          type="button"
          onClick={onReset}
          aria-label={t("resetFilters")}
          color="primary"
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            width: 40,
            height: 40,
            justifySelf: { xs: "start", md: "center" },
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <RestartAltIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

