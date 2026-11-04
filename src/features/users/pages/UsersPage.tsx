import { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { PersonAddAlt1Outlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import { UserDialog } from "../components/UserDialog";
import { UserFilters } from "../components/UserFilters";
import { UsersTable } from "../components/UsersTable";
import { USERS_PAGE_LIMIT } from "../constants";
import { useUserFilters } from "../hooks/useUserFilters";
import {
  useChangeUserStatusMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../services/users.api";
import type { User, UserFormValues } from "../types";
import { getAssignableRoles } from "../utils/userAccess";

export function UsersPage() {
  const { t } = useTranslation();
  const actor = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = actor?.role === "super_admin";
  const canCreate = getAssignableRoles(actor).length > 0;

  const [page, setPage] = useState(1);

  // Dialog state
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  const formDialog = useDialog();
  const statusDialog = useDialog();
  const deleteDialog = useDialog();

  // Reset page to 1 whenever an immediate filter changes or search debounce commits
  const handlePageReset = useCallback(() => {
    setPage(1);
  }, []);

  const { control, filters, debouncedSearch, resetFilters } = useUserFilters({
    onImmediateFilterChange: handlePageReset,
    onSearchCommit: handlePageReset,
  });

  // RTK Query: fetch users with pagination, filters, and search
  const {
    data: usersResult,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery(
    {
      page,
      limit: USERS_PAGE_LIMIT,
      search: debouncedSearch,
      role: filters.role || undefined,
      projectId:
        filters.projectId !== "" && filters.projectId !== undefined
          ? Number(filters.projectId)
          : undefined,
      status: filters.status || undefined,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const users = usersResult?.data || [];
  const paginationMeta = usersResult?.pagination || {
    page: 1,
    limit: USERS_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  };

  // RTK Query: fetch real projects for filtering
  const { data: projects = [] } = useGetAllProjectsQuery();

  // RTK Query Mutations
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [changeUserStatus, { isLoading: statusLoading }] =
    useChangeUserStatusMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setPage(1);
  }, [resetFilters]);

  // Options for filter selects
  const roleOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("allRoles") },
      { value: "super_admin", label: t("roleSuperAdmin") },
      { value: "admin", label: t("roleAdmin") },
      { value: "user", label: t("roleUser") },
    ],
    [t],
  );

  const projectOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("allProjects") },
      ...projects.map((project) => ({
        value: Number(project.id),
        label: project.name,
      })),
    ],
    [t, projects],
  );

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("allStatuses") },
      { value: "ACTIVE", label: t("active") },
      { value: "INACTIVE", label: t("inactive") },
    ],
    [t],
  );

  // ---------- Add / Edit ----------

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedUser(undefined);
    formDialog.openDialog();
  };

  const handleEdit = useCallback(
    (user: User) => {
      setMode("edit");
      setSelectedUser(user);
      formDialog.openDialog();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleCloseForm = () => {
    formDialog.closeDialog();
    setSelectedUser(undefined);
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (mode === "edit" && selectedUser) {
        await updateUser({
          id: selectedUser.id,
          data: values,
        }).unwrap();
      } else {
        await createUser(values).unwrap();
      }

      handleCloseForm();
      await refetch();
    } catch (error) {
      console.error("User form submit error:", error);
    }
  };

  // ---------- Activate / Deactivate ----------

  const handleOpenStatus = useCallback(
    (user: User) => {
      setSelectedUser(user);
      statusDialog.openDialog();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleCloseStatus = () => {
    statusDialog.closeDialog();
    setSelectedUser(undefined);
  };

  const handleChangeStatus = async () => {
    if (!selectedUser) return;

    try {
      const nextStatus =
        selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await changeUserStatus({
        id: selectedUser.id,
        status: nextStatus,
      }).unwrap();
      handleCloseStatus();
      await refetch();
    } catch (error) {
      console.error("Change status error:", error);
    }
  };

  // ---------- Delete ----------

  const handleOpenDelete = useCallback(
    (user: User) => {
      setSelectedUser(user);
      deleteDialog.openDialog();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleCloseDelete = () => {
    deleteDialog.closeDialog();
    setSelectedUser(undefined);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id).unwrap();
      handleCloseDelete();

      // Go back one page when the last row of a page is deleted.
      if (users.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      } else {
        await refetch();
      }
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const isDeactivating = selectedUser?.status === "ACTIVE";

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("users")}
          description={t("usersDescription")}
          actions={
            canCreate ? (
              <AppButton
                variant="contained"
                startIcon={<PersonAddAlt1Outlined />}
                onClick={handleOpenCreate}
              >
                {t("addUser")}
              </AppButton>
            ) : null
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <UserFilters
              control={control}
              isSuperAdmin={isSuperAdmin}
              roleOptions={roleOptions}
              projectOptions={projectOptions}
              statusOptions={statusOptions}
              onReset={handleResetFilters}
            />

            <UsersTable
              rows={users}
              loading={isLoading || isFetching}
              pagination={{
                page,
                limit: USERS_PAGE_LIMIT,
                total: paginationMeta.total,
                totalPages: paginationMeta.totalPages,
                onPageChange: setPage,
              }}
              onEdit={handleEdit}
              onActivate={handleOpenStatus}
              onDeactivate={handleOpenStatus}
              onDelete={handleOpenDelete}
            />
          </Box>
        </AppCard>
      </Box>

      <UserDialog
        open={formDialog.open}
        mode={mode}
        user={selectedUser}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={statusDialog.open}
        title={t(isDeactivating ? "deactivateUser" : "activateUser")}
        message={
          <>
            {t(
              isDeactivating ? "confirmDeactivateUser" : "confirmActivateUser",
            )}
            <strong>{` ${selectedUser?.name ?? ""} ?`}</strong>
          </>
        }
        confirmText={t("confirm")}
        onClose={handleCloseStatus}
        onConfirm={handleChangeStatus}
        loading={statusLoading}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteUser")}
        message={
          <>
            {t("confirmDeleteUser")}
            <strong>{` ${selectedUser?.name ?? ""} ?`}</strong>
          </>
        }
        confirmText={t("delete")}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </PageContainer>
  );
}
