import { useMemo, useState } from "react";
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
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_PROJECTS,
} from "../mock/employees.mock";
import type {
  Employee,
  EmployeeDialogMode,
  EmployeeFormValues,
} from "../types";

function getNextEmployeeCode(employees: Employee[]): string {
  const maxNumber = employees.reduce((max, employee) => {
    const match = /^EMP-(\d+)$/.exec(employee.code);
    const num = match ? Number(match[1]) : 0;
    return Math.max(max, num);
  }, 0);
  return `EMP-${String(maxNumber + 1).padStart(3, "0")}`;
}

export function EmployeesPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canView = isSuperAdmin || isAdmin;
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<EmployeeDialogMode>("view");
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();

  const formDialog = useDialog();
  const deleteDialog = useDialog();

  const projectNameById = useMemo(
    () =>
      new Map(
        MOCK_EMPLOYEE_PROJECTS.map((project) => [
          project.id,
          project.name.toLowerCase(),
        ]),
      ),
    [],
  );

  const visibleEmployees = useMemo(() => {
    let scoped: Employee[] = [];

    if (isSuperAdmin) {
      scoped = employees;
    } else if (isAdmin && adminProjectId !== null) {
      scoped = employees.filter((employee) =>
        employee.projectIds.includes(adminProjectId),
      );
    }

    const query = search.trim().toLowerCase();
    if (!query) return scoped;

    return scoped.filter((employee) => {
      const matchesProjects = employee.projectIds.some((projectId) =>
        (projectNameById.get(projectId) ?? "").includes(query),
      );

      return (
        employee.code.toLowerCase().includes(query) ||
        employee.name.toLowerCase().includes(query) ||
        employee.phone.toLowerCase().includes(query) ||
        employee.jobTitle.toLowerCase().includes(query) ||
        matchesProjects
      );
    });
  }, [employees, isSuperAdmin, isAdmin, adminProjectId, search, projectNameById]);

  const handleOpenCreate = () => {
    if (!isSuperAdmin) return;
    setDialogMode("create");
    setSelectedEmployee(undefined);
    formDialog.openDialog();
  };

  const handleOpenView = (employee: Employee) => {
    if (!canView) return;
    setDialogMode("view");
    setSelectedEmployee(employee);
    formDialog.openDialog();
  };

  const handleOpenEdit = (employee: Employee) => {
    if (!isSuperAdmin) return;
    setDialogMode("edit");
    setSelectedEmployee(employee);
    formDialog.openDialog();
  };

  const handleOpenDelete = (employee: Employee) => {
    if (!isSuperAdmin) return;
    setSelectedEmployee(employee);
    deleteDialog.openDialog();
  };

  const handleCloseFormDialog = () => {
    formDialog.closeDialog();
    setSelectedEmployee(undefined);
  };

  const handleCloseDeleteDialog = () => {
    deleteDialog.closeDialog();
    setSelectedEmployee(undefined);
  };

  const handleSubmit = (values: EmployeeFormValues) => {
    if (!isSuperAdmin) return;

    const uniqueProjectIds = Array.from(new Set(values.projectIds));

    if (dialogMode === "edit" && selectedEmployee) {
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === selectedEmployee.id
            ? {
                ...item,
                ...values,
                projectIds: uniqueProjectIds,
              }
            : item,
        ),
      );
    } else if (dialogMode === "create") {
      setEmployees((prev) => {
        const nextId =
          prev.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const newEmployee: Employee = {
          id: nextId,
          code: getNextEmployeeCode(prev),
          ...values,
          projectIds: uniqueProjectIds,
        };
        return [newEmployee, ...prev];
      });
    }

    handleCloseFormDialog();
  };

  const handleConfirmDelete = () => {
    if (!isSuperAdmin || !selectedEmployee) return;
    setEmployees((prev) =>
      prev.filter((item) => item.id !== selectedEmployee.id),
    );
    handleCloseDeleteDialog();
  };

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
              value={search}
              onChange={setSearch}
              placeholder={t("hr:searchEmployees")}
            />
          </Box>

          <EmployeesTable
            rows={visibleEmployees}
            projects={MOCK_EMPLOYEE_PROJECTS}
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
          projects={MOCK_EMPLOYEE_PROJECTS}
          isSuperAdmin={isSuperAdmin}
          onClose={handleCloseFormDialog}
          onSubmit={handleSubmit}
        />

        {isSuperAdmin && (
          <AppConfirmDialog
            open={deleteDialog.open}
            title={t("hr:deleteEmployee")}
            message={t("hr:deleteEmployeeConfirm", {
              name: selectedEmployee?.name ?? "",
            })}
            confirmText={t("common:delete")}
            cancelText={t("common:cancel")}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
          />
        )}
      </Box>
    </PageContainer>
  );
}
