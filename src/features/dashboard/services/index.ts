export interface DashboardStats { projects: number; contractors: number; equipment: number; workingHours: number }
export interface DashboardFinancials { totalCost: number; totalDeductions: number; totalDues: number; totalPaid: number; remainingAmount: number }
export interface DashboardProjectWork { projectId: number; projectName: string; workingHours: number; totalCost: number; totalDeductions: number; netAmount: number }
export interface DashboardDailyWork { id: number; date: string; projectId: number; projectName: string; contractorId: number; contractorName: string; isExternal: number | boolean; equipmentId: number | null; equipmentTypeName: string | null; temporaryEquipmentName: string | null; taskId: number; taskName: string; startTime: string; endTime: string; workingMinutes: number; workingHours: number; cost: number; deduction: number; netAmount: number; equipmentName: string }
export interface DashboardSummary { stats: DashboardStats; financials: DashboardFinancials; workByProject: DashboardProjectWork[]; recentDailyWork: DashboardDailyWork[] }
export interface DashboardSummaryResponse { success: boolean; statusCode: number; data: DashboardSummary }
