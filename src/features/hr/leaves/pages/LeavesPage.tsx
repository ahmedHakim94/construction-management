import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader, AppSelect } from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { useAppSelector } from "@/app/store/hooks";
import { useGetEmployeesQuery } from "@/features/hr/employees/services/employees.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import { LeavesTable } from "../components/LeavesTable";
import { useGetLeavesQuery } from "../services/leaves.api";
import type { EmployeeLeaveSummary } from "../types";

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_ROWS: EmployeeLeaveSummary[] = [];
const MONTH_PICKER_VIEWS = ["year", "month"] as const;

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

const DATE_PICKER_SLOT_PROPS = {
  textField: {
    size: "small" as const,
    sx: { minWidth: { xs: "100%", sm: 190 } },
  },
};

const PROJECT_FILTER_SX = {
  minWidth: { xs: "100%", sm: 210 },
} as const;

const EMPLOYEE_FILTER_SX = {
  minWidth: { xs: "100%", sm: 230 },
} as const;

export function LeavesPage() {
  const { t } = useTranslation(["hr", "common"]);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const canView = isSuperAdmin || isAdmin;

  const [page, setPage] = useState(1);
  // Lazy init avoids creating a new dayjs() instance on every render (rerender-lazy-state-init)
  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(() =>
    dayjs(),
  );
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<
    number | ""
  >("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const activeProjectFilterId =
    isSuperAdmin && selectedProjectFilter !== ""
      ? Number(selectedProjectFilter)
      : undefined;

  const handleMonthChange = useCallback((value: Dayjs | null) => {
    startTransition(() => {
      setSelectedMonthDate(value);
      setPage(1);
    });
  }, []);

  const handleProjectFilterChange = useCallback((value: string | number) => {
    startTransition(() => {
      setSelectedProjectFilter(value === "" ? "" : Number(value));
      setSelectedEmployeeId("");
      setPage(1);
    });
  }, []);

  const handleEmployeeChange = useCallback((value: string | number) => {
    startTransition(() => {
      setSelectedEmployeeId(value === "" ? "" : Number(value));
      setPage(1);
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(value.trim());
        setPage(1);
      });
    }, SEARCH_DEBOUNCE_MS);
  }, []);

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

  const projectFilterOptions = useMemo<SelectOption[]>(() => {
    const base: SelectOption[] = [{ value: "", label: t("hr:allProjects") }];
    if (!rawProjects?.length) return base;
    for (let i = 0; i < rawProjects.length; i += 1) {
      const project = rawProjects[i];
      base.push({ value: Number(project.id), label: project.name });
    }
    return base;
  }, [rawProjects, t]);

  const employeeOptions = useMemo<SelectOption[]>(() => {
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

  const { data, isLoading, isFetching } = useGetLeavesQuery(
    {
      page,
      limit: PAGE_LIMIT,
      month: selectedMonth,
      employee_id:
        selectedEmployeeId !== "" ? Number(selectedEmployeeId) : undefined,
      search: debouncedSearch || undefined,
      project_id: activeProjectFilterId,
    },
    {
      skip: !canView,
    },
  );

  const rows = data?.data ?? EMPTY_ROWS;
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

  return (
    <PageContainer>
      <Box sx={PAGE_STACK_SX}>
        <AppPageHeader
          title={t("hr:leaves")}
          description={t("hr:leavesDescription")}
        />

        <AppCard sx={CARD_SX}>
          <Box sx={FILTERS_ROW_SX}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:selectMonth")}
                views={MONTH_PICKER_VIEWS}
                openTo="month"
                format="YYYY-MM"
                value={selectedMonthDate}
                onChange={handleMonthChange}
                slotProps={DATE_PICKER_SLOT_PROPS}
              />
            </LocalizationProvider>

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
                options={employeeOptions}
                value={selectedEmployeeId}
                onChange={handleEmployeeChange}
                loading={employeesLoading}
                placeholder={t("hr:allEmployees")}
              />
            </Box>

            <AppSearchInput
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t("hr:employeeName")}
            />
          </Box>

          <LeavesTable
            rows={rows}
            loading={isLoading || isFetching}
            pagination={pagination}
          />
        </AppCard>
      </Box>
    </PageContainer>
  );
}
