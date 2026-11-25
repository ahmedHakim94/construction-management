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
import { LoansTable } from "../components/LoansTable";
import {
  useCreateEmployeeLoanMutation,
  useDeleteEmployeeLoanMutation,
  useGetEmployeeLoansQuery,
  useUpdateEmployeeLoanMutation,
} from "../services/employeeLoans.api";
import type {
  EmployeeLoanMutationPayload,
  Loan,
  LoanDialogMode,
  LoanFormValues,
} from "../types";

// Lazy-load heavy form dialog (zod + react-hook-form) only when opened (bundle-dynamic-imports)
const loadLoanDialog = () =>
  import("../components/LoanDialog").then((m) => ({
    default: m.LoanDialog,
  }));

const LoanDialog = lazy(loadLoanDialog);

const PAGE_LIMIT = 10;
const EMPTY_ROWS: Loan[] = [];
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

const DATE_PICKER_SLOT_PROPS = {
  field: { clearable: true },
  textField: {
    size: "small" as const,
    sx: { minWidth: { xs: "100%", sm: 195 } },
  },
};

export function LoansPage() {
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
  const [selectedDateFilter, setSelectedDateFilter] = useState<Dayjs | null>(
    null,
  );

  const [dialogMode, setDialogMode] = useState<LoanDialogMode>("create");
  const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>();

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
  const { data: rawProjects, isFetching: projectsLoading } =
    useGetAllProjectsQuery(undefined, {
      skip: !isSuperAdmin,
    });

  const { data: employeesResponse, isFetching: employeesLoading } =
    useGetEmployeesQuery(
      {
        page: 1,
        limit: 100,
        project_id: activeProjectFilterId,
      },
      {
        skip: !canView,
      },
    );

  const { data, isLoading, isFetching } = useGetEmployeeLoansQuery(
    {
      page,
      limit: PAGE_LIMIT,
      project_id: activeProjectFilterId,
      employee_id:
        selectedEmployeeFilter !== ""
          ? Number(selectedEmployeeFilter)
          : undefined,
      date: formattedDateFilter,
    },
    {
      skip: !canView,
    },
  );

  const [createLoan, { isLoading: isCreating }] =
    useCreateEmployeeLoanMutation();
  const [updateLoan, { isLoading: isUpdating }] =
    useUpdateEmployeeLoanMutation();
  const [deleteLoan, { isLoading: isDeleting }] =
    useDeleteEmployeeLoanMutation();

  const rows = data?.data ?? EMPTY_ROWS;

  // Refs for transient values only read inside delete callback (rerender-defer-reads)
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

  const handleDateFilterChange = useCallback((value: Dayjs | null) => {
    startTransition(() => {
      setSelectedDateFilter(value);
      setPage(1);
    });
  }, []);

  // Preload lazy dialog chunk on button hover/focus (bundle-preload)
  const preloadDialog = useCallback(() => {
    void loadLoanDialog();
  }, []);

  const handleOpenCreate = useCallback(() => {
    if (!canManage) return;
    setDialogMode("create");
    setSelectedLoan(undefined);
    setFormDialogOpen(true);
  }, [canManage, setFormDialogOpen]);

  const handleOpenEdit = useCallback(
    (loan: Loan) => {
      if (!canManage) return;
      if (isAdmin && loan.projectId !== adminProjectId) return;
      setDialogMode("edit");
      setSelectedLoan(loan);
      setFormDialogOpen(true);
    },
    [canManage, isAdmin, adminProjectId, setFormDialogOpen],
  );

  const handleOpenDelete = useCallback(
    (loan: Loan) => {
      if (!canManage) return;
      if (isAdmin && loan.projectId !== adminProjectId) return;
      setSelectedLoan(loan);
      setDeleteDialogOpen(true);
    },
    [canManage, isAdmin, adminProjectId, setDeleteDialogOpen],
  );

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedLoan(undefined);
  }, [setFormDialogOpen]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedLoan(undefined);
  }, [setDeleteDialogOpen]);

  const handleSaveLoan = useCallback(
    async (values: LoanFormValues) => {
      if (!canManage) return;

      const payload: EmployeeLoanMutationPayload = {
        employee_id: values.employeeId,
        amount: values.amount,
        loan_date: values.date,
        ...(isSuperAdmin ? { project_id: values.projectId } : {}),
      };

      try {
        if (dialogMode === "edit" && selectedLoan) {
          await updateLoan({
            id: selectedLoan.id,
            data: payload,
          }).unwrap();
        } else if (dialogMode === "create") {
          await createLoan(payload).unwrap();
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
      selectedLoan,
      updateLoan,
      createLoan,
      handleCloseFormDialog,
    ],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!canManage || !selectedLoan) return;

    try {
      await deleteLoan(selectedLoan.id).unwrap();
      if (rowsLengthRef.current === 1 && pageRef.current > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
      handleCloseDeleteDialog();
    } catch {
      // Error notification handled globally by baseApi
    }
  }, [canManage, selectedLoan, deleteLoan, handleCloseDeleteDialog]);

  return (
    <PageContainer>
      <Box sx={PAGE_STACK_SX}>
        <AppPageHeader
          title={t("hr:loans")}
          description={t("hr:loansDescription")}
          actions={
            canManage ? (
              <AppButton
                variant="contained"
                startIcon={ADD_ICON}
                onMouseEnter={preloadDialog}
                onFocus={preloadDialog}
                onClick={handleOpenCreate}
              >
                {t("hr:addLoan")}
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
                  loading={projectsLoading}
                  placeholder={t("hr:allProjects")}
                />
              </Box>
            ) : null}

            <Box sx={EMPLOYEE_FILTER_SX}>
              <AppSelect
                options={employeeFilterOptions}
                value={selectedEmployeeFilter}
                onChange={handleEmployeeFilterChange}
                loading={employeesLoading}
                placeholder={t("hr:allEmployees")}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:loanDate")}
                format="YYYY-MM-DD"
                value={selectedDateFilter}
                onChange={handleDateFilterChange}
                slotProps={DATE_PICKER_SLOT_PROPS}
              />
            </LocalizationProvider>
          </Box>

          <LoansTable
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
            <LoanDialog
              open={formDialog.open}
              mode={dialogMode}
              loan={selectedLoan}
              isSuperAdmin={isSuperAdmin}
              adminProjectId={adminProjectId}
              submitting={isCreating || isUpdating}
              onClose={handleCloseFormDialog}
              onSubmit={handleSaveLoan}
            />
          </Suspense>
        ) : null}

        {deleteDialog.open ? (
          <AppConfirmDialog
            open={deleteDialog.open}
            title={t("hr:deleteLoan")}
            message={t("hr:deleteLoanConfirm")}
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
