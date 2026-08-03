import { Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { SearchOutlined, PersonAddAlt1Outlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard } from "@/components/ui";
import { ContractorsTable } from "../components/ContractorsTable";
import { ContractorDialog } from "../components/ContractorDialog";
import { DeleteContractorDialog } from "../components/DeleteContractorDialog";
import { contractorService } from "../services/contractor.service";
import type { Contractor, ContractorFormValues } from "../types";

export function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    const loadContractors = async () => {
      const data = await contractorService.getAll();
      setContractors(data);
    };

    void loadContractors();
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
    setDialogOpen(true);
  };

  const handleOpenEdit = (contractor: Contractor) => {
    setMode("edit");
    setSelectedContractor(contractor);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContractor(undefined);
  };

  const handleSubmit = async (values: ContractorFormValues) => {
    if (mode === "edit" && selectedContractor) {
      const updated = await contractorService.update(selectedContractor.id, values);
      if (updated) {
        setContractors((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
    } else {
      const created = await contractorService.create(values);
      setContractors((current) => [created, ...current]);
    }

    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (!selectedContractor) {
      return;
    }

    await contractorService.delete(selectedContractor.id);
    setContractors((current) => current.filter((item) => item.id !== selectedContractor.id));
    setDeleteDialogOpen(false);
    setSelectedContractor(undefined);
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Contractors
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Manage contractor records and status updates.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <TextField
              size="small"
              placeholder="Search code, name, phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <AppButton startIcon={<PersonAddAlt1Outlined />} onClick={handleOpenCreate}>
              Add Contractor
            </AppButton>
          </Stack>
        </Stack>

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <ContractorsTable
            rows={filteredContractors}
            onEdit={handleOpenEdit}
            onDelete={(contractor) => {
              setSelectedContractor(contractor);
              setDeleteDialogOpen(true);
            }}
          />
        </AppCard>
      </Box>

      <ContractorDialog
        open={dialogOpen}
        mode={mode}
        contractor={selectedContractor}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <DeleteContractorDialog
        open={deleteDialogOpen}
        contractorName={selectedContractor?.name}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedContractor(undefined);
        }}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
