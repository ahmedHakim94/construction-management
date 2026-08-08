import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { Payment } from "../types";

interface PaymentRow extends Payment {
  contractorName: string;
  period: string;
}

interface PaymentsTableProps {
  rows: PaymentRow[];
  onView: (payment: PaymentRow) => void;
  onEdit?: (payment: PaymentRow) => void;
  onDelete: (payment: PaymentRow) => void;
}

export function PaymentsTable({ rows, onView, onEdit, onDelete }: PaymentsTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "contractorName",
        headerName: t("contractor"),
        flex: 1.4,
        minWidth: 180,
      },
      {
        field: "period",
        headerName: t("period"),
        flex: 1.6,
        minWidth: 200,
      },
      {
        field: "grossAmount",
        headerName: t("grossAmount"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "totalDeductions",
        headerName: t("totalDeductions"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "netAmount",
        headerName: t("netAmount"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "paidAmount",
        headerName: t("paidAmount"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "remainingAmount",
        headerName: t("remainingAmount"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "createdAt",
        headerName: t("createdDate"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "statusLabel",
        headerName: t("status"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 1.2,
        minWidth: 150,
        renderCell: ({ row }: any) => (
          <AppActions
            onView={() => onView(row)}
            onEdit={onEdit ? () => onEdit(row) : undefined}
            onDelete={() => onDelete(row)}
            viewTooltip={t("view")}
            editTooltip={t("recordPayment")}
            deleteTooltip={t("delete")}
          />
        ),
      },
    ],
    [t, onView, onEdit, onDelete],
  );

  return <AppTable rows={rows} columns={columns} />;
}
