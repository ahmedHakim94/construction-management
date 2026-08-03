import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import type { Contractor } from "../types";

interface ContractorsTableProps {
  rows: Contractor[];
  onEdit: (contractor: Contractor) => void;
  onDelete: (contractor: Contractor) => void;
}

export function ContractorsTable({ rows, onEdit, onDelete }: ContractorsTableProps) {
  const columns: GridColDef<Contractor>[] = [
    { field: "code", headerName: "Code", flex: 1, minWidth: 120 },
    { field: "name", headerName: "Name", flex: 1.2, minWidth: 180 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 140 },
    { field: "address", headerName: "Address", flex: 1.3, minWidth: 200 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => (
        <Chip label={String(params.value)} color={params.value === "ACTIVE" ? "success" : "default"} size="small" />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 1,
      minWidth: 140,
      valueGetter: (value) => value,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      flex: 0.8,
      minWidth: 110,
      renderCell: (params) => {
        const row = params.row as Contractor;

        return (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(row)}>
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        Contractors
      </Typography> */}
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        sx={{ border: 0, borderRadius: 2 }}
      />
    </div>
  );
}
