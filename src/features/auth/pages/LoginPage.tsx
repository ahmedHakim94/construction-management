import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppButton, AppCard, AppInput, AppPasswordInput, AppSelect } from "@/components/ui";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/features/auth/store/authSlice";
import { login } from "@/features/auth/services/auth.service";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../schemas/login.schema";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const roleOptions = useMemo(() => [
    { value: "admin", label: t("admin") },
    { value: "manager", label: t("manager") },
    { value: "viewer", label: t("viewer") },
  ], [t]);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (_data: LoginFormData) => {
    const response = await login();
    dispatch(
      setCredentials({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      }),
    );
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        px: 2,
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: "100%", maxWidth: 430 }}
      >
        <AppCard
          sx={{
            borderRadius: 4,
            p: 4,
          }}
        >
          <Stack spacing={3}>
            {/* Logo */}
            <Stack sx={{ alignItems: "center" }} spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "#EAF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                CM
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                }}>
                  {t("loginTitle")}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {t("loginSubtitle")}
                </Typography>
              </Box>
            </Stack>

            {/* Form Fields */}
            <Stack spacing={2}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    label={t("email")}
                    placeholder={t("emailPlaceholder")}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <AppPasswordInput
                    {...field}
                    label={t("password")}
                    placeholder={t("passwordPlaceholder")}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="role"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    {...field}
                    options={roleOptions}
                    placeholder={t("selectRole")}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Stack>

            {/* Remember Me */}
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  label={t("rememberMe")}
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                />
              )}
            />

            {/* Submit */}
            <AppButton type="submit" variant="contained" fullWidth>
              {t("signIn")}
            </AppButton>
          </Stack>
        </AppCard>
      </form>
    </Box>
  );
}