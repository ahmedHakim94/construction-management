import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Today } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { AppFilters } from "@/components/ui/AppFilters";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { useDialog } from "@/hooks/useDialog";

import {
  DailyWorkTable,
  type DailyWorkRow,
} from "../components/DailyWorkTable";
import { DailyWorkDialog } from "../components/DailyWorkDialog";
import {
  useCreateDailyWorkMutation,
  useDeleteDailyWorkMutation,
  useGetDailyWorkQuery,
  useUpdateDailyWorkMutation,
} from "../services/dailyWork.api";

import type { DailyWork, CreateDailyWorkPayload } from "../types";
import { toast } from "react-toastify";

export function DailyWorkPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(1);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedRecord, setSelectedRecord] = useState<DailyWorkRow>();

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: dailyWorkData,
    isLoading,
    isFetching,
    isError,
  } = useGetDailyWorkQuery({
    page,
    limit,
    search: debouncedSearch,
    date: selectedDate?.format("YYYY-MM-DD"),
  });

  const [addWorkDaily] = useCreateDailyWorkMutation();
  const [updateWorkDaily] = useUpdateDailyWorkMutation();
  const [deleteWorkDaily] = useDeleteDailyWorkMutation();

  const total = dailyWorkData?.pagination?.total ?? 0;

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedRecord(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (record: DailyWorkRow) => {
    setMode("edit");
    setSelectedRecord(record);
    dialog.openDialog();
  };

  const handleOpenDelete = (record: DailyWorkRow) => {
    setSelectedRecord(record);
    deleteDialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedRecord(undefined);
  };

  const handleCloseDelete = () => {
    deleteDialog.closeDialog();
    setSelectedRecord(undefined);
  };

  const handleSubmit = async (
    values: CreateDailyWorkPayload,
  ): Promise<void> => {
    if (mode === "create") {
      try {
        await addWorkDaily(values).unwrap();

        toast.success("Daily work added successfully");
        handleCloseDialog();
      } catch (error) {
        toast.error("Failed to add daily work");
        console.error(error);
        throw error;
      }
    } else {
      if (!selectedRecord) return;

      try {
        await updateWorkDaily({
          id: selectedRecord.id,
          payload: values,
        }).unwrap();

        toast.success("Daily work updated successfully");
        handleCloseDialog();
      } catch (error) {
        toast.error("Failed to update daily work");
        console.error(error);
        throw error;
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      await deleteWorkDaily(selectedRecord.id).unwrap();
      toast.success("Daily work deleted successfully");
      handleCloseDelete();
    } catch (error) {
      toast.error("Failed to delete daily work");
      console.error(error);
      throw error;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDateChange = (value: Dayjs | null) => {
    setSelectedDate(value);
    setPage(1);
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("dailyWork")}
          description={t("dailyWorkDescription")}
          actions={
            <AppButton
              variant="contained"
              startIcon={<Today />}
              onClick={handleOpenCreate}
            >
              {t("addDailyWork")}
            </AppButton>
          }
        />

        <AppFilters>
          <AppSearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder={t("searchDailyWork")}
          />

          <AppDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            label={t("date")}
          />
        </AppFilters>

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <DailyWorkTable
            rows={dailyWorkData?.data ?? []}
            loading={isLoading || isFetching}
            pagination={{
              page,
              limit,
              total,
              totalPages: dailyWorkData?.pagination?.totalPages ?? 0,
              onPageChange: setPage,
            }}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </AppCard>
      </Box>

      <DailyWorkDialog
        open={dialog.open}
        mode={mode}
        dailyWork={selectedRecord}
        projects={[]}
        contractors={[]}
        equipment={[]}
        tasks={[]}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={"هل انت متأكد ؟"}
        message={
          <>
            سيتم حذف هذا السجل نهائياً
          </>
        }
        confirmText={t("delete")}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
