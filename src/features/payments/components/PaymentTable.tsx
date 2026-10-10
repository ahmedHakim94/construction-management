import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { PaymentSummary } from "../types";
import type { TablePaginationProps } from "@/types";
import { AppActions } from "@/components/ui/AppActions";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, IconButton, Tooltip } from "@mui/material";

interface PaymentTableProps {
  rows: PaymentSummary[];
  loading?: boolean;
  onEdit: (task: PaymentSummary) => void;
  onDelete: (task: PaymentSummary) => void;
  onView: (payment: PaymentSummary) => void;
  pagination?: TablePaginationProps;
}

export function PaymentTable({
  rows,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onView,
}: PaymentTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "projectName",
        headerName: t("project"),
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "contractorName",
        headerName: t("contractor"),
        flex: 1.4,
        minWidth: 180,
      },
      {
        field: "period",
        headerName: t("period"),
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) =>
          `${String(row.month).padStart(2, "0")}/${row.year}`,
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
        field: "status",
        headerName: t("status"),
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => {
          switch (row.status) {
            case "PAID":
              return t("paid");

            case "PARTIALLY_PAID":
              return t("partiallyPaid");

            default:
              return t("unpaid");
          }
        },
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }: { row: PaymentSummary }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={t("viewDetails")}>
              <IconButton
                size="small"
                color="primary"
                aria-label={t("viewDetails")}
                onClick={() => onView(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <AppActions
              onEdit={() => onEdit(row)}
              // onDelete={() => onDelete(row)}
            />
          </Box>
        ),
      },
    ],
    [t, onView, onEdit, onDelete],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
      getRowId={(row) =>
        `${row.contractorId}-${row.projectId}-${row.year}-${row.month}`
      }
      getRowClassName={({ row }) => {
        if (row.status === "PAID") return "row-paid";
        if (row.status === "PARTIALLY_PAID") {
          return "row-partially-paid";
        }

        return "row-unpaid";
      }}
      sx={{
        "& .row-paid": {
          bgcolor: "success.light",
        },
        "& .row-paid:hover": {
          bgcolor: "success.light",
          filter: "brightness(0.97)",
        },
        "& .row-partially-paid": {
          bgcolor: "warning.light",
        },
        "& .row-partially-paid:hover": {
          bgcolor: "warning.light",
          filter: "brightness(0.97)",
        },
        "& .row-unpaid": {
          bgcolor: "error.light",
        },
        "& .row-unpaid:hover": {
          bgcolor: "error.light",
          filter: "brightness(0.97)",
        },
      }}
    />
  );
}
