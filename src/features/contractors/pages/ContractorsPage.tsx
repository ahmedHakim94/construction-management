import { Box } from "@mui/material";
import { PersonAddAlt1Outlined } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { ContractorsTable } from "../components/ContractorsTable";
import { ContractorDialog } from "../components/ContractorDialog";
import type { Contractor, ContractorFormValues } from "../types";
import { useDialog } from "@/hooks/useDialog";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { notify } from "@/shared/utils/notify";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import {
  useCreateContractorMutation,
  useDeleteContractorMutation,
  useGetContractorsQuery,
  useUpdateContractorMutation,
} from "../services/contractors.api";

const LIMIT = 10;

export function ContractorsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedContractor, setSelectedContractor] = useState<
    Contractor | undefined
  >();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialog = useDialog();
  const deleteDialog = useDialog();

  const { data, isLoading, isFetching } = useGetContractorsQuery({
    page,
    limit: LIMIT,
    search: search.trim() || undefined,
  });
  const [createContractor] = useCreateContractorMutation();
  const [updateContractor] = useUpdateContractorMutation();
  const [deleteContractor] = useDeleteContractorMutation();

  const contractors = data?.data ?? [];
  const paginationMeta = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
        await updateContractor({
          id: selectedContractor.id,
          data: values,
        }).unwrap();

        notify.success(t("updatedSuccessfully"));
      } else {
        await createContractor(values).unwrap();

        notify.success(t("createdSuccessfully"));
      }

      // handleCloseDialog();
    } catch (error) {
      console.error(error);
      notify.error(t("somethingWentWrong"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedContractor) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteContractor(selectedContractor.id).unwrap();

      notify.success(t("deletedSuccessfully"));
      if (contractors.length === 1 && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
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
                onChange={handleSearchChange}
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
            rows={contractors}
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
            <strong>{` ${selectedContractor?.name} ?`}</strong>
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
