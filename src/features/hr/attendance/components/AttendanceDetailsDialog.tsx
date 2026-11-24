import {
  Box,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  type Theme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import { useGetEmployeeAttendanceDetailsQuery } from "../services/attendance.api";
import type { EmployeeAttendanceSummary } from "../types";

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

const getProjectChipSx = (theme: Theme) => ({
  height: 24,
  fontSize: "0.75rem",
  fontWeight: 600,
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
});

const getAllowanceBannerSx = (theme: Theme) => ({
  p: 1.5,
  borderRadius: 1.75,
  bgcolor: alpha(theme.palette.info.main, 0.08),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
});

interface StatCardProps {
  label: string;
  value: number;
  tone: "success" | "error" | "info" | "neutral";
}

function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <Box
      sx={(theme) => {
        const paletteColor =
          tone === "neutral" ? null : theme.palette[tone];

        return {
          p: 1.5,
          borderRadius: 1.75,
          bgcolor: paletteColor
            ? alpha(paletteColor.main, 0.07)
            : "background.default",
          border: "1px solid",
          borderColor: paletteColor
            ? alpha(paletteColor.main, 0.22)
            : "divider",
        };
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        fontWeight={700}
        color={
          tone === "success"
            ? "success.main"
            : tone === "error"
              ? "error.main"
              : tone === "info"
                ? "info.dark"
                : "text.primary"
        }
      >
        <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
          {value}
        </Box>
      </Typography>
    </Box>
  );
}

interface AttendanceDetailsDialogProps {
  open: boolean;
  employee?: EmployeeAttendanceSummary;
  month: string; // YYYY-MM
  projectId?: number;
  onClose: () => void;
}

export function AttendanceDetailsDialog({
  open,
  employee,
  month,
  projectId,
  onClose,
}: AttendanceDetailsDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";

  const { data: details, isLoading, isFetching } =
    useGetEmployeeAttendanceDetailsQuery(
      {
        employeeId: employee?.id ?? 0,
        month,
        project_id: projectId,
      },
      {
        skip: !open || !employee,
      },
    );

  const loading = isLoading || isFetching;
  const employeeName = details?.employee.name ?? employee?.name ?? "";
  const employeeId = details?.employee.id ?? employee?.id;
  const employeeJobTitle =
    details?.employee.jobTitle ?? employee?.jobTitle ?? "";
  const allowance = details?.paidAbsenceAllowance ?? 4;
  const presentDays = details?.presentDays ?? employee?.presentDays ?? 0;
  const absentDays = details?.absentDays ?? employee?.absentDays ?? 0;
  const paidAbsenceDays =
    details?.paidAbsenceDays ?? employee?.paidAbsenceDays ?? 0;
  const unpaidAbsenceDays =
    details?.unpaidAbsenceDays ?? employee?.unpaidAbsenceDays ?? 0;
  const absenceDetails = details?.absenceDetails ?? [];

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        dir={isArabic ? "rtl" : "ltr"}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <span>{t("hr:absenceDetails")}</span>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label={t("hr:close")}
          sx={{ color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dir={isArabic ? "rtl" : "ltr"}>
        {employee ? (
          <Stack spacing={2} sx={{ pt: 0.5 }}>
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
                  {employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employeeId !== undefined ? (
                    <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                      #{employeeId}
                    </Box>
                  ) : null}
                  {employeeJobTitle ? ` • ${employeeJobTitle}` : ""}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={
                  <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                    {month}
                  </Box>
                }
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 5,
                }}
              >
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 1.25,
                  }}
                >
                  <StatCard
                    label={t("hr:attendanceDays")}
                    value={presentDays}
                    tone="success"
                  />
                  <StatCard
                    label={t("hr:recordedAbsences")}
                    value={absentDays}
                    tone={absentDays > 0 ? "error" : "neutral"}
                  />
                  <StatCard
                    label={t("hr:paidAbsenceDays")}
                    value={paidAbsenceDays}
                    tone="info"
                  />
                  <StatCard
                    label={t("hr:unpaidAbsenceDays")}
                    value={unpaidAbsenceDays}
                    tone={unpaidAbsenceDays > 0 ? "error" : "neutral"}
                  />
                </Box>

                <Box sx={getAllowanceBannerSx}>
                  <Typography variant="body2" color="text.primary">
                    {t("hr:paidAbsenceAllowanceInfo", { days: allowance })}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={
                      unpaidAbsenceDays > 0 ? "error.main" : "text.primary"
                    }
                  >
                    <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                      {absentDays} / {allowance}
                    </Box>
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ mb: 1.25 }}
                  >
                    {t("hr:recordedAbsenceDates")}
                  </Typography>

                  {absenceDetails.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noRecordedAbsences")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {absenceDetails.map((item) => (
                        <Box
                          key={item.attendanceDate}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                            p: 1.25,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                              {item.attendanceDate}
                            </Box>
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            useFlexGap
                            flexWrap="wrap"
                          >
                            {item.projects.map((project) => (
                              <Chip
                                key={project.id}
                                size="small"
                                label={project.name}
                                sx={getProjectChipSx}
                              />
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </>
            )}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 2.5, py: 1.5 }}>
        <AppButton variant="outlined" onClick={onClose}>
          {t("hr:close")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
