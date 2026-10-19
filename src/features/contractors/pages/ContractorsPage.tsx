import { useState } from "react";
import { Box } from "@mui/material";
import { PersonAddAlt1Outlined, LinkOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppSearchInput } from "@/components/ui/AppSearchInput";

import { useDialog } from "@/hooks/useDialog";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

import { ContractorsTable } from "../components/ContractorsTable";
import { ContractorDialog } from "../components/ContractorDialog";
import { LinkContractorDialog } from "../components/LinkContractorDialog";
import UnlinkContractorDialog from "../components/UnlinkContractorDialog";

import type { Contractor, ContractorFormValues } from "../types";

import {
  useChangeContractorStatusMutation,
  useCreateContractorMutation,
  useGetContractorsQuery,
  useUpdateContractorMutation,
} from "../services/contractors.api";
import { useAppSelector } from "@/app/store/hooks";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";

const LIMIT = 10;

export function ContractorsPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedContractor, setSelectedContractor] = useState<
    Contractor | undefined
  >();

  const [mode, setMode] = useState<"create" | "edit">("create");

  const dialog = useDialog();
  const unlinkDialog = useDialog();
  const linkDialog = useDialog();

  const { data, isLoading, isFetching } = useGetContractorsQuery({
    page,
    limit: LIMIT,
    search: search.trim() || undefined,
  });

  const [createContractor] = useCreateContractorMutation();
  const [updateContractor] = useUpdateContractorMutation();

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

  const role = useAppSelector((state) => state.auth.user?.role);
  const isSuperAdmin = role === "super_admin";

  const statusDialog = useDialog();

  const [statusContractor, setStatusContractor] = useState<
    Contractor | undefined
  >();

  const [changeContractorStatus, { isLoading: statusLoading }] =
    useChangeContractorStatusMutation();

  const handleOpenStatusDialog = (contractor: Contractor) => {
    setStatusContractor(contractor);
    statusDialog.openDialog();
  };

  const handleCloseStatusDialog = () => {
    statusDialog.closeDialog();
    setStatusContractor(undefined);
  };

  const handleChangeStatus = async () => {
    if (!isSuperAdmin || !statusContractor) return;

    const newStatus =
      statusContractor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await changeContractorStatus({
        id: statusContractor.id,
        status: newStatus,
      }).unwrap();

      handleCloseStatusDialog();
    } catch (error) {
      console.error("Failed to change contractor status:", error);
    }
  };

  const handleSubmit = async (values: ContractorFormValues) => {
    try {
      if (mode === "edit" && selectedContractor) {
        await updateContractor({
          id: selectedContractor.id,
          data: values,
        }).unwrap();
      } else {
        await createContractor(values).unwrap();
      }

      // handleCloseDialog();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleOpenUnlink = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    unlinkDialog.openDialog();
  };

  const handleCloseUnlink = () => {
    unlinkDialog.closeDialog();
    setSelectedContractor(undefined);
  };

  const handleUnlinkSuccess = () => {
    // Only go back when the current page becomes empty.
    // Super Admin may still see the unlinked contractor,
    // so use the refreshed pagination total when available.
    const total = paginationMeta?.total;

    if (page > 1 && total !== undefined && total - 1 <= (page - 1) * LIMIT) {
      setPage(page - 1);
    }
  };

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
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

              {hasPermission("contractors.create") && (
                <AppButton
                  startIcon={<PersonAddAlt1Outlined />}
                  onClick={handleOpenCreate}
                  variant="contained"
                >
                  {t("addContractor")}
                </AppButton>
              )}

              {hasPermission("contractors.create") && (
                <AppButton
                  startIcon={<LinkOutlined />}
                  onClick={linkDialog.openDialog}
                  variant="outlined"
                >
                  {t("linkExistingContractor")}
                </AppButton>
              )}
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
            onDelete={handleOpenUnlink}
            isSuperAdmin={isSuperAdmin}
            onChangeStatus={handleOpenStatusDialog}
          />
        </AppCard>
      </Box>

      <AppConfirmDialog
        open={statusDialog.open}
        title={t(
          statusContractor?.status === "ACTIVE"
            ? "deactivateContractor"
            : "activateContractor",
        )}
        message={
          <>
            {t(
              statusContractor?.status === "ACTIVE"
                ? "confirmDeactivateContractor"
                : "confirmActivateContractor",
            )}
            <strong>{` ${statusContractor?.name}؟`}</strong>
          </>
        }
        confirmText={t("confirm")}
        onClose={handleCloseStatusDialog}
        onConfirm={handleChangeStatus}
        loading={statusLoading}
      />

      <ContractorDialog
        open={dialog.open}
        mode={mode}
        contractor={selectedContractor}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <LinkContractorDialog
        open={linkDialog.open}
        onClose={linkDialog.closeDialog}
      />

      <UnlinkContractorDialog
        open={unlinkDialog.open}
        contractor={selectedContractor}
        onClose={handleCloseUnlink}
        onSuccess={handleUnlinkSuccess}
      />
    </PageContainer>
  );
}
