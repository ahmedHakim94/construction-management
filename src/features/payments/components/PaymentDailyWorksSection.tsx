import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PaymentDetails } from "../types";
import { formatAmount } from "../utils";

type DailyWork = PaymentDetails["dailyWorks"][number];

interface Props {
  records: DailyWork[];
  projectName: string;
}

function workingHours(start: string, end: string) {
  const hours = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  return Math.max(0, hours).toFixed(2);
}

export function PaymentDailyWorksSection({ records, projectName }: Props) {
  const { t } = useTranslation();
  const headings = [
    "date",
    "project",
    "equipment",
    "task",
    "workingHours",
    "hourRate",
    "cost",
    "deduction",
    "deductionReason",
    "netAmount",
  ];

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, fontSize: "1rem" }}
      >
        {t("dailyWorkRecords")}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              {headings.map((heading) => (
                <TableCell
                  key={heading}
                  sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  {t(heading)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.start_datetime).toLocaleDateString()}
                </TableCell>
                <TableCell>{projectName}</TableCell>
                <TableCell>
                  {record.equipmentName ??
                    record.temporary_equipment_name ??
                    "-"}
                </TableCell>
                <TableCell>{record.taskName ?? "-"}</TableCell>
                <TableCell>
                  {workingHours(record.start_datetime, record.end_datetime)}
                </TableCell>
                <TableCell>{formatAmount(record.hour_rate)}</TableCell>
                <TableCell>{formatAmount(record.cost)}</TableCell>
                <TableCell>{formatAmount(record.deduction)}</TableCell>
                <TableCell>{record.deduction_reason ?? "-"}</TableCell>
                <TableCell>
                  {formatAmount(Number(record.cost) - Number(record.deduction))}
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={headings.length} align="center">
                  {t("noData")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
