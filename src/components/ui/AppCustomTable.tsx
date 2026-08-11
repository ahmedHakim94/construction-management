import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
} from "@mui/material";
import type { AppTableColDef } from "./AppTable";

export interface AppCustomTableProps {
  rows: any[];
  columns: AppTableColDef[];
  loading?: boolean;
  noRowsLabel?: string;
}

export function AppCustomTable({
  rows,
  columns,
  loading = false,
  noRowsLabel = "No rows",
}: AppCustomTableProps) {
  return (
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
            {columns.map((col) => (
              <TableCell
                key={col.field}
                align={col.headerAlign || col.align || "left"}
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                  minWidth: col.minWidth,
                }}
              >
                {col.headerName ?? ""}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={col.field} align={col.align || "left"}>
                    <Skeleton
                      width={col.align === "right" || col.align === "center" ? "50px" : "80px"}
                      sx={{ display: "inline-block" }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">{noRowsLabel}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {columns.map((col) => {
                  const val = row[col.field];
                  return (
                    <TableCell key={col.field} align={col.align || "left"}>
                      {col.renderCell ? (col.renderCell as any)({ value: val, row, field: col.field }) : (val?.toLocaleString() ?? "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
