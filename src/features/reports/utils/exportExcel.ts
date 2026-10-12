import { Workbook } from "exceljs";
import type { ExportReportOptions } from "./export.types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToExcel<T>({
  title,
  filename,
  columns,
  data,
  filterInfo,
  isRtl = false,
  t,
}: ExportReportOptions<T>): Promise<void> {
  const workbook = new Workbook();
  workbook.creator = "Construction Management";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(title.slice(0, 31), {
    views: [{ rightToLeft: isRtl }],
  });

  // Title Row
  const titleRow = worksheet.addRow([title]);
  titleRow.height = 28;
  titleRow.getCell(1).font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "FF244A64" },
  };
  titleRow.getCell(1).alignment = {
    vertical: "middle",
    horizontal: isRtl ? "right" : "left",
  };

  // Applied Filters / Metadata Row
  if (
    filterInfo?.projectName ||
    filterInfo?.dateRange ||
    filterInfo?.items ||
    filterInfo?.metadataText
  ) {
    const metaParts: string[] = [];
    if (filterInfo.projectName) {
      metaParts.push(
        `${t("reports:projectFilter", t("project", "Project"))}: ${filterInfo.projectName}`,
      );
    }
    if (filterInfo.dateRange) {
      metaParts.push(
        `${t("reports:dateFilterLabel", t("dateRange", "Date Range"))}: ${filterInfo.dateRange}`,
      );
    }
    if (filterInfo.items && filterInfo.items.length > 0) {
      metaParts.push(...filterInfo.items);
    } else if (filterInfo.metadataText) {
      metaParts.push(filterInfo.metadataText);
    }
    if (metaParts.length > 0) {
      const filterRow = worksheet.addRow([metaParts.join("   |   ")]);
      filterRow.height = 20;
      filterRow.getCell(1).font = {
        name: "Arial",
        size: 9.5,
        italic: true,
        color: { argb: "FF64748B" },
      };
      filterRow.getCell(1).alignment = {
        vertical: "middle",
        horizontal: isRtl ? "right" : "left",
      };
    }
  }

  // Blank spacing row
  worksheet.addRow([]);

  // Header Row
  const headerValues = columns.map((col) => col.header);
  const headerRow = worksheet.addRow(headerValues);
  headerRow.height = 26;

  headerRow.eachCell((cell, colIndex) => {
    const colDef = columns[colIndex - 1];
    cell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF244A64" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: colDef?.align || (isRtl ? "right" : "left"),
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // Data Rows
  data.forEach((row, rowIndex) => {
    const rowValues = columns.map((col) => col.getExcelValue(row));
    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 22;

    const isEven = rowIndex % 2 === 1;

    dataRow.eachCell((cell, colIndex) => {
      const colDef = columns[colIndex - 1];
      cell.font = { name: "Arial", size: 9.5 };

      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }

      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      if (colDef?.type === "number") {
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (typeof cell.value === "number") {
          cell.numFmt = Number.isInteger(cell.value) ? "#,##0" : "#,##0.00";
        }
      } else if (colDef?.type === "date") {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = {
          vertical: "middle",
          horizontal: colDef?.align || (isRtl ? "right" : "left"),
        };
      }
    });
  });

  // Calculate & Set Column Widths
  columns.forEach((col, index) => {
    const colNumber = index + 1;
    let maxLen = col.header.length;
    data.forEach((row) => {
      const val = col.getExcelValue(row);
      const strVal = val != null ? String(val) : "";
      if (strVal.length > maxLen) {
        maxLen = strVal.length;
      }
    });
    worksheet.getColumn(colNumber).width = Math.max(maxLen + 4, col.width || 14);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`,
  );
}
