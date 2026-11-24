import {
  Suspense,
  lazy,
  startTransition,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  AppButton,
  AppCard,
  AppPageHeader,
  AppSelect,
} from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import { useGetEmployeesQuery } from "@/features/hr/employees/services/employees.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import { DeductionsTable } from "../components/DeductionsTable";
import {
  useCreateEmployeeTransactionMutation,
  useDeleteEmployeeTransactionMutation,
  useGetEmployeeTransactionsQuery,
  useUpdateEmployeeTransactionMutation,
} from "../services/employeeTransactions.api";
import type {
  EmployeeTransactionMutationPayload,
  FinancialTransaction,
  TransactionDialogMode,
  TransactionFormValues,
  TransactionType,
} from "../types";
import { isCurrentMonthDate } from "../utils/transactionDates";

// Lazy-load heavy form dialog (zod + react-hook-form) only when opened (bundle-dynamic-imports)
const loadDeductionDialog = () =>
  import("../components/DeductionDialog").then((m) => ({
    default: m.DeductionDialog,
  }));

const DeductionDialog = lazy(loadDeductionDialog);

const PAGE_LIMIT = 10;
const EMPTY_ROWS: FinancialTransaction[] = [];
const ADD_ICON = <AddCircleOutline />;

const PAGE_STACK_SX = {
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
} as const;

const CARD_SX = {
  p: { xs: 2, md: 2.5 },
} as const;

const FILTERS_ROW_SX = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 2,
  mb: 2,
} as const;

const PROJECT_FILTER_SX = {
  minWidth: { xs: "100%", sm: 200 },
} as const;

const EMPLOYEE_FILTER_SX = {
  minWidth: { xs: "100%", sm: 230 },
} as const;

const TYPE_FILTER_SX = {
  minWidth: { xs: "100%", sm: 170 },
} as const;

const DATE_PICKER_SLOT_PROPS = {
  field: { clearable: true },
  textField: {
    size: "small" as const,
    sx: { minWidth: { xs: "100%", sm: 195 } },
  },
};

export function DeductionsPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canView = isSuperAdmin || isAdmin;
  const canManage = isSuperAdmin || isAdmin;
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [page, setPage] = useState(1);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<
    number | ""
  >("");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<
    number | ""
  >("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    TransactionType | ""
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
  const setFormDialogOpen = formDialog.setOpen;
  const setDeleteDialogOpen = deleteDialog.setOpen;

  const activeProjectFilterId =
    isSuperAdmin && selectedProjectFilter !== ""
      ? Number(selectedProjectFilter)
      : undefined;

  const formattedDateFilter =
    selectedDateFilter && selectedDateFilter.isValid()
      ? selectedDateFilter.format("YYYY-MM-DD")
      : undefined;

  // Parallel independent queries with conditional skip (async-parallel)
  const { data: rawProjects } = useGetAllProjectsQuery(undefined, {
    skip: !isSuperAdmin,
  });

  const { data: employeesResponse } = useGetEmployeesQuery(
    {
      page: 1,
      limit: 100,
      project_id: activeProjectFilterId,
    },
    {
      skip: !canView,
    },
  );

  const { data, isLoading, isFetching } = useGetEmployeeTransactionsQuery(
    {
      page,
      limit: PAGE_LIMIT,
      project_id: activeProjectFilterId,
      employee_id:
        selectedEmployeeFilter !== ""
          ? Number(selectedEmployeeFilter)
          : undefined,
      type: selectedTypeFilter !== "" ? selectedTypeFilter : undefined,
      date: formattedDateFilter,
    },
    {
      skip: !canView,
    },
  );

  const [createTransaction, { isLoading: isCreating }] =
    useCreateEmployeeTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateEmployeeTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting }] =
    useDeleteEmployeeTransactionMutation();

  const rows = data?.data ?? EMPTY_ROWS;

  // Refs for values only read inside delete callback (rerender-defer-reads)
  const pageRef = useRef(page);
  pageRef.current = page;
  const rowsLengthRef = useRef(rows.length);
  rowsLengthRef.current = rows.length;

  const paginationPage = data?.pagination?.page;
  const paginationLimit = data?.pagination?.limit;
  const paginationTotal = data?.pagination?.total;
  const paginationTotalPages = data?.pagination?.totalPages;

  // Depend on primitives so pagination reference stays stable across identical refetches (rerender-dependencies)
  const pagination = useMemo(
    () =>
      paginationPage !== undefined &&
      paginationLimit !== undefined &&
      paginationTotal !== undefined &&
      paginationTotalPages !== undefined
        ? {
            page: paginationPage,
            limit: paginationLimit,
            total: paginationTotal,
            totalPages: paginationTotalPages,
            onPageChange: setPage,
          }
        : undefined,
    [paginationPage, paginationLimit, paginationTotal, paginationTotalPages],
  );

  const projectFilterOptions = useMemo<SelectOption[]>(() => {
    const base: SelectOption[] = [{ value: "", label: t("hr:allProjects") }];
    if (!rawProjects?.length) return base;
    for (let i = 0; i < rawProjects.length; i += 1) {
      const project = rawProjects[i];
      base.push({ value: Number(project.id), label: project.name });
    }
    return base;
  }, [rawProjects, t]);

  const employeeFilterOptions = useMemo<SelectOption[]>(() => {
    const base: SelectOption[] = [{ value: "", label: t("hr:allEmployees") }];
    const employees = employeesResponse?.data;
    if (!employees?.length) return base;
    for (let i = 0; i < employees.length; i += 1) {
      const employee = employees[i];
      base.push({
        value: employee.id,
        label: `${employee.name} (#${employee.id})`,
      });
    }
    return base;
  }, [employeesResponse?.data, t]);

  const typeFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: t("hr:allTransactionTypes") },
      { value: "BONUS", label: t("hr:transactionTypeBonus") },
      { value: "DEDUCTION", label: t("hr:transactionTypeDeduction") },
    ],
    [t],
  );

  const handleProjectFilterChange = useCallback((value: string | number) => {
    startTransition(() => {
      setSelectedProjectFilter(value === "" ? "" : Number(value));
      setSelectedEmployeeFilter("");
      setPage(1);
    });
  }, []);

  const handleEmployeeFilterChange = useCallback((value: string | number) => {
    startTransition(() => {
      setSelectedEmployeeFilter(value === "" ? "" : Number(value));
      setPage(1);
    });
  }, []);

  const handleTypeFilterChange = useCallback((value: string | number) => {
    startTransition(() => {
      setSelectedTypeFilter(value === "" ? "" : (value as TransactionType));
      setPage(1);
    });
  }, []);

  const handleDateFilterChange = useCallback((value: Dayjs | null) => {
    startTransition(() => {
      setSelectedDateFilter(value);
      setPage(1);
    });
  }, []);

  // Preload lazy dialog chunk on button hover/focus (bundle-preload)
  const preloadDialog = useCallback(() => {
    void loadDeductionDialog();
  }, []);

  const handleOpenCreate = useCallback(() => {
    if (!canManage) return;
    setDialogMode("create");
    setSelectedTransaction(undefined);
    setFormDialogOpen(true);
  }, [canManage, setFormDialogOpen]);

  const handleOpenEdit = useCallback(
    (transaction: FinancialTransaction) => {
      if (!canManage) return;
      if (isAdmin && transaction.projectId !== adminProjectId) return;
      if (!isCurrentMonthDate(transaction.date)) return;

      setDialogMode("edit");
      setSelectedTransaction(transaction);
      setFormDialogOpen(true);
    },
    [canManage, isAdmin, adminProjectId, setFormDialogOpen],
  );

  const handleOpenDelete = useCallback(
    (transaction: FinancialTransaction) => {
      if (!canManage) return;
      if (isAdmin && transaction.projectId !== adminProjectId) return;
      if (!isCurrentMonthDate(transaction.date)) return;

      setSelectedTransaction(transaction);
      setDeleteDialogOpen(true);
    },
    [canManage, isAdmin, adminProjectId, setDeleteDialogOpen],
  );

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedTransaction(undefined);
  }, [setFormDialogOpen]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedTransaction(undefined);
  }, [setDeleteDialogOpen]);

  const handleSaveTransaction = useCallback(
    async (values: TransactionFormValues) => {
      if (!canManage) return;

      const payload: EmployeeTransactionMutationPayload = {
        employee_id: values.employeeId,
        type: values.type,
        amount: values.amount,
        reason: values.reason.trim() ? values.reason.trim() : null,
        transaction_date: values.date,
        ...(isSuperAdmin ? { project_id: values.projectId } : {}),
      };

      try {
        if (dialogMode === "edit" && selectedTransaction) {
          await updateTransaction({
            id: selectedTransaction.id,
            data: payload,
          }).unwrap();
        } else if (dialogMode === "create") {
          await createTransaction(payload).unwrap();
        }
        handleCloseFormDialog();
      } catch {
        // Error notification handled globally by baseApi
      }
    },
    [
      canManage,
      isSuperAdmin,
      dialogMode,
      selectedTransaction,
      updateTransaction,
      createTransaction,
      handleCloseFormDialog,
    ],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!canManage || !selectedTransaction) return;

    try {
      await deleteTransaction(selectedTransaction.id).unwrap();
      if (rowsLengthRef.current === 1 && pageRef.current > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
      handleCloseDeleteDialog();
    } catch {
      // Error notification handled globally by baseApi
    }
  }, [
    canManage,
    selectedTransaction,
    deleteTransaction,
    handleCloseDeleteDialog,
  ]);

  return (
    <PageContainer>
      <Box sx={PAGE_STACK_SX}>
        <AppPageHeader
          title={t("hr:deductionsBonusesTitle")}
          description={t("hr:deductionsDescription")}
          actions={
            canManage ? (
              <AppButton
                variant="contained"
                startIcon={ADD_ICON}
                onMouseEnter={preloadDialog}
                onFocus={preloadDialog}
                onClick={handleOpenCreate}
              >
                {t("hr:addTransaction")}
              </AppButton>
            ) : undefined
          }
        />

        <AppCard sx={CARD_SX}>
          <Box sx={FILTERS_ROW_SX}>
            {isSuperAdmin ? (
              <Box sx={PROJECT_FILTER_SX}>
                <AppSelect
                  options={projectFilterOptions}
                  value={selectedProjectFilter}
                  onChange={handleProjectFilterChange}
                  placeholder={t("hr:allProjects")}
                />
              </Box>
            ) : null}

            <Box sx={EMPLOYEE_FILTER_SX}>
              <AppSelect
                options={employeeFilterOptions}
                value={selectedEmployeeFilter}
                onChange={handleEmployeeFilterChange}
                placeholder={t("hr:allEmployees")}
              />
            </Box>

            <Box sx={TYPE_FILTER_SX}>
              <AppSelect
                options={typeFilterOptions}
                value={selectedTypeFilter}
                onChange={handleTypeFilterChange}
                placeholder={t("hr:allTransactionTypes")}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:transactionDate")}
                format="YYYY-MM-DD"
                value={selectedDateFilter}
                onChange={handleDateFilterChange}
                slotProps={DATE_PICKER_SLOT_PROPS}
              />
            </LocalizationProvider>
          </Box>

          <DeductionsTable
            rows={rows}
            loading={isLoading || isFetching}
            pagination={pagination}
            canManage={canManage}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </AppCard>

        {formDialog.open ? (
          <Suspense fallback={null}>
            <DeductionDialog
              open={formDialog.open}
              mode={dialogMode}
              transaction={selectedTransaction}
              isSuperAdmin={isSuperAdmin}
              adminProjectId={adminProjectId}
              submitting={isCreating || isUpdating}
              onClose={handleCloseFormDialog}
              onSubmit={handleSaveTransaction}
            />
          </Suspense>
        ) : null}

        {deleteDialog.open ? (
          <AppConfirmDialog
            open={deleteDialog.open}
            title={t("hr:deleteTransaction")}
            message={t("hr:deleteTransactionConfirm")}
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
