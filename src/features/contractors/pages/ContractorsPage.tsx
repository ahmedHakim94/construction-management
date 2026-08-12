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
      if (mode === "edit" && selectedContractor) {
        const updated = await contractorService.update(
          selectedContractor.id,
          values,
        );

        if (updated) {
          setContractors((current) =>
            current.map((item) =>
              item.id === updated.id ? updated : item,
            ),
          );

          notify.success(t("updatedSuccessfully"));
        }
      } else {
        const created = await contractorService.create(values);

        setContractors((current) => [created, ...current]);

        notify.success(t("createdSuccessfully"));
      }

      handleCloseDialog();
    } catch {
      notify.error(t("somethingWentWrong"));
    }

  };

  const handleDelete = async () => {
    setDeleteLoading(true)

    setTimeout(async () => {
      try {
        if (!selectedContractor) {
          return;
        }

        await contractorService.delete(selectedContractor.id);
        setContractors((current) =>
          current.filter((item) => item.id !== selectedContractor.id),
        );
        notify.success(t("deletedSuccessfully"));
        deleteDialog.closeDialog();
        setSelectedContractor(undefined);
        setDeleteLoading(false);

      } catch {
        notify.error(t("somethingWentWrong"));
        setDeleteLoading(false);

      }
    }, 1500);


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
