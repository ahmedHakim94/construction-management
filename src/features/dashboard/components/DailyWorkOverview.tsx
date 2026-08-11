import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard } from "@/components/ui";
import type { DashboardDailyWork } from "../types";

export interface DailyWorkOverviewProps {
  dailyWork: DashboardDailyWork[];
  isLoading: boolean;
}

export function DailyWorkOverview({ dailyWork, isLoading }: DailyWorkOverviewProps) {
  const { t } = useTranslation(["dashboard", "dailyWork"]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
        {t("dailyWork:dailyWork")}
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("dailyWork:date")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("dailyWork:project")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("dailyWork:contractor")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("dailyWork:equipment")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("dailyWork:task")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }} align="right">
                {t("dailyWork:workingHours")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }} align="right">
                {t("dailyWork:cost")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton width="80px" />
                  </TableCell>
                  <TableCell>
                    <Skeleton width="120px" />
                  </TableCell>
                  <TableCell>
                    <Skeleton width="120px" />
                  </TableCell>
                  <TableCell>
                    <Skeleton width="100px" />
                  </TableCell>
                  <TableCell>
                    <Skeleton width="100px" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width="50px" sx={{ display: "inline-block" }} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width="70px" sx={{ display: "inline-block" }} />
                  </TableCell>
                </TableRow>
              ))
            ) : dailyWork.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {t("dashboard:noDailyWorkRecordsFound")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              dailyWork.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.projectName}</TableCell>
                  <TableCell>{record.contractorName}</TableCell>
                  <TableCell>{record.equipmentName}</TableCell>
                  <TableCell>{record.taskName}</TableCell>
                  <TableCell align="right">
                    {t("dashboard:workingHoursFormat", { hours: record.workingHours })}
                  </TableCell>
                  <TableCell align="right">{formatNumber(record.cost)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </AppCard>
  );
}
