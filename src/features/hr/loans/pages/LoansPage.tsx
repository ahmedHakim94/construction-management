import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_PROJECTS,
} from "@/features/hr/employees/mock/employees.mock";
import { LoanDialog } from "../components/LoanDialog";
import { LoansTable } from "../components/LoansTable";
import { MOCK_LOANS } from "../mock/loans.mock";
import type { Loan, LoanDialogMode, LoanFormValues } from "../types";

export function LoansPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canManage = isSuperAdmin || isAdmin;
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);
  const [dialogMode, setDialogMode] = useState<LoanDialogMode>("create");
  const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>();

  const formDialog = useDialog();
  const deleteDialog = useDialog();

  const scopedEmployees = useMemo(() => {
    if (isSuperAdmin) return MOCK_EMPLOYEES;
    if (isAdmin && adminProjectId !== null) {
      return MOCK_EMPLOYEES.filter((employee) =>
        employee.projectIds.includes(adminProjectId),
      );
    }
    return [];
  }, [isSuperAdmin, isAdmin, adminProjectId]);

  const visibleLoans = useMemo(() => {
    if (isSuperAdmin) return loans;
    if (isAdmin && adminProjectId !== null) {
      return loans.filter((loan) => loan.projectId === adminProjectId);
    }
    return [];
  }, [loans, isSuperAdmin, isAdmin, adminProjectId]);

  const handleOpenCreate = () => {
    if (!canManage) return;
    setDialogMode("create");
    setSelectedLoan(undefined);
    formDialog.openDialog();
  };

  const handleOpenEdit = (loan: Loan) => {
    if (!canManage) return;
    if (isAdmin && loan.projectId !== adminProjectId) return;
    setDialogMode("edit");
    setSelectedLoan(loan);
    formDialog.openDialog();
  };

  const handleOpenDelete = (loan: Loan) => {
    if (!canManage) return;
    if (isAdmin && loan.projectId !== adminProjectId) return;
    setSelectedLoan(loan);
    deleteDialog.openDialog();
  };

  const handleCloseFormDialog = () => {
    formDialog.closeDialog();
    setSelectedLoan(undefined);
  };

  const handleCloseDeleteDialog = () => {
    deleteDialog.closeDialog();
    setSelectedLoan(undefined);
  };

  const handleSaveLoan = (values: LoanFormValues) => {
    if (!canManage) return;

    const effectiveProjectId = isSuperAdmin
      ? Number(values.projectId)
      : Number(adminProjectId);

    if (isAdmin && effectiveProjectId !== adminProjectId) return;

    const employeeAssigned = MOCK_EMPLOYEES.some(
      (employee) =>
        employee.id === values.employeeId &&
        employee.projectIds.includes(effectiveProjectId),
    );
    if (!employeeAssigned) return;

    if (dialogMode === "edit" && selectedLoan) {
      if (isAdmin && selectedLoan.projectId !== adminProjectId) return;
      setLoans((prev) =>
        prev.map((item) =>
          item.id === selectedLoan.id
            ? {
                ...item,
                projectId: effectiveProjectId,
                employeeId: values.employeeId,
                amount: values.amount,
                date: values.date,
              }
            : item,
        ),
      );
    } else if (dialogMode === "create") {
      setLoans((prev) => {
        const nextId =
          prev.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const newLoan: Loan = {
          id: nextId,
          projectId: effectiveProjectId,
          employeeId: values.employeeId,
          amount: values.amount,
          date: values.date,
        };
        return [newLoan, ...prev];
      });
    }

    handleCloseFormDialog();
  };

  const handleConfirmDelete = () => {
    if (!canManage || !selectedLoan) return;
    if (isAdmin && selectedLoan.projectId !== adminProjectId) return;

    setLoans((prev) => prev.filter((item) => item.id !== selectedLoan.id));
    handleCloseDeleteDialog();
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:loans")}
          description={t("hr:loansDescription")}
          actions={
            canManage ? (
              <AppButton
                variant="contained"
                startIcon={<AddCircleOutline />}
                onClick={handleOpenCreate}
              >
                {t("hr:addLoan")}
              </AppButton>
            ) : undefined
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <LoansTable
            rows={visibleLoans}
            employees={MOCK_EMPLOYEES}
            projects={MOCK_EMPLOYEE_PROJECTS}
            canManage={canManage}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </AppCard>

        <LoanDialog
          open={formDialog.open}
          mode={dialogMode}
          loan={selectedLoan}
          employees={scopedEmployees}
          projects={MOCK_EMPLOYEE_PROJECTS}
          isSuperAdmin={isSuperAdmin}
          adminProjectId={adminProjectId}
          onClose={handleCloseFormDialog}
          onSubmit={handleSaveLoan}
        />

        <AppConfirmDialog
          open={deleteDialog.open}
          title={t("hr:deleteLoan")}
          message={t("hr:deleteLoanConfirm")}
          confirmText={t("common:delete")}
          cancelText={t("common:cancel")}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      </Box>
    </PageContainer>
  );
}
