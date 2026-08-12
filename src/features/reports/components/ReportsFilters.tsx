import { useTranslation } from "react-i18next";
import { AppSelect } from "@/components/ui";
import { AppFilters } from "@/components/ui/AppFilters";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import type { Dayjs } from "dayjs";
import type { SelectOption } from "@/components/ui/AppSelect";

export interface ReportsFiltersProps {
  projectId: string;
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  onProjectIdChange: (id: string) => void;
  onDateFromChange: (date: Dayjs | null) => void;
  onDateToChange: (date: Dayjs | null) => void;
  projectOptions: readonly SelectOption[];
}

export function ReportsFilters({
  projectId,
  dateFrom,
  dateTo,
  onProjectIdChange,
  onDateFromChange,
  onDateToChange,
  projectOptions,
}: ReportsFiltersProps) {
  const { t } = useTranslation(["reports"]);

  return (
    <AppFilters>
      <AppSelect
        label={t("reports:projectFilter")}
        options={projectOptions}
        value={projectId}
        onChange={onProjectIdChange}
        placeholder={t("reports:allProjects")}
        width="260px"
      />
      <AppDatePicker
        label={t("reports:dateFrom")}
        value={dateFrom}
        onChange={onDateFromChange}
      />
      <AppDatePicker
        label={t("reports:dateTo")}
        value={dateTo}
        onChange={onDateToChange}
      />
    </AppFilters>
  );
}
