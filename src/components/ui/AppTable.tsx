import { Box, Typography, useTheme, type Theme } from "@mui/material";
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
} from "@mui/x-data-grid";
import { arSD, enUS } from "@mui/x-data-grid/locales";
import { useTranslation } from "react-i18next";
import type { TablePaginationProps } from "@/types";
import { useMemo, useRef } from "react";

export type AppTableColDef = GridColDef;

export interface AppTableProps extends Omit<
  DataGridProps,
  "pagination" | "paginationModel" | "onPaginationModelChange"
> {
  showPagination?: boolean;
  pagination?: TablePaginationProps;
  emptyMessage?: string;
}

const getTableStyles = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",

  // Header
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: "44px !important",
  },

  "& .MuiDataGrid-columnHeader": {
    justifyContent: "center",
  },

  "& .MuiDataGrid-columnHeaderTitle": {
    width: "100%",
    textAlign: "center",
    fontWeight: 600,
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    marginInlineStart: "8px",
    letterSpacing: "0.01em",
  },

  // Cells
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontVariantNumeric: "tabular-nums",
  },

  // Hover & selection
  "& .MuiDataGrid-row:hover": {
    backgroundColor: theme.palette.background.default,
  },

  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: theme.palette.action.hover,
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  },

  // Focus cleanup
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none",
  },

  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
    {
      outline: "none",
    },

  // Footer
  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    minHeight: 48,
  },

  // Pagination
  "& .MuiTablePagination-actions": {
    direction: "ltr",
  },
  "& .MuiTablePagination-toolbar": {
    width: "100%",
    // justifyContent: "flex-start",
    direction: theme.direction,
    padding: "0px",
  },

  "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel": {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    fontVariantNumeric: "tabular-nums",
    direction: "ltr",
  },

  // Empty state overlay
  "& .MuiDataGrid-overlay": {
    backgroundColor: "transparent",
  },
});

function CustomNoRowsOverlay({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 120,
        p: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {message || t("noDataAvailable", "No data available")}
      </Typography>
    </Box>
  );
}

export function AppTable({
  sx,
  pagination,
  showPagination,
  loading = false,
  emptyMessage,
  slots,
  slotProps,
  getRowId = (row: any) => row.id ?? row._id ?? row.code,
  ...props
}: AppTableProps) {
  const { i18n } = useTranslation();
  const theme = useTheme();

  const rowCountRef = useRef(0);

  const rowCount = useMemo(() => {
    if (!loading && pagination) {
      rowCountRef.current = pagination.total;
    }

    return rowCountRef.current;
  }, [loading, pagination?.total]);

  const localeText =
    i18n.language === "ar"
      ? arSD.components.MuiDataGrid.defaultProps.localeText
      : enUS.components.MuiDataGrid.defaultProps.localeText;

  const isPaginationActive = Boolean(pagination) || (showPagination ?? false);

  const paginationProps = pagination
    ? {
        paginationMode: "server" as const,
        rowCount,
        paginationModel: {
          page: Math.max(pagination.page - 1, 0),
          pageSize: pagination.limit,
        },
        pageSizeOptions: [pagination.limit],
        onPaginationModelChange: (model: {
          page: number;
          pageSize: number;
        }) => {
          if (model.page + 1 !== pagination.page) {
            pagination.onPageChange(model.page + 1);
          }
        },
        slotProps: {
          ...slotProps,
          pagination: {
            rowsPerPageOptions: [],
            ...slotProps?.pagination,
          },
        },
      }
    : {
        hideFooter: !isPaginationActive,
        hideFooterPagination: !isPaginationActive,
        initialState: {
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 10,
            },
          },
        },
        slotProps,
      };

  return (
    <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      <DataGrid
        autoHeight
        disableRowSelectionOnClick
        localeText={localeText}
        loading={loading}
        getRowId={getRowId}
        slots={{
          noRowsOverlay: () => <CustomNoRowsOverlay message={emptyMessage} />,
          ...slots,
        }}
        sx={{
          ...getTableStyles(theme),
          ...sx,
        }}
        {...paginationProps}
        {...props}
      />
    </Box>
  );
}
