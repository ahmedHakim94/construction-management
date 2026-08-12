import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { EquipmentTypeTable } from "../components/EquipmentTypeTable";
import { EquipmentTypeDialog } from "../components/EquipmentTypeDialog";
import { equipmentTypeService } from "../services/equipmentType.service";
import type { EquipmentType, EquipmentTypeFormValues } from "../types";

export function EquipmentTypePage() {
  const { t } = useTranslation();
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<
    EquipmentType | undefined
  >();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    async function loadData() {
      const data = await equipmentTypeService.getAll();
      setEquipmentTypes(data);
    }

    loadData();
  }, []);

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
        const updated = await equipmentTypeService.update(
          selectedEquipmentType.id,
          values,
        );

        if (updated) {
          setEquipmentTypes((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await equipmentTypeService.create(values);
        setEquipmentTypes((current) => [created, ...current]);
        notify.success(t("createdSuccessfully"));
      }

      handleCloseDialog();
    } catch {
      notify.error(t("somethingWentWrong"));
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (!selectedEquipmentType) {
        return;
      }

      await equipmentTypeService.delete(selectedEquipmentType.id);
      setEquipmentTypes((current) =>
        current.filter((item) => item.id !== selectedEquipmentType.id),
      );
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
              {/* <AppSearchInput
                value={search}
                onChange={setSearch}
                placeholder={t("searchEquipmentTypes")}
              /> */}
              <AppButton onClick={handleOpenCreate}>
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
