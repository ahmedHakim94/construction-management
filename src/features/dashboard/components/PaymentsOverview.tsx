import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Skeleton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard } from "@/components/ui";
import type { DashboardPayment } from "../types";

export interface PaymentsOverviewProps {
  payments: DashboardPayment[];
  isLoading: boolean;
}

const statusChipProps = {
  PAID: { label: "statusPaid", color: "#f0fdf4", textColor: "#16a34a", border: "#bbf7d0" },
  PARTIALLY_PAID: { label: "statusPartiallyPaid", color: "#fffbeb", textColor: "#d97706", border: "#fde68a" },
  UNPAID: { label: "statusUnpaid", color: "#fff5f5", textColor: "#dc2626", border: "#fecaca" },
} as const;

export function PaymentsOverview({ payments, isLoading }: PaymentsOverviewProps) {
  const { t } = useTranslation(["dashboard", "payments"]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
        {t("payments:payments")}
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
                {t("payments:project")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("payments:contractor")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                {t("payments:period")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }} align="right">
                {t("payments:netAmount")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }} align="right">
                {t("payments:paidAmount")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }} align="right">
                {t("payments:remainingAmount")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#334155" }} align="center">
                {t("payments:status")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton width="80%" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width="50px" sx={{ display: "inline-block" }} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width="50px" sx={{ display: "inline-block" }} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width="50px" sx={{ display: "inline-block" }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width="70px" sx={{ display: "inline-block" }} />
                  </TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {t("payments:noPaymentsRecorded")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const chip = statusChipProps[payment.status];
                return (
                  <TableRow
                    key={payment.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{payment.projectName}</TableCell>
                    <TableCell>{payment.contractorName}</TableCell>
                    <TableCell>{`${payment.startDate} - ${payment.endDate}`}</TableCell>
                    <TableCell align="right">{formatNumber(payment.netAmount)}</TableCell>
                    <TableCell align="right">{formatNumber(payment.paidAmount)}</TableCell>
                    <TableCell align="right">{formatNumber(payment.remainingAmount)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={t(`payments:${chip.label}`)}
                        size="small"
                        sx={{
                          backgroundColor: chip.color,
                          color: chip.textColor,
                          border: `1px solid ${chip.border}`,
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </AppCard>
  );
}
