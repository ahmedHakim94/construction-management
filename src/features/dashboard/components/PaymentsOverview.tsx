import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCard, AppCustomTable, type AppTableColDef } from "@/components/ui";
import { Chip, Typography } from "@mui/material";
import type { DashboardPayment } from "../types";

export interface PaymentsOverviewProps {
  payments: DashboardPayment[];
  isLoading: boolean;
}

const statusChipProps = {
  PAID: {
    label: "statusPaid",
    color: "#f0fdf4",
    textColor: "#16a34a",
    border: "#bbf7d0",
  },
  PARTIALLY_PAID: {
    label: "statusPartiallyPaid",
    color: "#fffbeb",
    textColor: "#d97706",
    border: "#fde68a",
  },
  UNPAID: {
    label: "statusUnpaid",
    color: "#fff5f5",
    textColor: "#dc2626",
    border: "#fecaca",
  },
} as const;

export function PaymentsOverview({
  payments,
  isLoading,
}: PaymentsOverviewProps) {
  const { t } = useTranslation(["dashboard", "payments"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "projectName",
        headerName: t("payments:project"),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "contractorName",
        headerName: t("payments:contractor"),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "period",
        headerName: t("payments:period"),
        flex: 1.8,
        minWidth: 180,
        renderCell: ({ row }: any) => `${row.startDate} - ${row.endDate}`,
      },
      {
        field: "netAmount",
        headerName: t("payments:netAmount"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "",
      },
      {
        field: "paidAmount",
        headerName: t("payments:paidAmount"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "",
      },
      {
        field: "remainingAmount",
        headerName: t("payments:remainingAmount"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "",
      },
      {
        field: "status",
        headerName: t("payments:status"),
        flex: 1.2,
        minWidth: 130,
        headerAlign: "center",
        align: "center",
        renderCell: ({ value }: any) => {
          const chip = statusChipProps[value as keyof typeof statusChipProps];
          if (!chip) return null;
          return (
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
          );
        },
      },
    ],
    [t],
  );

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}
      >
        {t("payments:payments")}
      </Typography>
      <AppCustomTable rows={payments} columns={columns} loading={isLoading} />
    </AppCard>
  );
}
