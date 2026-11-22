import { useMemo } from "react";
import {
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import type { EmployeeProject } from "@/features/hr/employees/types";
import { MONTHLY_PAID_ABSENCE_ALLOWANCE } from "../mock/attendance.mock";
import type { AttendanceRecord, EmployeeAttendanceSummary } from "../types";

interface AttendanceDetailsDialogProps {
  open: boolean;
  employee?: EmployeeAttendanceSummary;
  monthLabel: string;
  absenceRecords: AttendanceRecord[];
  projects: EmployeeProject[];
  onClose: () => void;
}

export function AttendanceDetailsDialog({
  open,
  employee,
  monthLabel,
  absenceRecords,
  projects,
  onClose,
}: AttendanceDetailsDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const sortedAbsences = useMemo(
    () =>
      [...absenceRecords].sort((a, b) => a.date.localeCompare(b.date)),
    [absenceRecords],
  );

  const uniqueAbsenceDays = useMemo(
    () => new Set(absenceRecords.map((record) => record.date)).size,
    [absenceRecords],
  );

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={isArabic ? "rtl" : "ltr"}>
        {t("hr:absenceDetails")}
      </DialogTitle>

      <DialogContent dir={isArabic ? "rtl" : "ltr"}>
        {employee && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {employee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.code} • {employee.jobTitle}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={monthLabel}
                sx={{ direction: "ltr", fontWeight: 600 }}
              />
            </Box>

            <Box
              sx={(theme) => ({
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              })}
            >
              <Typography variant="body2" color="text.primary">
                {t("hr:paidAbsenceAllowanceInfo", {
                  days: MONTHLY_PAID_ABSENCE_ALLOWANCE,
                })}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                color={
                  uniqueAbsenceDays > MONTHLY_PAID_ABSENCE_ALLOWANCE
                    ? "error.main"
                    : "text.primary"
                }
                sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
              >
                {uniqueAbsenceDays} / {MONTHLY_PAID_ABSENCE_ALLOWANCE}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.25 }}
              >
                {t("hr:recordedAbsenceDates")}
              </Typography>

              {sortedAbsences.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("hr:noRecordedAbsences")}
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {sortedAbsences.map((record) => (
                    <Box
                      key={record.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.25,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          direction: "ltr",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {record.date}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          projectNameById.get(record.projectId) ??
                          `#${record.projectId}`
                        }
                        sx={(theme) => ({
                          height: 24,
                          fontSize: "0.75rem",
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.primary.main,
                        })}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" onClick={onClose}>
          {t("common:cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
