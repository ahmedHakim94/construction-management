import type { TFunction } from "i18next";

export interface ExportColumnDef<T> {
  header: string;
  key: string;
  width?: number;
  align?: "left" | "right" | "center";
  type?: "string" | "number" | "date";
  getExcelValue: (row: T) => any;
  getPdfValue: (row: T) => string;
}

export interface ExportReportOptions<T> {
  title: string;
  filename: string;
  columns: ExportColumnDef<T>[];
  data: T[];
  filterInfo?: {
    projectName?: string;
    dateRange?: string;
    items?: string[];
    metadataText?: string;
  };
  isRtl?: boolean;
  t: TFunction;
}
