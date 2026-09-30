import { useState } from "react";
import { Box } from "@mui/material";
import { Category } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { EquipmentTypeTable } from "../components/EquipmentTypeTable";
import { EquipmentTypeDialog } from "../components/EquipmentTypeDialog";
import type { EquipmentType, EquipmentTypeFormValues } from "../types";
import {
  useCreateEquipmentTypeMutation,
  useDeleteEquipmentTypeMutation,
  useGetEquipmentTypesQuery,
  useUpdateEquipmentTypeMutation,
} from "../services/equipmentType.api";

export function EquipmentTypePage() {
  const { t } = useTranslation();
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<
    EquipmentType | undefined
  >();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const { data: equipmentTypes = [] } = useGetEquipmentTypesQuery();
  const [addEquipmentType] = useCreateEquipmentTypeMutation();
  const [updateEquipmentType] = useUpdateEquipmentTypeMutation();
  const [deleteEquipmentType] = useDeleteEquipmentTypeMutation();

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedEquipmentType(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (equipmentType: EquipmentType) => {
    setMode("edit");
    setSelectedEquipmentType(equipmentType);
    dialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedEquipmentType(undefined);
  };

  const handleSubmit = async (values: EquipmentTypeFormValues) => {
    try {
      if (mode === "edit" && selectedEquipmentType) {
        await updateEquipmentType({
          id: selectedEquipmentType.id,
          data: values,
        }).unwrap();
        notify.success(t("updatedSuccessfully"));
      } else {
        await addEquipmentType(values).unwrap();
        notify.success(t("created successfully"));
      }

      handleCloseDialog();
    } catch {
      notify.error(t("something went wrong"));
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (!selectedEquipmentType) {
        return;
      }
      // await equipmentTypeService.delete(selectedEquipmentType.id);
      await deleteEquipmentType(selectedEquipmentType.id).unwrap();
      notify.success(t("deletedSuccessfully"));
      deleteDialog.closeDialog();
      setSelectedEquipmentType(undefined);
    } catch {
      notify.error(t("somethingWentWrong"));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("equipmentTypes")}
          description={t("equipmentTypesDescription")}
          actions={
            <>
              <AppButton
                variant="contained"
                startIcon={<Category />}
                onClick={handleOpenCreate}
              >
                {t("addEquipmentType")}
              </AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <EquipmentTypeTable
            rows={equipmentTypes}
            onEdit={handleOpenEdit}
            onDelete={(equipmentType) => {
              setSelectedEquipmentType(equipmentType);
              deleteDialog.openDialog();
            }}
          />
        </AppCard>
      </Box>

      <EquipmentTypeDialog
        open={dialog.open}
        mode={mode}
        equipmentType={selectedEquipmentType}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteEquipmentType")}
        message={
          <>
            {t("deleteEquipmentType")}
            <strong>{` ${selectedEquipmentType?.name} ?`}</strong>
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
