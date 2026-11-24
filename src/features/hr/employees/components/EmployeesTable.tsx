import { memo, useMemo, useState } from "react";
import {
  Box,
  Chip,
  ClickAwayListener,
  Stack,
  Tooltip,
  Typography,
  type Theme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { TablePaginationProps } from "@/types";
import type { Employee, EmployeeProject } from "../types";

const MAX_VISIBLE_PROJECTS = 2;

const SALARY_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const PROJECTS_WRAPPER_SX = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 0.75,
  py: 1,
  width: "100%",
} as const;

const SALARY_TEXT_SX = {
  direction: "ltr",
  fontVariantNumeric: "tabular-nums",
} as const;

const getProjectChipSx = (theme: Theme) => ({
  height: 24,
  fontSize: "0.75rem",
  fontWeight: 500,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "& .MuiChip-label": {
    px: 1,
  },
});

const getMoreChipSx = (theme: Theme) => ({
  height: 24,
  fontSize: "0.75rem",
  fontWeight: 600,
  borderRadius: 1.5,
  cursor: "pointer",
  direction: "ltr",
  bgcolor: alpha(theme.palette.primary.main, 0.16),
  color: theme.palette.primary.dark,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
  "&:hover": {
    bgcolor: alpha(theme.palette.primary.main, 0.24),
  },
  "& .MuiChip-label": {
    px: 0.9,
  },
});

interface EmployeeProjectsCellProps {
  projects: EmployeeProject[];
  emptyLabel: string;
}

const EmployeeProjectsCell = memo(function EmployeeProjectsCell({
  projects,
  emptyLabel,
}: EmployeeProjectsCellProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (projects.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  const visibleProjects = projects.slice(0, MAX_VISIBLE_PROJECTS);
  const remainingCount = projects.length - MAX_VISIBLE_PROJECTS;

  return (
    <Box sx={PROJECTS_WRAPPER_SX}>
      {visibleProjects.map((project) => (
        <Chip
          key={project.id}
          size="small"
          label={project.name}
          sx={getProjectChipSx}
        />
      ))}

      {remainingCount > 0 ? (
        <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
          <Box sx={{ display: "inline-flex" }}>
            <Tooltip
              open={tooltipOpen}
              onClose={() => setTooltipOpen(false)}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              arrow
              placement="top"
              title={
                <Stack spacing={0.5} sx={{ py: 0.25 }}>
                  {projects.map((project) => (
                    <Typography
                      key={project.id}
                      variant="caption"
                      sx={{ display: "block", color: "inherit" }}
                    >
                      • {project.name}
                    </Typography>
                  ))}
                </Stack>
              }
            >
              <Chip
                size="small"
                label={`+${remainingCount}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setTooltipOpen((prev) => !prev);
                }}
                sx={getMoreChipSx}
              />
            </Tooltip>
          </Box>
        </ClickAwayListener>
      ) : null}
    </Box>
  );
});

interface EmployeesTableProps {
  rows: Employee[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  canView: boolean;
  canManage: boolean;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

const EMPTY_PROJECTS: EmployeeProject[] = [];
const getAutoRowHeight = () => "auto" as const;

export const EmployeesTable = memo(function EmployeesTable({
  rows,
  loading = false,
  pagination,
  canView,
  canManage,
  onView,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "id",
        headerName: t("hr:employeeCode"),
        width: 100,
        renderCell: ({ row }: { row: Employee }) => (
          <Typography variant="body2" fontWeight={600} sx={SALARY_TEXT_SX}>
            {row.id}
          </Typography>
        ),
      },
      {
        field: "name",
        headerName: t("hr:employeeName"),
        flex: 1.2,
        minWidth: 160,
      },
      {
        field: "phone",
        headerName: t("hr:employeePhone"),
        flex: 0.9,
        minWidth: 130,
      },
      {
        field: "jobTitle",
        headerName: t("hr:jobTitle"),
        flex: 1,
        minWidth: 140,
        renderCell: ({ row }: { row: Employee }) => (
          <Typography
            variant="body2"
            color={row.jobTitle ? "text.primary" : "text.secondary"}
          >
            {row.jobTitle || "—"}
          </Typography>
        ),
      },
      {
        field: "projectIds",
        headerName: t("hr:assignedProjects"),
        flex: 2,
        minWidth: 280,
        sortable: false,
        renderCell: ({ row }: { row: Employee }) => (
          <EmployeeProjectsCell
            projects={row.projects ?? EMPTY_PROJECTS}
            emptyLabel={t("hr:noProjectsAssigned")}
          />
        ),
      },
      {
        field: "basicSalary",
        headerName: t("hr:basicSalary"),
        flex: 0.8,
        minWidth: 120,
        renderCell: ({ row }: { row: Employee }) => (
          <Typography variant="body2" fontWeight={600} sx={SALARY_TEXT_SX}>
            {SALARY_FORMATTER.format(row.basicSalary)}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: t("common:status"),
        flex: 0.8,
        minWidth: 110,
        renderCell: ({ row }: { row: Employee }) => (
          <AppBadge
            label={t(
              row.status === "ACTIVE" ? "common:active" : "common:inactive",
            )}
            color={row.status === "ACTIVE" ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: t("common:actions"),
        sortable: false,
        filterable: false,
        width: 130,
        renderCell: ({ row }: { row: Employee }) => (
          <AppActions
            onView={canView && onView ? () => onView(row) : undefined}
            onEdit={canManage && onEdit ? () => onEdit(row) : undefined}
            onDelete={canManage && onDelete ? () => onDelete(row) : undefined}
            viewTooltip={t("hr:viewEmployee")}
            editTooltip={t("hr:editEmployee")}
            deleteTooltip={t("hr:deleteEmployee")}
          />
        ),
      },
    ],
    [t, canView, canManage, onView, onEdit, onDelete],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
      getRowHeight={getAutoRowHeight}
      emptyMessage={t("hr:noEmployeesFound")}
    />
  );
});
