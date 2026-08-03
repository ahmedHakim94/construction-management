import { Box, DialogActions, DialogContent, DialogTitle, MenuItem } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDialog, AppInput, AppTextarea } from "@/components/ui";
import { contractorSchema } from "../schemas/contractor.schema";
import type { Contractor, ContractorFormValues } from "../types";

interface ContractorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => void;
}

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

export function ContractorDialog({ open, mode, contractor, onClose, onSubmit }: ContractorDialogProps) {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: contractor?.name ?? "",
      phone: contractor?.phone ?? "",
      address: contractor?.address ?? "",
      nationalId: contractor?.nationalId ?? "",
      notes: contractor?.notes ?? "",
      status: contractor?.status ?? "ACTIVE",
    },
  });

  const submit = (values: ContractorFormValues) => {
    onSubmit(values);
    reset();
    onClose();
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === "create" ? "Add Contractor" : "Edit Contractor"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(submit)} sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput label="Name" required {...field} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput label="Phone" required {...field} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => <AppInput label="Address" {...field} />}
          />
          <Controller
            name="nationalId"
            control={control}
            render={({ field }) => <AppInput label="National ID" {...field} />}
          />
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <AppTextarea label="Notes" {...field} />}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <AppInput select label="Status" {...field}>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </AppInput>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit(submit)}>{mode === "create" ? "Create" : "Save"}</AppButton>
      </DialogActions>
    </AppDialog>
  );
}
