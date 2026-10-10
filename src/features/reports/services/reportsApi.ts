import { baseApi } from "@/core/api/baseApi";
import type { ProjectReportSummary, ReportSummary, DailyWorkReport, ContractorReport } from "../types";
export interface ReportsResponse {
  projects: {id:number;name:string}[];
  summary:ReportSummary;
  reports:ProjectReportSummary[];
  dailyWorkReports:DailyWorkReport[];
  contractorReports:ContractorReport[];
}
export const reportsApi=baseApi.injectEndpoints({endpoints:(builder)=>({
  getReports:builder.query<{success:boolean;data:ReportsResponse},{projectId?:string;dateFrom?:string;dateTo?:string}>({
    query:(params)=>({url:"/reports/summary",params:Object.fromEntries(Object.entries(params).filter(([,v])=>Boolean(v)))}),
  }),
})});
export const {useGetReportsQuery}=reportsApi;
