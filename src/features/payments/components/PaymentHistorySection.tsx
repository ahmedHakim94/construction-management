import { useMemo } from "react";
import dayjs from "dayjs";
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
import { notify } from "@/shared/utils/notify";
import { ExportButtonMenu } from "@/features/reports/components/ExportButtonMenu";
import { exportToExcel } from "@/features/reports/utils/exportExcel";
import { exportToPdf } from "@/features/reports/utils/exportPdf";
import type { ExportColumnDef } from "@/features/reports/utils/export.types";
import type {
  PaymentDetails,
  PaymentSummary,
  PaymentTransaction,
} from "../types";
import { formatAmount } from "../utils";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

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
  const { t, i18n } = useTranslation(["payments", "reports", "common"]);
  const isRtl = i18n.language === "ar" || i18n.dir() === "rtl";

  const { hasPermission } = usePermissions();
  const canRecordPayment =
    hasPermission("payments.create") || hasPermission("payments.edit");

  const paymentColumns: ExportColumnDef<PaymentTransaction>[] = useMemo(
    () => [
      {
        header: t("date"),
        key: "paymentDate",
        width: 16,
        align: "center",
        type: "date",
        getExcelValue: (row) => row.paymentDate,
        getPdfValue: (row) => row.paymentDate || "-",
      },
      {
        header: t("paymentAmount"),
        key: "amount",
        width: 18,
        align: "right",
        type: "number",
        getExcelValue: (row) => Number(row.amount) || 0,
        getPdfValue: (row) => formatAmount(row.amount),
      },
      {
        header: t("paymentMethod"),
        key: "paymentMethod",
        width: 16,
        align: "center",
        type: "string",
        getExcelValue: (row) =>
          t(row.paymentMethod === "CASH" ? "cash" : "transfer"),
        getPdfValue: (row) =>
          t(row.paymentMethod === "CASH" ? "cash" : "transfer"),
      },
      {
        header: t("transferReferenceNumber"),
        key: "referenceNumber",
        width: 22,
        align: "center",
        type: "string",
        getExcelValue: (row) => row.referenceNumber ?? "-",
        getPdfValue: (row) => row.referenceNumber ?? "-",
      },
    ],
    [t],
  );

  const filterInfo = useMemo(() => {
    const items: string[] = [];
    if (summary.contractorName) {
      items.push(`${t("contractor")}: ${summary.contractorName}`);
    }
    if (summary.projectName) {
      items.push(`${t("project")}: ${summary.projectName}`);
    }
    if (summary.year && summary.month) {
      items.push(
        `${t("period")}: ${summary.year}/${String(summary.month).padStart(2, "0")}`,
      );
    }
    return { items };
  }, [summary, t]);

  const handleExportExcel = async () => {
    if (transactions.length === 0) return;
    try {
      const sanitizedContractor = summary.contractorName
        ? `${summary.contractorName.replace(/[\\/:*?"<>|]/g, "_")}_`
        : "";
      await exportToExcel({
        title: t("paymentHistory"),
        filename: `${t("paymentHistory")}_${sanitizedContractor}${dayjs().format("YYYY-MM-DD")}`,
        columns: paymentColumns,
        data: transactions,
        filterInfo,
        isRtl,
        t,
      });
    } catch (error) {
      console.error(error);
      notify.error(t("common:somethingWentWrong", t("somethingWentWrong")));
    }
  };

  const handleExportPdf = async () => {
    if (transactions.length === 0) return;
    try {
      const sanitizedContractor = summary.contractorName
        ? `${summary.contractorName.replace(/[\\/:*?"<>|]/g, "_")}_`
        : "";
      await exportToPdf({
        title: t("paymentHistory"),
        filename: `${t("paymentHistory")}_${sanitizedContractor}${dayjs().format("YYYY-MM-DD")}`,
        columns: paymentColumns,
        data: transactions,
        filterInfo,
        isRtl,
        t,
      });
    } catch (error) {
      console.error(error);
      notify.error(t("common:somethingWentWrong", t("somethingWentWrong")));
    }
  };

  return (
    <Box>
      {canRecordPayment && summary.status !== "PAID" && (
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
          mt: summary.status === "PAID" ? 0 : 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {t("paymentHistory")}
        </Typography>
        <ExportButtonMenu
          disabled={loading || transactions.length === 0}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
        />
      </Box>
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
