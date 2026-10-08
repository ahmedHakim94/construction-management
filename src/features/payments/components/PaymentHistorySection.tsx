import { Payment as PaymentIcon } from "@mui/icons-material";
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
import { AppButton } from "@/components/ui";
import type { PaymentDetails, PaymentSummary } from "../types";
import { formatAmount } from "../utils";

interface Props {
  summary: PaymentSummary;
  transactions: PaymentDetails["transactions"];
  loading?: boolean;
  onRecordPayment: (payment: PaymentSummary) => void;
}

export function PaymentHistorySection({
  summary,
  transactions,
  loading,
  onRecordPayment,
}: Props) {
  const { t } = useTranslation();
  return (
    <Box>
      {summary.status !== "PAID" && (
        <AppButton
          variant="contained"
          startIcon={<PaymentIcon />}
          onClick={() => onRecordPayment(summary)}
          disabled={loading}
          sx={{ mt: 1, mb: 2 }}
        >
          {t("recordPayment")}
        </AppButton>
      )}
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          mt: summary.status === "PAID" ? 0 : 1,
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        {t("paymentHistory")}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 500 }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              {[
                "date",
                "paymentAmount",
                "paymentMethod",
                "transferReferenceNumber",
              ].map((key) => (
                <TableCell key={key} sx={{ fontWeight: 600 }}>
                  {t(key)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.paymentDate}</TableCell>
                <TableCell>{formatAmount(transaction.amount)}</TableCell>
                <TableCell>
                  {t(
                    transaction.paymentMethod === "CASH" ? "cash" : "transfer",
                  )}
                </TableCell>
                <TableCell>{transaction.referenceNumber ?? "-"}</TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t("noPaymentsRecorded")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
