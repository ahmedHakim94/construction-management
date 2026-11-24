import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import PersonAddAlt1Outlined from "@mui/icons-material/PersonAddAlt1Outlined";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import { EmployeeDialog } from "../components/EmployeeDialog";
import { EmployeesTable } from "../components/EmployeesTable";
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "../services/employees.api";
import type {
  Employee,
  EmployeeDialogMode,
  EmployeeFormValues,
  EmployeeMutationPayload,
} from "../types";

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_EMPLOYEES: Employee[] = [];

export function EmployeesPage() {
  const { t } = useTranslation(["hr", "common"]);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const canView = isSuperAdmin || isAdmin;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<EmployeeDialogMode>("view");
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formDialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const { data, isLoading, isFetching } = useGetEmployeesQuery(
    {
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
    },
    {
      skip: !canView,
    },
  );

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  const employees = data?.data ?? EMPTY_EMPLOYEES;
  const paginationMeta = data?.pagination;

  const pagination = useMemo(
    () =>
      paginationMeta
        ? {
            page: paginationMeta.page,
            limit: paginationMeta.limit,
            total: paginationMeta.total,
            totalPages: paginationMeta.totalPages,
            onPageChange: setPage,
          }
        : undefined,
    [paginationMeta],
  );

  const handleOpenCreate = useCallback(() => {
    if (!isSuperAdmin) return;
    setDialogMode("create");
    setSelectedEmployee(undefined);
    formDialog.openDialog();
  }, [isSuperAdmin, formDialog.openDialog]);

  const handleOpenView = useCallback(
    (employee: Employee) => {
      if (!canView) return;
      setDialogMode("view");
      setSelectedEmployee(employee);
      formDialog.openDialog();
    },
    [canView, formDialog.openDialog],
  );

  const handleOpenEdit = useCallback(
    (employee: Employee) => {
      if (!isSuperAdmin) return;
      setDialogMode("edit");
      setSelectedEmployee(employee);
      formDialog.openDialog();
    },
    [isSuperAdmin, formDialog.openDialog],
  );

  const handleOpenDelete = useCallback(
    (employee: Employee) => {
      if (!isSuperAdmin) return;
      setSelectedEmployee(employee);
      deleteDialog.openDialog();
    },
    [isSuperAdmin, deleteDialog.openDialog],
  );

  const handleCloseFormDialog = useCallback(() => {
    formDialog.closeDialog();
    setSelectedEmployee(undefined);
  }, [formDialog.closeDialog]);

  const handleCloseDeleteDialog = useCallback(() => {
    deleteDialog.closeDialog();
    setSelectedEmployee(undefined);
  }, [deleteDialog.closeDialog]);

  const handleSubmit = useCallback(
    async (values: EmployeeFormValues) => {
      if (!isSuperAdmin) return;

      const payload: EmployeeMutationPayload = {
        name: values.name,
        phone: values.phone,
        address: values.address || null,
        salary: values.basicSalary,
        status: values.status,
        job_title: values.jobTitle || null,
        hire_date: values.hireDate || null,
        project_ids: Array.from(new Set(values.projectIds)),
      };

      try {
        if (dialogMode === "edit" && selectedEmployee) {
          await updateEmployee({
            id: selectedEmployee.id,
            data: payload,
          }).unwrap();
        } else if (dialogMode === "create") {
          await createEmployee(payload).unwrap();
        }
        handleCloseFormDialog();
      } catch {
        // Error notification handled globally by baseApi
      }
    },
    [
      isSuperAdmin,
      dialogMode,
      selectedEmployee,
      updateEmployee,
      createEmployee,
      handleCloseFormDialog,
    ],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!isSuperAdmin || !selectedEmployee) return;

    try {
      await deleteEmployee(selectedEmployee.id).unwrap();
      if (employees.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
      handleCloseDeleteDialog();
    } catch {
      // Error notification handled globally by baseApi
    }
  }, [
    isSuperAdmin,
    selectedEmployee,
    deleteEmployee,
    employees.length,
    page,
    handleCloseDeleteDialog,
  ]);

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:employees")}
          description={t("hr:employeesDescription")}
          actions={
            isSuperAdmin ? (
              <AppButton
                variant="contained"
                startIcon={<PersonAddAlt1Outlined />}
                onClick={handleOpenCreate}
              >
                {t("hr:addEmployee")}
              </AppButton>
            ) : undefined
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box sx={{ mb: 2 }}>
            <AppSearchInput
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t("hr:searchEmployees")}
            />
          </Box>

          <EmployeesTable
            rows={employees}
            loading={isLoading || isFetching}
            pagination={pagination}
            canView={canView}
            canManage={isSuperAdmin}
            onView={handleOpenView}
            onEdit={isSuperAdmin ? handleOpenEdit : undefined}
            onDelete={isSuperAdmin ? handleOpenDelete : undefined}
          />
        </AppCard>

        <EmployeeDialog
          open={formDialog.open}
          mode={dialogMode}
          employee={selectedEmployee}
          isSuperAdmin={isSuperAdmin}
          submitting={isCreating || isUpdating}
          onClose={handleCloseFormDialog}
          onSubmit={handleSubmit}
        />

        {isSuperAdmin ? (
          <AppConfirmDialog
            open={deleteDialog.open}
            title={t("hr:deleteEmployee")}
            message={t("hr:deleteEmployeeConfirm", {
              name: selectedEmployee?.name ?? "",
            })}
            loading={isDeleting}
            confirmText={t("common:delete")}
            cancelText={t("common:cancel")}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
          />
        ) : null}
      </Box>
    </PageContainer>
  );
}
