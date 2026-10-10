import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Construction } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { useDialog } from "@/hooks/useDialog";
import { EquipmentTable } from "../components/EquipmentTable";
import { EquipmentDialog } from "../components/EquipmentDialog";
import type { Equipment, EquipmentFormValues } from "../types";
import {
  useCreateEquipmentMutation,
  useDeleteEquipmentMutation,
  useGetEquipmentQuery,
  useUpdateEquipmentMutation,
} from "../services/equipment.api";

const LIMIT = 10;

export function EquipmentPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<
    Equipment | undefined
  >();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const { data, isLoading, isFetching } = useGetEquipmentQuery({
    page,
    limit: LIMIT,
    search: search.trim() || undefined,
  });
  const [addEquipment] = useCreateEquipmentMutation();
  const [editEquipment] = useUpdateEquipmentMutation();
  const [deleteEquipment] = useDeleteEquipmentMutation();

  const equipment = data?.data ?? [];
  const paginationMeta = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedEquipment(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (equipmentItem: Equipment) => {
    setMode("edit");
    setSelectedEquipment(equipmentItem);
    dialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedEquipment(undefined);
  };

  const handleSubmit = async (values: EquipmentFormValues) => {
    try {
      if (mode === "edit" && selectedEquipment) {
        await editEquipment({
          id: selectedEquipment.id,
          data: values,
        }).unwrap();
      } else {
        await addEquipment(values).unwrap();
      }

      handleCloseDialog();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      if (!selectedEquipment) {
        return;
      }

      await deleteEquipment(selectedEquipment.id).unwrap();
      if (equipment.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
      deleteDialog.closeDialog();
      setSelectedEquipment(undefined);
    } catch {
      // error handled globally
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("equipment")}
          description={t("equipmentDescription")}
          actions={
            <>
              <AppSearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={t("searchEquipment")}
              />
              <AppButton
                variant="contained"
                startIcon={<Construction />}
                onClick={handleOpenCreate}
              >
                {t("addEquipment")}
              </AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <EquipmentTable
            rows={equipment}
            loading={isLoading || isFetching}
            pagination={
              paginationMeta
                ? {
                    page,
                    limit: LIMIT,
                    total: paginationMeta.total,
                    totalPages: paginationMeta.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onEdit={handleOpenEdit}
            onDelete={(item) => {
              setSelectedEquipment(item);
              deleteDialog.openDialog();
            }}
          />
        </AppCard>
      </Box>

      <EquipmentDialog
        open={dialog.open}
        mode={mode}
        equipment={selectedEquipment}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteEquipment")}
        message={
          <>
            {t("deleteEquipment")}
            <strong>{` ${selectedEquipment?.model ?? selectedEquipment?.id ?? ""} ?`}</strong>
          </>
        }
        confirmText={t("delete")}
        onClose={deleteDialog.closeDialog}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </PageContainer>
  );
}

