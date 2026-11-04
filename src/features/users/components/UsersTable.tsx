import { useMemo } from "react";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { useAppSelector } from "@/app/store/hooks";
import type { TablePaginationProps } from "@/types";
import { USER_ROLE_COLORS, USER_STATUS_COLORS } from "../constants";
import type { User, UserRole } from "../types";
import {
  canChangeUserStatus,
  canDeleteUser,
  canManageUser,
} from "../utils/userAccess";

interface UsersTableProps {
  rows: User[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  onEdit?: (user: User) => void;
  onActivate?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UsersTable({
  rows,
  loading = false,
  pagination,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: UsersTableProps) {
  const { t } = useTranslation();
  const actor = useAppSelector((state) => state.auth.user);

  const roleLabelMap: Record<UserRole, string> = useMemo(
    () => ({
      super_admin: t("roleSuperAdmin"),
      admin: t("roleAdmin"),
      user: t("roleUser"),
    }),
    [t],
  );

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("userName"),
        flex: 1.2,
        minWidth: 160,
      },
      {
        field: "email",
        headerName: t("email"),
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "role",
        headerName: t("role"),
        flex: 1,
        minWidth: 130,
        renderCell: ({ row }: { row: User }) => (
          <AppBadge
            label={roleLabelMap[row.role] ?? row.role}
            color={USER_ROLE_COLORS[row.role] ?? "default"}
            size="small"
          />
        ),
      },
      {
        field: "projectId",
        headerName: t("project"),
        flex: 1.3,
        minWidth: 170,
        renderCell: ({ row }: { row: User }) => {
          if (row.role === "super_admin" || row.projectId === null) {
            return (
              <Typography variant="body2" color="text.secondary">
                {t("noProjectAssigned", { defaultValue: "—" })}
              </Typography>
            );
          }

          return (
            <Typography variant="body2">
              {row.projectName || "—"}
            </Typography>
          );
        },
      },
      {
        field: "status",
        headerName: t("status"),
        flex: 0.9,
        minWidth: 120,
        renderCell: ({ row }: { row: User }) => (
          <AppBadge
            label={t(row.status === "ACTIVE" ? "active" : "inactive")}
            color={USER_STATUS_COLORS[row.status] ?? "default"}
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 1,
        minWidth: 130,
        renderCell: ({ row }: { row: User }) => {
          const canEdit = actor ? canManageUser(actor, row) : false;
          const canChangeStatus = actor ? canChangeUserStatus(actor, row) : false;
          const canDelete = actor ? canDeleteUser(actor, row) : false;

          return (
            <AppActions
              onEdit={canEdit && onEdit ? () => onEdit(row) : undefined}
              onActivate={
                canChangeStatus && row.status === "INACTIVE" && onActivate
                  ? () => onActivate(row)
                  : undefined
              }
              onDeactivate={
                canChangeStatus && row.status === "ACTIVE" && onDeactivate
                  ? () => onDeactivate(row)
                  : undefined
              }
              onDelete={canDelete && onDelete ? () => onDelete(row) : undefined}
              editTooltip={t("editUser")}
              activateTooltip={t("activateUser")}
              deactivateTooltip={t("deactivateUser")}
              deleteTooltip={t("deleteUser")}
            />
          );
        },
      },
    ],
    [t, actor, roleLabelMap, onEdit, onActivate, onDeactivate, onDelete],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
      emptyMessage={t("noUsersFound")}
    />
  );
}
