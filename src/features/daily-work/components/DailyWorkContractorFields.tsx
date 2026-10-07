import { useEffect, useMemo, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppInput, AppSelect } from "@/components/ui";
import type { Equipment } from "@/features/equipment/types";
import type { useDailyWorkForm } from "../hooks/useDailyWorkForm";
import {
  useCreateExternalContractorMutation,
  useGetAllContractorsQuery,
  useGetContractorByIdQuery,
  useGetExternalContractorsQuery,
} from "@/features/contractors/services/contractors.api";

type DailyWorkForm = ReturnType<typeof useDailyWorkForm>;
interface DailyWorkContractorFieldsProps {
  open: boolean;
  // contractors: Contractor[];
  // equipment: Equipment[];
  control: DailyWorkForm["control"];
  setValue: DailyWorkForm["setValue"];
  clearErrors: DailyWorkForm["clearErrors"];
  contractorId: DailyWorkForm["contractorId"];
  isExternal: DailyWorkForm["isExternal"];
}
export function DailyWorkContractorFields({
  open,
  control,
  setValue,
  clearErrors,
  contractorId,
  isExternal,
}: DailyWorkContractorFieldsProps) {
  const { t } = useTranslation();
  // const [externalContractors, setExternalContractors] = useState<
  //   ExternalContractor[]
  // >([]);
  const [isAddingExternal, setIsAddingExternal] = useState(false);
  const [newExternalName, setNewExternalName] = useState("");
  const [newExternalPhone, setNewExternalPhone] = useState("");
  const [creatingExternal, setCreatingExternal] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { data: contractors } = useGetAllContractorsQuery();
  const { data: externalContractors } = useGetExternalContractorsQuery(
    undefined,
    { skip: !open || !isExternal },
  );
  const [addExternalContractor] = useCreateExternalContractorMutation();

  const { data: contractorData } = useGetContractorByIdQuery(
    Number(contractorId),
    {
      skip: !open || !contractorId || Boolean(isExternal),
    },
  );

  useEffect(() => {
    if (externalContractors) {
      setIsAddingExternal(false);
      setNewExternalName("");
      setNewExternalPhone("");
    }
  }, [externalContractors]);

  useEffect(() => {
    if (isAddingExternal) {
      clearErrors("externalContractorId");
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAddingExternal, clearErrors]);

  useEffect(() => {
    if (contractorData?.equipment) {
      setEquipments(contractorData?.equipment);
    }
  }, [contractorData?.equipment]);

  const equipmentOptions = useMemo(
    () =>
      equipments?.map((item) => ({
        value: item.id,
        label: `${item.equipmentTypeName}`,
      })),
    [equipments],
  );

  const contractorOptions = useMemo(
    () =>
      contractors?.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [contractors],
  );
  const externalContractorOptions = useMemo(
    () =>
      externalContractors?.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [externalContractors],
  );
  const handleCreateExternalContractor = async () => {
    const trimmedName = newExternalName.trim();
    const trimmedPhone = newExternalPhone.trim();
    if (!trimmedName) {
      return;
    }
    setCreatingExternal(true);
    try {
      const data = {
        name: trimmedName,
        phone: trimmedPhone,
      };
      const created = await addExternalContractor(data).unwrap();
      setValue("externalContractorId", created.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setNewExternalName("");
      setNewExternalPhone("");
      setIsAddingExternal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingExternal(false);
    }
  };
  return (
    <>
      {/* External contractor checkbox */}
      <Controller
        name="isExternal"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  field.onChange(checked);
                  if (checked) {
                    setValue("contractorId", "");
                    setValue("equipmentId", "");
                  } else {
                    setValue("externalContractorId", "");
                    setValue("temporaryEquipmentName", "");
                    setValue("hourRate", 0, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                color="primary"
              />
            }
            label={t("externalContractor")}
            sx={{ userSelect: "none" }}
          />
        )}
      />
      {/* Normal / External contractor */}
      {!isExternal ? (
        <>
          <Controller
            name="contractorId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("contractor")}
                required
                options={contractorOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("equipmentId", "");
                  setValue("hourRate", 0, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                placeholder={t("selectContractor")}
                error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              />
            )}
          />
          <Controller
            name="equipmentId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("equipment")}
                required
                options={equipmentOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  const selected = equipments?.find(
                    (item) => item.id === Number(value),
                  );
                  setValue("hourRate", selected?.hourlyPrice ?? 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                placeholder={t("selectEquipment")}
                error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              />
            )}
          />
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Controller
            name="externalContractorId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("externalContractor")}
                required
                options={externalContractorOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={t("selectExternalContractor")}
                error={isAddingExternal ? undefined : (fieldState.error?.message ? t(fieldState.error.message) : undefined)}
              />
            )}
          />
          {!isAddingExternal ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <AppButton
                size="small"
                variant="text"
                onClick={() => setIsAddingExternal(true)}
                sx={{ px: 0.5, fontWeight: 600 }}
              >
                + {t("addExternalContractor")}
              </AppButton>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                p: 2,
                mt: 0.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {t("addExternalContractor")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <AppInput
                  inputRef={nameInputRef}
                  autoFocus
                  label={t("externalContractorName")}
                  placeholder={t("externalContractorNamePlaceholder")}
                  value={newExternalName}
                  onChange={(event) => setNewExternalName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (newExternalName.trim() && !creatingExternal) {
                        handleCreateExternalContractor();
                      }
                    } else if (event.key === "Escape") {
                      setIsAddingExternal(false);
                      setNewExternalName("");
                      setNewExternalPhone("");
                    }
                  }}
                  size="small"
                  fullWidth
                />
                <AppInput
                  label={t("phone")}
                  placeholder={t("phonePlaceholder")}
                  value={newExternalPhone}
                  onChange={(event) => setNewExternalPhone(event.target.value)}
                  size="small"
                  fullWidth
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <AppButton
                  size="small"
                  variant="contained"
                  loading={creatingExternal}
                  onClick={handleCreateExternalContractor}
                  disabled={!newExternalName.trim()}
                >
                  {t("add")}
                </AppButton>
                <AppButton
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setIsAddingExternal(false);
                    setNewExternalName("");
                    setNewExternalPhone("");
                  }}
                >
                  {t("cancel")}
                </AppButton>
              </Box>
            </Box>
          )}
          <Controller
            name="temporaryEquipmentName"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("temporaryEquipmentName")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              />
            )}
          />
        </Box>
      )}
    </>
  );
}
