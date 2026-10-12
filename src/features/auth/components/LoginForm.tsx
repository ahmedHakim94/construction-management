import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppInput, AppPasswordInput } from "@/components/ui";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/features/auth/store/authSlice";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../schemas/login.schema";
import { useLoginMutation } from "../services/authApi";
import { ROUTE_PATHS } from "@/app/router";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  // const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
        }),
      );

      navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Box className="login-form">
      {/* Header */}
      <Stack className="login-form__header">
        <Typography className="login-form__title">
          {t("loginFormTitle")}
        </Typography>

        <Typography className="login-form__subtitle">
          {t("loginFormSubtitle")}
        </Typography>
      </Stack>

      {/* Form */}
      <Box
        component="form"
        className="login-form__body"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={3}>
          {/* Username */}
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
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            )}
          />

          {/* Password */}
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
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}
          />

          {/* Forgot password - UI only for now */}
          <Box className="login-form__forgot-wrapper">
            <button
              type="button"
              className="login-form__forgot"
              onClick={() => undefined}
            >
              {t("forgotPassword")}
            </button>
          </Box>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            className="login-form__submit"
          >
            {isLoading ? t("loggingIn") : t("signIn")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
