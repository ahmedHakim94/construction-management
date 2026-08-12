import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { notify } from "@/shared/utils/notify";
import { useDialog } from "@/hooks/useDialog";
import { EquipmentTable } from "../components/EquipmentTable";
import { EquipmentDialog } from "../components/EquipmentDialog";
import { equipmentService } from "../services/equipment.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import type { Contractor } from "@/features/contractors/types";
import { equipmentTypeService } from "@/features/settings/equipment-type/services/equipmentType.service";
import type { EquipmentType } from "@/features/settings/equipment-type/types";
import type { Equipment, EquipmentFormValues } from "../types";

export function EquipmentPage() {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    async function loadData() {
      const [equipmentData, contractorData, equipmentTypeData] = await Promise.all([
        equipmentService.getAll(),
        contractorService.getAll(),
        equipmentTypeService.getAll(),
      ]);

      setEquipment(equipmentData);
      setContractors(contractorData);
      setEquipmentTypes(equipmentTypeData);
    }

    loadData();
  }, []);
  

  const displayRows = useMemo(() => {
    return equipment.map((item) => ({
      ...item,
      contractorName:
        contractors.find((contractor) => contractor.id === item.contractorId)?.name ?? "",
      equipmentTypeName:
          equipmentTypes.find((type) => type.id === item.equipmentTypeId)?.name ?? "",
    }));
  }, [equipment, contractors, equipmentTypes]);

  const filteredEquipment = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return displayRows;
    }

    return displayRows.filter((item) => {
      const values = [
        item.contractorName,
        item.equipmentTypeName,
        item.model ?? "",
        item.plateNumber ?? "",
        item.equipmentNumber ?? "",
        String(item.hourRate),
        item.notes ?? "",
      ];
      return values.some((value) => value.toLowerCase().includes(term));
    });
  }, [displayRows, search]);

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
        const updated = await equipmentService.update(selectedEquipment.id, values);

        if (updated) {
          setEquipment((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await equipmentService.create(values);
        setEquipment((current) => [created, ...current]);
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
      if (!selectedEquipment) {
        return;
      }

      await equipmentService.delete(selectedEquipment.id);
      setEquipment((current) =>
        current.filter((item) => item.id !== selectedEquipment.id),
      );
      notify.success(t("deletedSuccessfully"));
      deleteDialog.closeDialog();
      setSelectedEquipment(undefined);
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
          title={t("equipment")}
          description={t("equipmentDescription")}
          actions={
            <>
              <AppSearchInput
                value={search}
                onChange={setSearch}
                placeholder={t("searchEquipment")}
              />
              <AppButton onClick={handleOpenCreate}>{t("addEquipment")}</AppButton>
            </>
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <EquipmentTable
            rows={filteredEquipment}
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
            <strong>{` ${selectedEquipment?.model ?? selectedEquipment?.equipmentNumber ?? ""} ?`}</strong>
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
