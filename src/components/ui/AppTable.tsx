import { Box, useTheme, type Theme } from "@mui/material";
import { DataGrid, type DataGridProps, type GridColDef } from "@mui/x-data-grid";
import { arSD, enUS } from "@mui/x-data-grid/locales";
import { useTranslation } from "react-i18next";

export type AppTableColDef = GridColDef;

type AppTableProps = DataGridProps & {
  showPagination?: boolean;
};

const getTableStyles = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  // borderRadius: theme.shape.borderRadius,
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

  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
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

  "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel": {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    fontVariantNumeric: "tabular-nums",
  },
});

export function AppTable({
  sx,
  pageSizeOptions = [10, 25, 50],
  showPagination = true,
  ...props
}: AppTableProps) {
  const { i18n } = useTranslation();
  const theme = useTheme();

  const localeText =
    i18n.language === "ar"
      ? arSD.components.MuiDataGrid.defaultProps.localeText
      : enUS.components.MuiDataGrid.defaultProps.localeText;

  return (
    <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      <DataGrid
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={pageSizeOptions}
        localeText={localeText}
        pagination
        hideFooter={!showPagination}
        hideFooterPagination={!showPagination}
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 10,
            },
          },
        }}
        sx={{
          ...getTableStyles(theme),
          ...sx,
        }}
        {...props}
      />
    </Box>
  );
}