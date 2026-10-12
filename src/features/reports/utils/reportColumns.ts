import type { TFunction } from "i18next";
import type {
  ProjectReportSummary,
  DailyWorkReport,
  ContractorReport,
} from "../types";
import type { ExportColumnDef } from "./export.types";

// Column definitions for Projects Report
export function getProjectsReportColumns(
  t: TFunction,
): ExportColumnDef<ProjectReportSummary>[] {
  return [
    {
      header: t("dailyWork:project"),
      key: "projectName",
      width: 25,
      type: "string",
      align: "left",
      getExcelValue: (row) => row.projectName,
      getPdfValue: (row) => row.projectName || "",
    },
    {
      header: t("dailyWork:workingHours"),
      key: "totalWorkingHours",
      width: 16,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.totalWorkingHours,
      getPdfValue: (row) =>
        t("dashboard:workingHoursFormat", { hours: row.totalWorkingHours }),
    },
    {
      header: t("reports:totalWorkCost"),
      key: "totalWorkCost",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.totalWorkCost,
      getPdfValue: (row) => row.totalWorkCost?.toLocaleString() ?? "0",
    },
    {
      header: t("reports:totalPaidAmount"),
      key: "totalPaidAmount",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.totalPaidAmount,
      getPdfValue: (row) => row.totalPaidAmount?.toLocaleString() ?? "0",
    },
    {
      header: t("reports:remainingBalance"),
      key: "remainingBalance",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.remainingBalance,
      getPdfValue: (row) => row.remainingBalance?.toLocaleString() ?? "0",
    },
  ];
}

// Column definitions for Daily Work Report
export function getDailyWorkReportColumns(
  t: TFunction,
): ExportColumnDef<DailyWorkReport>[] {
  return [
    {
      header: t("dailyWork:date"),
      key: "date",
      width: 14,
      type: "date",
      align: "center",
      getExcelValue: (row) => row.date,
      getPdfValue: (row) => row.date || "",
    },
    {
      header: t("dailyWork:project"),
      key: "projectName",
      width: 22,
      type: "string",
      align: "left",
      getExcelValue: (row) => row.projectName,
      getPdfValue: (row) => row.projectName || "",
    },
    {
      header: t("dailyWork:contractor"),
      key: "contractorName",
      width: 22,
      type: "string",
      align: "left",
      getExcelValue: (row) =>
        row.isExternal
          ? `${row.contractorName} (${t("dailyWork:external")})`
          : row.contractorName,
      getPdfValue: (row) =>
        row.isExternal
          ? `${row.contractorName} (${t("dailyWork:external")})`
          : row.contractorName || "",
    },
    {
      header: t("dailyWork:equipment"),
      key: "equipmentName",
      width: 18,
      type: "string",
      align: "left",
      getExcelValue: (row) => row.equipmentName,
      getPdfValue: (row) => row.equipmentName || "",
    },
    {
      header: t("dailyWork:task"),
      key: "taskName",
      width: 16,
      type: "string",
      align: "left",
      getExcelValue: (row) => row.taskName,
      getPdfValue: (row) => row.taskName || "",
    },
    {
      header: t("dailyWork:workingHours"),
      key: "workingHours",
      width: 15,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.workingHours,
      getPdfValue: (row) => row.workingHours?.toLocaleString() ?? "0",
    },
    {
      header: t("dailyWork:hourRate"),
      key: "hourRate",
      width: 14,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.hourRate,
      getPdfValue: (row) => row.hourRate?.toLocaleString() ?? "0",
    },
    {
      header: t("dailyWork:fuelConsumption"),
      key: "fuelConsumption",
      width: 16,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.fuelConsumption,
      getPdfValue: (row) => row.fuelConsumption?.toLocaleString() ?? "0",
    },
    {
      header: t("dailyWork:cost"),
      key: "cost",
      width: 14,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.cost,
      getPdfValue: (row) => row.cost?.toLocaleString() ?? "0",
    },
    {
      header: t("dailyWork:deduction"),
      key: "deduction",
      width: 14,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.deduction,
      getPdfValue: (row) => row.deduction?.toLocaleString() ?? "0",
    },
    {
      header: t("dailyWork:netAmount"),
      key: "netAmount",
      width: 15,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.netAmount,
      getPdfValue: (row) => row.netAmount?.toLocaleString() ?? "0",
    },
  ];
}

// Column definitions for Contractors Report
export function getContractorsReportColumns(
  t: TFunction,
): ExportColumnDef<ContractorReport>[] {
  return [
    {
      header: t("dailyWork:contractor"),
      key: "contractorName",
      width: 25,
      type: "string",
      align: "left",
      getExcelValue: (row) =>
        row.isExternal
          ? `${row.contractorName} (${t("dailyWork:external")})`
          : row.contractorName,
      getPdfValue: (row) =>
        row.isExternal
          ? `${row.contractorName} (${t("dailyWork:external")})`
          : row.contractorName || "",
    },
    {
      header: t("reports:totalWorkingHours"),
      key: "totalWorkingHours",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.totalWorkingHours,
      getPdfValue: (row) => row.totalWorkingHours?.toLocaleString() ?? "0",
    },
    {
      header: t("reports:totalWorkCost"),
      key: "totalCost",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.totalCost,
      getPdfValue: (row) => row.totalCost?.toLocaleString() ?? "0",
    },
    {
      header: t("reports:totalPaid"),
      key: "totalPaid",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.totalPaid,
      getPdfValue: (row) => row.totalPaid?.toLocaleString() ?? "0",
    },
    {
      header: t("reports:remaining"),
      key: "remaining",
      width: 18,
      type: "number",
      align: "right",
      getExcelValue: (row) => row.remaining,
      getPdfValue: (row) => row.remaining?.toLocaleString() ?? "0",
    },
  ];
}
