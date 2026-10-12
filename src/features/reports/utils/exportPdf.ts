import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExportReportOptions } from "./export.types";

// Cached Base64 font data for jsPDF
let cachedFonts: { regular: string; bold: string } | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return window.btoa(binary);
}

export async function loadPdfFonts(): Promise<{
  regular: string;
  bold: string;
}> {
  if (cachedFonts) return cachedFonts;

  const [regRes, boldRes] = await Promise.all([
    fetch("/fonts/Amiri-Regular.ttf"),
    fetch("/fonts/Amiri-Bold.ttf"),
  ]);

  if (!regRes.ok || !boldRes.ok) {
    throw new Error("Failed to load PDF Arabic fonts");
  }

  const [regBuf, boldBuf] = await Promise.all([
    regRes.arrayBuffer(),
    boldRes.arrayBuffer(),
  ]);

  cachedFonts = {
    regular: arrayBufferToBase64(regBuf),
    bold: arrayBufferToBase64(boldBuf),
  };

  return cachedFonts;
}

export async function exportToPdf<T>({
  title,
  filename,
  columns,
  data,
  filterInfo,
  isRtl = false,
  t,
}: ExportReportOptions<T>): Promise<void> {
  const fonts = await loadPdfFonts();

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Register and set fonts
  doc.addFileToVFS("Amiri-Regular.ttf", fonts.regular);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.addFileToVFS("Amiri-Bold.ttf", fonts.bold);
  doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
  doc.setFont("Amiri", "normal");

  const processText = (text: string | null | undefined): string => {
    if (!text) return "";
    const str = String(text);
    return typeof (doc as any).processArabic === "function"
      ? (doc as any).processArabic(str)
      : str;
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Title
  doc.setFont("Amiri", "bold");
  doc.setFontSize(16);
  doc.setTextColor(36, 74, 100);

  const processedTitle = processText(title);
  if (isRtl) {
    doc.text(processedTitle, pageWidth - margin, 16, { align: "right" });
  } else {
    doc.text(processedTitle, margin, 16);
  }

  // Metadata: Export Date & Applied Filters
  doc.setFont("Amiri", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const exportDateLine = `${t("reports:exportDate")}: ${dateStr}`;
  const processedExportDate = processText(exportDateLine);

  let filterLine = "";
  if (filterInfo?.projectName) {
    filterLine += `${t("reports:projectFilter", t("project", "Project"))}: ${filterInfo.projectName}`;
  }
  if (filterInfo?.dateRange) {
    filterLine +=
      (filterLine ? "   |   " : "") +
      `${t("reports:dateFilterLabel", t("dateRange", "Date Range"))}: ${filterInfo.dateRange}`;
  }
  if (filterInfo?.items && filterInfo.items.length > 0) {
    filterLine +=
      (filterLine ? "   |   " : "") + filterInfo.items.join("   |   ");
  } else if (filterInfo?.metadataText) {
    filterLine +=
      (filterLine ? "   |   " : "") + filterInfo.metadataText;
  }
  const processedFilterLine = processText(filterLine);

  if (isRtl) {
    doc.text(processedExportDate, margin, 16, { align: "left" });
    if (processedFilterLine) {
      doc.text(processedFilterLine, pageWidth - margin, 22, { align: "right" });
    }
  } else {
    doc.text(processedExportDate, pageWidth - margin, 16, { align: "right" });
    if (processedFilterLine) {
      doc.text(processedFilterLine, margin, 22);
    }
  }

  // Columns & Data Ordering:
  // In RTL, reversing the column array places the first table column on the right edge!
  const effectiveColumns = isRtl ? [...columns].reverse() : columns;

  const tableHead = [effectiveColumns.map((col) => processText(col.header))];
  const tableBody = data.map((row) =>
    effectiveColumns.map((col) => processText(col.getPdfValue(row))),
  );

  const columnStyles: Record<number, any> = {};
  effectiveColumns.forEach((col, idx) => {
    let halign: "left" | "right" | "center" = "left";
    if (col.type === "number") {
      halign = "right";
    } else if (col.type === "date") {
      halign = "center";
    } else if (isRtl) {
      halign = "right";
    } else {
      halign = col.align || "left";
    }
    columnStyles[idx] = { halign };
  });

  autoTable(doc, {
    startY: filterLine ? 26 : 21,
    margin: { left: margin, right: margin, top: 20, bottom: 15 },
    showHead: "everyPage",
    styles: {
      font: "Amiri",
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      font: "Amiri",
      fontStyle: "bold",
      fontSize: 9,
      fillColor: [36, 74, 100],
      textColor: [255, 255, 255],
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles,
    head: tableHead,
    body: tableBody,
    didDrawPage: () => {
      const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
      const totalPages = (doc as any).internal.getNumberOfPages();
      const pageStr = isRtl
        ? processText(`${t("reports:page", "صفحة")} ${pageNumber} / ${totalPages}`)
        : `${t("reports:page", "Page")} ${pageNumber} of ${totalPages}`;

      doc.setFont("Amiri", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(pageStr, pageWidth / 2, pageHeight - 7, { align: "center" });
    },
  });

  doc.save(`${filename}.pdf`);
}
