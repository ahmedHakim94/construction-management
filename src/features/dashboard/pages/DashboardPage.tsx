import { AppBadge, AppCard, AppPageContainer, AppPageHeader, AppTable, type AppTableColDef } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";

interface DashboardRow {
  id: number;
  item: string;
  status: string;
}

const columns: AppTableColDef<DashboardRow>[] = [
  { field: "item", headerName: "Item", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 },
];

const rows: DashboardRow[] = [
  { id: 1, item: "Budget review", status: "Pending" },
  { id: 2, item: "Site inspection", status: "Scheduled" },
];

export function DashboardPage() {
  return (
    <PageContainer>
      <AppPageContainer sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AppPageHeader title="Dashboard" description="Dashboard placeholder page" actions={<AppBadge label="Draft" color="default" />} />
        <AppCard>Overview placeholder</AppCard>
        <AppCard>Activity placeholder</AppCard>
        <AppCard>
          <AppTable rows={rows} columns={columns} />
        </AppCard>
      </AppPageContainer>
    </PageContainer>
  );
}
