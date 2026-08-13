import {
  Box
} from "@mui/material";
import { PersonAddAlt1Outlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { ContractorsTable } from "../components/ContractorsTable";
import { ContractorDialog } from "../components/ContractorDialog";
import { contractorService } from "../services/contractor.service";
import type { Contractor, ContractorFormValues } from "../types";
import { useDialog } from "@/hooks/useDialog";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { notify } from "@/shared/utils/notify";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { equipmentService } from "@/features/equipment/services/equipment.service";

export function ContractorsPage() {
  const { t } = useTranslation();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedContractor, setSelectedContractor] = useState<
    Contractor | undefined
  >();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false)

  const dialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    async function loadData() {
      const data = await contractorService.getAll();
      setContractors(data);
    }

    loadData();
  }, []);

  const filteredContractors = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return contractors;
    }

    return contractors.filter((contractor) => {
      const values = [contractor.code, contractor.name, contractor.phone];
      return values.some((value) => value.toLowerCase().includes(term));
    });
  }, [contractors, search]);

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedContractor(undefined);
    dialog.openDialog();
  };

  const handleOpenEdit = (contractor: Contractor) => {
    setMode("edit");
    setSelectedContractor(contractor);
    dialog.openDialog();
  };

  const handleCloseDialog = () => {
    dialog.closeDialog();
    setSelectedContractor(undefined);
  };

  const handleSubmit = async (values: ContractorFormValues) => {
    try {
      const contractorData = {
        name: values.name,
        phone: values.phone,
        address: values.address || "",
        nationalId: values.nationalId,
        notes: values.notes,
        status: values.status,
      };

      if (mode === "edit" && selectedContractor) {
        const updated = await contractorService.update(
          selectedContractor.id,
          contractorData,
        );

        if (updated) {
          // Get existing equipment for this contractor
          const allEquipment = await equipmentService.getAll();
          const existingEq = allEquipment.filter(
            (item) => item.contractorId === selectedContractor.id,
          );

          // 1. Delete equipment that are no longer in values.equipment
          const incomingEqIds = new Set(
            (values.equipment || []).map((e) => e.id).filter(Boolean),
          );
          for (const eq of existingEq) {
            if (!incomingEqIds.has(eq.id)) {
              await equipmentService.delete(eq.id);
            }
          }

          // 2. Create or Update incoming equipment list
          for (const eq of values.equipment || []) {
            const eqFormValues = {
              contractorId: selectedContractor.id,
              equipmentTypeId: eq.equipmentTypeId,
              model: eq.model ?? "",
              plateNumber: eq.plateNumber ?? "",
              hourRate: eq.hourRate,
              notes: eq.notes ?? "",
            };

            if (eq.id) {
              await equipmentService.update(eq.id, eqFormValues);
            } else {
              await equipmentService.create(eqFormValues);
            }
          }

          setContractors((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await contractorService.create(contractorData);

        // Create equipment linked to this new contractor
        for (const eq of values.equipment || []) {
          const eqFormValues = {
            contractorId: created.id,
            equipmentTypeId: eq.equipmentTypeId,
            model: eq.model ?? "",
            plateNumber: eq.plateNumber ?? "",
            hourRate: eq.hourRate,
            notes: eq.notes ?? "",
          };
          await equipmentService.create(eqFormValues);
        }

        setContractors((current) => [created, ...current]);
        notify.success(t("createdSuccessfully"));
      }

      handleCloseDialog();
    } catch (error) {
      console.error(error);
      notify.error(t("somethingWentWrong"));
    }
  };

  const handleDelete = async () => {
    if (!selectedContractor) {
      return;
    }
    setDeleteLoading(true);
    try {
      // 1. Delete associated equipment first
      const allEquipment = await equipmentService.getAll();
      const contractorEq = allEquipment.filter(
        (item) => item.contractorId === selectedContractor.id,
      );
      for (const eq of contractorEq) {
        await equipmentService.delete(eq.id);
      }

      // 2. Delete contractor only after equipment deletion succeeds
      await contractorService.delete(selectedContractor.id);

      setContractors((current) =>
        current.filter((item) => item.id !== selectedContractor.id),
      );
      notify.success(t("deletedSuccessfully"));
      deleteDialog.closeDialog();
      setSelectedContractor(undefined);
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
          title={t("contractors")}
          description={t("contractorsDescription")}
          actions={
            <>
              <AppSearchInput
                value={search}
                onChange={setSearch}
                placeholder={t("searchContractors")}
              />
              <AppButton
                startIcon={<PersonAddAlt1Outlined />}
                onClick={handleOpenCreate}
                variant="contained"
              >
                {t("addContractor")}
              </AppButton>
            </>
          }
        />
        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <ContractorsTable
            rows={filteredContractors}
            onEdit={handleOpenEdit}
            onDelete={(contractor) => {
              setSelectedContractor(contractor);
              deleteDialog.openDialog();
            }}
          />
        </AppCard>
      </Box>

      <ContractorDialog
        open={dialog.open}
        mode={mode}
        contractor={selectedContractor}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <AppConfirmDialog
        open={deleteDialog.open}
        title={t("deleteContractor")}
        message={
          <>
            {t("deleteContractor")}
            <strong>{selectedContractor?.name} ？</strong> 
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
