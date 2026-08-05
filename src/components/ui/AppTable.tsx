import { DataGrid, type DataGridProps } from "@mui/x-data-grid";
import { arSD, enUS } from "@mui/x-data-grid/locales";
import { useTranslation } from "react-i18next";

const defaultTableStyles = {
  border: 0,
  borderRadius: 4,
  backgroundColor: "#fff",

  // Header
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#F8FAFC",
    borderBottom: "1px solid #E5E7EB",
  },

  "& .MuiDataGrid-columnHeader": {
    justifyContent: "center",
  },

  "& .MuiDataGrid-columnHeaderTitle": {
    width: "100%",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "14px",
    color: "#334155",
    marginInlineStart: "10px",
  },

  // Cells
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #F1F5F9",
    fontSize: "14px",
    color: "#1E293B",
  },

  // Hover
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#F8FAFC",
  },

  // Remove focus
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none",
  },

  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
    {
      outline: "none",
    },

  // Footer
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #E5E7EB",
  },

  // Pagination arrows
  "& .MuiTablePagination-actions": {
    direction: "ltr",
  },
};

export function AppTable({
  sx,
  pageSizeOptions = [10, 25, 50],
  ...props
}: DataGridProps) {
  const { i18n } = useTranslation();

  const localeText =
    i18n.language === "ar"
      ? arSD.components.MuiDataGrid.defaultProps.localeText
      : enUS.components.MuiDataGrid.defaultProps.localeText;

  return (
    <DataGrid
      autoHeight
      disableRowSelectionOnClick
      pageSizeOptions={pageSizeOptions}
      localeText={localeText}
      initialState={{
        pagination: {
          paginationModel: {
            page: 0,
            pageSize: 10,
          },
        },
      }}
      sx={{
        ...defaultTableStyles,
        ...sx,
      }}
      {...props}
    />
  );
}