import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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

  const handleReset = () => {
    onProjectIdChange("");
    onDateFromChange(null);
    onDateToChange(null);
  };

  const hasFilters = Boolean(projectId || dateFrom || dateTo);

  return (
    <AppFilters>
      <AppSelect
        label={t("reports:projectFilter")}
        options={projectOptions}
        value={projectId}
        onChange={onProjectIdChange}
        placeholder={t("reports:allProjects")}
        width={{ xs: "100%", sm: "260px" }}
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

      <Button
        variant="outlined"
        color="inherit"
        startIcon={<RestartAltIcon />}
        onClick={handleReset}
        disabled={!hasFilters}
        sx={{ alignSelf: "flex-end", minHeight: 40 }}
      >
        إعادة تعيين
      </Button>
    </AppFilters>
  );
}
