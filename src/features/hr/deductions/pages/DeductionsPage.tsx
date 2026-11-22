import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader, AppSelect } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_PROJECTS,
} from "@/features/hr/employees/mock/employees.mock";
import { DeductionDialog } from "../components/DeductionDialog";
import { DeductionsTable } from "../components/DeductionsTable";
import {
  MOCK_TRANSACTIONS,
  isAllowedTransactionDate,
  isCurrentMonthDate,
} from "../mock/deductions.mock";
import type {
  FinancialTransaction,
  TransactionDialogMode,
  TransactionFormValues,
} from "../types";

export function DeductionsPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canManage = isSuperAdmin || isAdmin;
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [transactions, setTransactions] =
    useState<FinancialTransaction[]>(MOCK_TRANSACTIONS);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<
    number | ""
  >("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<Dayjs | null>(
    null,
  );

  const [dialogMode, setDialogMode] =
    useState<TransactionDialogMode>("create");
  const [selectedTransaction, setSelectedTransaction] = useState<
    FinancialTransaction | undefined
  >();

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

  const employeeFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: t("hr:allEmployees") },
      ...scopedEmployees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} (${employee.code})`,
      })),
    ],
    [scopedEmployees, t],
  );

  const formattedDateFilter =
    selectedDateFilter && selectedDateFilter.isValid()
      ? selectedDateFilter.format("YYYY-MM-DD")
      : "";

  const visibleTransactions = useMemo(() => {
    let scoped: FinancialTransaction[] = [];

    if (isSuperAdmin) {
      scoped = transactions;
    } else if (isAdmin && adminProjectId !== null) {
      scoped = transactions.filter((item) => item.projectId === adminProjectId);
    }

    return scoped.filter((item) => {
      if (
        selectedEmployeeFilter !== "" &&
        item.employeeId !== Number(selectedEmployeeFilter)
      ) {
        return false;
      }
      if (formattedDateFilter && item.date !== formattedDateFilter) {
        return false;
      }
      return true;
    });
  }, [
    transactions,
    isSuperAdmin,
    isAdmin,
    adminProjectId,
    selectedEmployeeFilter,
    formattedDateFilter,
  ]);

  const handleOpenCreate = () => {
    if (!canManage) return;
    setDialogMode("create");
    setSelectedTransaction(undefined);
    formDialog.openDialog();
  };

  const handleOpenEdit = (transaction: FinancialTransaction) => {
    if (!canManage) return;
    if (isAdmin && transaction.projectId !== adminProjectId) return;
    if (!isCurrentMonthDate(transaction.date)) return;

    setDialogMode("edit");
    setSelectedTransaction(transaction);
    formDialog.openDialog();
  };

  const handleOpenDelete = (transaction: FinancialTransaction) => {
    if (!canManage) return;
    if (isAdmin && transaction.projectId !== adminProjectId) return;
    if (!isCurrentMonthDate(transaction.date)) return;

    setSelectedTransaction(transaction);
    deleteDialog.openDialog();
  };

  const handleCloseFormDialog = () => {
    formDialog.closeDialog();
    setSelectedTransaction(undefined);
  };

  const handleCloseDeleteDialog = () => {
    deleteDialog.closeDialog();
    setSelectedTransaction(undefined);
  };

  const handleSaveTransaction = (values: TransactionFormValues) => {
    if (!canManage) return;
    if (!isAllowedTransactionDate(values.date)) return;

    const effectiveProjectId = isSuperAdmin
      ? Number(values.projectId)
      : Number(adminProjectId);

    if (isAdmin && effectiveProjectId !== adminProjectId) return;

    // Verify employee belongs to the selected project
    const employeeAssigned = MOCK_EMPLOYEES.some(
      (employee) =>
        employee.id === values.employeeId &&
        employee.projectIds.includes(effectiveProjectId),
    );
    if (!employeeAssigned) return;

    if (dialogMode === "edit" && selectedTransaction) {
      if (!isCurrentMonthDate(selectedTransaction.date)) return;
      if (isAdmin && selectedTransaction.projectId !== adminProjectId) return;

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === selectedTransaction.id
            ? {
                ...item,
                projectId: effectiveProjectId,
                employeeId: values.employeeId,
                type: values.type,
                amount: values.amount,
                reason: values.reason,
                date: values.date,
              }
            : item,
        ),
      );
    } else if (dialogMode === "create") {
      setTransactions((prev) => {
        const nextId =
          prev.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const newTransaction: FinancialTransaction = {
          id: nextId,
          projectId: effectiveProjectId,
          employeeId: values.employeeId,
          type: values.type,
          amount: values.amount,
          reason: values.reason,
          date: values.date,
        };
        return [newTransaction, ...prev];
      });
    }

    handleCloseFormDialog();
  };

  const handleConfirmDelete = () => {
    if (!canManage || !selectedTransaction) return;
    if (isAdmin && selectedTransaction.projectId !== adminProjectId) return;
    if (!isCurrentMonthDate(selectedTransaction.date)) return;

    setTransactions((prev) =>
      prev.filter((item) => item.id !== selectedTransaction.id),
    );
    handleCloseDeleteDialog();
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:deductionsBonusesTitle")}
          description={t("hr:deductionsDescription")}
          actions={
            canManage ? (
              <AppButton
                variant="contained"
                startIcon={<AddCircleOutline />}
                onClick={handleOpenCreate}
              >
                {t("hr:addTransaction")}
              </AppButton>
            ) : undefined
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box sx={{ minWidth: { xs: "100%", sm: 240 } }}>
              <AppSelect
                options={employeeFilterOptions}
                value={selectedEmployeeFilter}
                onChange={(value) =>
                  setSelectedEmployeeFilter(value === "" ? "" : Number(value))
                }
                placeholder={t("hr:allEmployees")}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:transactionDate")}
                format="YYYY-MM-DD"
                value={selectedDateFilter}
                onChange={(value) => setSelectedDateFilter(value)}
                slotProps={{
                  field: { clearable: true },
                  textField: {
                    size: "small",
                    sx: { minWidth: { xs: "100%", sm: 200 } },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          <DeductionsTable
            rows={visibleTransactions}
            employees={MOCK_EMPLOYEES}
            projects={MOCK_EMPLOYEE_PROJECTS}
            canManage={canManage}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </AppCard>

        <DeductionDialog
          open={formDialog.open}
          mode={dialogMode}
          transaction={selectedTransaction}
          employees={scopedEmployees}
          projects={MOCK_EMPLOYEE_PROJECTS}
          isSuperAdmin={isSuperAdmin}
          adminProjectId={adminProjectId}
          onClose={handleCloseFormDialog}
          onSubmit={handleSaveTransaction}
        />

        <AppConfirmDialog
          open={deleteDialog.open}
          title={t("hr:deleteTransaction")}
          message={t("hr:deleteTransactionConfirm")}
          confirmText={t("common:delete")}
          cancelText={t("common:cancel")}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      </Box>
    </PageContainer>
  );
}
