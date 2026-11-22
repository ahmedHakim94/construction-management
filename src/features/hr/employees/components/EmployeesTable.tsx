import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  ClickAwayListener,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { Employee, EmployeeProject } from "../types";

const MAX_VISIBLE_PROJECTS = 2;

interface EmployeeProjectsCellProps {
  projectIds: number[];
  projectNameById: Map<number, string>;
  emptyLabel: string;
}

function EmployeeProjectsCell({
  projectIds,
  projectNameById,
  emptyLabel,
}: EmployeeProjectsCellProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!projectIds.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  const visibleProjectIds = projectIds.slice(0, MAX_VISIBLE_PROJECTS);
  const remainingCount = projectIds.length - MAX_VISIBLE_PROJECTS;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.75,
        py: 1,
        width: "100%",
      }}
    >
      {visibleProjectIds.map((projectId) => (
        <Chip
          key={projectId}
          size="small"
          label={projectNameById.get(projectId) ?? `#${projectId}`}
          sx={(theme) => ({
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
          })}
        />
      ))}

      {remainingCount > 0 && (
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
                  {projectIds.map((projectId) => (
                    <Typography
                      key={projectId}
                      variant="caption"
                      sx={{ display: "block", color: "inherit" }}
                    >
                      • {projectNameById.get(projectId) ?? `#${projectId}`}
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
                sx={(theme) => ({
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
                })}
              />
            </Tooltip>
          </Box>
        </ClickAwayListener>
      )}
    </Box>
  );
}

interface EmployeesTableProps {
  rows: Employee[];
  projects: EmployeeProject[];
  canView: boolean;
  canManage: boolean;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeesTable({
  rows,
  projects,
  canView,
  canManage,
  onView,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const salaryFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  );

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "code",
        headerName: t("hr:employeeCode"),
        width: 120,
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
        minWidth: 150,
      },
      {
        field: "projectIds",
        headerName: t("hr:assignedProjects"),
        flex: 2,
        minWidth: 280,
        sortable: false,
        renderCell: ({ row }: { row: Employee }) => (
          <EmployeeProjectsCell
            projectIds={row.projectIds}
            projectNameById={projectNameById}
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
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {salaryFormatter.format(row.basicSalary)}
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
    [
      t,
      projectNameById,
      salaryFormatter,
      canView,
      canManage,
      onView,
      onEdit,
      onDelete,
    ],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      getRowHeight={() => "auto"}
      showPagination
      emptyMessage={t("hr:noEmployeesFound")}
    />
  );
}
