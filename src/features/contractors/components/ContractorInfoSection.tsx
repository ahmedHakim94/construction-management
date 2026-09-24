import { Box, Typography, InputAdornment } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  PersonOutline as PersonIcon,
  LocalPhoneOutlined as PhoneIcon,
  AssignmentOutlined as NoteIcon,
} from "@mui/icons-material";
import { AppInput, AppSelect, AppTextarea } from "@/components/ui";
import type { ContractorFormValues } from "../types";

export function ContractorInfoSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { control } = useFormContext<ContractorFormValues>();

  const statusOptions = [
    {
      value: "ACTIVE",
      label: t("active"),
    },
    {
      value: "INACTIVE",
      label: t("inactive"),
    },
  ];

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 3,
        bgcolor: "background.paper",
      }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: "primary.main",
          fontWeight: 600,
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          mb: 2.5,
        }}
      >
        <NoteIcon />
        {t("contractorInfo")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Box>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("name")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("phone")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box sx={{ position: "relative" }}>
          <Typography
            component="label"
            sx={{
              position: "absolute",
              top: "-9px",
              left: isArabic ? "auto" : "12px",
              right: isArabic ? "12px" : "auto",
              bgcolor: "background.paper",
              px: 0.8,
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "text.secondary",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            {isArabic ? `* ${t("status")}` : `${t("status")} *`}
          </Typography>

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label=""
                required
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="react_select_status"
              />
            )}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <AppTextarea label={t("notes")} {...field} />
          )}
        />
      </Box>
    </Box>
  );
}
