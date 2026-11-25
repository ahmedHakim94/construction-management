import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  AppButton,
  AppCard,
  AppPageHeader,
  AppSelect,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import { AttendanceDetailsDialog } from "../components/AttendanceDetailsDialog";
import { AttendanceDialog } from "../components/AttendanceDialog";
import { AttendanceTable } from "../components/AttendanceTable";
import {
  useCreateBulkAttendanceMutation,
  useGetAttendanceQuery,
  useUpdateBulkAttendanceMutation,
} from "../services/attendance.api";
import type {
  AttendanceDialogMode,
  AttendanceSavePayload,
  EmployeeAttendanceSummary,
} from "../types";

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_ROWS: EmployeeAttendanceSummary[] = [];

export function AttendancePage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canView = isSuperAdmin || isAdmin;
  const canManage = isSuperAdmin || isAdmin;
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [page, setPage] = useState(1);
  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(
    dayjs(),
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<
    number | ""
  >("");
  const [dialogMode, setDialogMode] =
    useState<AttendanceDialogMode>("register");
  const [selectedEmployee, setSelectedEmployee] = useState<
    EmployeeAttendanceSummary | undefined
  >();
  const [detailsEmployee, setDetailsEmployee] = useState<
    EmployeeAttendanceSummary | undefined
  >();

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerDialog = useDialog();
  const detailsDialog = useDialog();

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const selectedMonth =
    selectedMonthDate && selectedMonthDate.isValid()
      ? selectedMonthDate.format("YYYY-MM")
      : dayjs().format("YYYY-MM");

  const handleMonthChange = useCallback((value: Dayjs | null) => {
    setSelectedMonthDate(value);
    setPage(1);
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

  const handleProjectFilterChange = useCallback((value: string | number) => {
    setSelectedProjectFilter(value === "" ? "" : Number(value));
    setPage(1);
  }, []);

  const { data: rawProjects, isFetching: projectsLoading } =
    useGetAllProjectsQuery(undefined, {
      skip: !isSuperAdmin,
    });

  const projectFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: t("hr:allProjects") },
      ...(rawProjects ?? []).map((project) => ({
        value: Number(project.id),
        label: project.name,
      })),
    ],
    [rawProjects, t],
  );

  const activeProjectFilterId =
    isSuperAdmin && selectedProjectFilter !== ""
      ? Number(selectedProjectFilter)
      : undefined;

  const { data, isLoading, isFetching } = useGetAttendanceQuery(
    {
      page,
      limit: PAGE_LIMIT,
      month: selectedMonth,
      search: debouncedSearch || undefined,
      project_id: activeProjectFilterId,
    },
    {
      skip: !canView,
    },
  );

  const [createBulkAttendance, { isLoading: isCreating }] =
    useCreateBulkAttendanceMutation();
  const [updateBulkAttendance, { isLoading: isUpdating }] =
    useUpdateBulkAttendanceMutation();

  const rows = data?.data ?? EMPTY_ROWS;
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

  const handleOpenRegister = useCallback(() => {
    if (!canManage) return;
    setDialogMode("register");
    setSelectedEmployee(undefined);
    registerDialog.openDialog();
  }, [canManage, registerDialog.openDialog]);

  const handleOpenEdit = useCallback(
    (summary: EmployeeAttendanceSummary) => {
      if (!canManage) return;
      setDialogMode("edit");
      setSelectedEmployee(summary);
      registerDialog.openDialog();
    },
    [canManage, registerDialog.openDialog],
  );

  const handleOpenDetails = useCallback(
    (summary: EmployeeAttendanceSummary) => {
      if (!canView) return;
      setDetailsEmployee(summary);
      detailsDialog.openDialog();
    },
    [canView, detailsDialog.openDialog],
  );

  const handleCloseRegisterDialog = useCallback(() => {
    registerDialog.closeDialog();
    setSelectedEmployee(undefined);
  }, [registerDialog.closeDialog]);

  const handleCloseDetailsDialog = useCallback(() => {
    detailsDialog.closeDialog();
    setDetailsEmployee(undefined);
  }, [detailsDialog.closeDialog]);

  const handleSaveAttendance = useCallback(
    async (payload: AttendanceSavePayload) => {
      if (!canManage) return;

      const body = {
        attendance_date: payload.attendanceDate,
        project_id: isSuperAdmin ? payload.projectId : adminProjectId ?? undefined,
        records: payload.records,
      };

      try {
        if (payload.mode === "edit") {
          await updateBulkAttendance(body).unwrap();
        } else {
          await createBulkAttendance(body).unwrap();
        }
        handleCloseRegisterDialog();
      } catch {
        // Error notification handled globally by baseApi
      }
    },
    [
      canManage,
      isSuperAdmin,
      adminProjectId,
      updateBulkAttendance,
      createBulkAttendance,
      handleCloseRegisterDialog,
    ],
  );

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:attendance")}
          description={t("hr:attendanceDescription")}
          actions={
            canManage ? (
              <AppButton
                variant="contained"
                startIcon={<EventAvailableOutlined />}
                onClick={handleOpenRegister}
              >
                {t("hr:registerAttendance")}
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:selectMonth")}
                views={["year", "month"]}
                openTo="month"
                format="YYYY-MM"
                value={selectedMonthDate}
                onChange={handleMonthChange}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 190 },
                  },
                }}
              />
            </LocalizationProvider>

            {isSuperAdmin ? (
              <Box sx={{ minWidth: 210 }}>
                <AppSelect
                  options={projectFilterOptions}
                  value={selectedProjectFilter}
                  onChange={handleProjectFilterChange}
                  loading={projectsLoading}
                  placeholder={t("hr:allProjects")}
                />
              </Box>
            ) : null}

            <AppSearchInput
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t("hr:searchAttendance")}
            />
          </Box>

          <AttendanceTable
            rows={rows}
            loading={isLoading || isFetching}
            pagination={pagination}
            canView={canView}
            canManage={canManage}
            onViewDetails={handleOpenDetails}
            onEdit={handleOpenEdit}
          />
        </AppCard>

        <AttendanceDialog
          open={registerDialog.open}
          mode={dialogMode}
          selectedMonth={selectedMonth}
          targetEmployee={selectedEmployee}
          isSuperAdmin={isSuperAdmin}
          adminProjectId={adminProjectId}
          submitting={isCreating || isUpdating}
          onClose={handleCloseRegisterDialog}
          onSave={handleSaveAttendance}
        />

        <AttendanceDetailsDialog
          open={detailsDialog.open}
          employee={detailsEmployee}
          month={selectedMonth}
          projectId={activeProjectFilterId}
          onClose={handleCloseDetailsDialog}
        />
      </Box>
    </PageContainer>
  );
}
