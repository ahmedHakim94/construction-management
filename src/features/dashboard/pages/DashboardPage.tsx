import { AppBadge, AppCard, AppPageContainer, AppPageHeader, AppTable } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import type { ColumnDef } from "@tanstack/react-table";

interface DashboardRow {
  id: number;
  item: string;
  status: string;
}

const columns: ColumnDef<DashboardRow>[] = [
  { accessorKey: "item", header: "Item" },
  { accessorKey: "status", header: "Status" },
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
          <AppTable data={rows} columns={columns} />
        </AppCard>
      </AppPageContainer>
    </PageContainer>
  );
}
