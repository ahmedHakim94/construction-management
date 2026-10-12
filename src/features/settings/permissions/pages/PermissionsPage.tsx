import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { SaveOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader } from "@/components/ui";
import {
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from "../services/rolePermissionsApi";

type Action = "view" | "create" | "edit" | "delete" | "export";
type Section = { key: string; actions: Action[] };

const SECTIONS: Section[] = [
  { key: "dashboard", actions: ["view"] },
  { key: "contractors", actions: ["view", "create", "edit", "delete"] },
  { key: "equipment", actions: ["view", "create", "edit", "delete"] },
  { key: "equipmentTypes", actions: ["view", "create", "edit", "delete"] },
  { key: "projects", actions: ["view", "create", "edit", "delete"] },
  { key: "tasks", actions: ["view", "create", "edit", "delete"] },
  { key: "dailyWork", actions: ["view", "create", "edit", "delete"] },
  { key: "payments", actions: ["view", "create", "edit", "delete"] },
  { key: "reports", actions: ["view", "export"] },
  { key: "permissions", actions: ["view"] },
];

const ALL_CODES = new Set(
  SECTIONS.flatMap(({ key, actions }) =>
    actions.map((action) => `${key}.${action}`),
  ),
);

export function PermissionsPage() {
  const { t } = useTranslation("settings");

  const { data, isLoading, isError, refetch } = useGetRolePermissionsQuery();

  const [updateRolePermissions, { isLoading: isSaving }] =
    useUpdateRolePermissionsMutation();

  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  const savedPermissions = useMemo(
    () => data?.permissions ?? [],
    [data?.permissions],
  );

  useEffect(() => {
    setSelected(savedPermissions);
  }, [savedPermissions]);

  const dirty = useMemo(
    () =>
      selected.length !== savedPermissions.length ||
      selected.some((code) => !savedPermissions.includes(code)),
    [selected, savedPermissions],
  );

  const toggle = (code: string, checked: boolean) => {
    setSelected((previous) =>
      checked
        ? [...previous.filter((item) => item !== code), code]
        : previous.filter((item) => item !== code),
    );
    setMessage(null);
  };

  const save = async () => {
    try {
      await updateRolePermissions({
        permissions: selected,
      }).unwrap();

      setMessage("saved");
      refetch();
    } catch {
      setMessage("error");
    }
  };

  const discard = () => {
    setSelected([...savedPermissions]);
    setMessage(null);
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <AppPageHeader
          title={t("permissions.title")}
          description={t("permissions.description")}
        />

        <Alert severity="info">{t("permissions.roleInfo")}</Alert>

        {message && (
          <Alert severity={message === "saved" ? "success" : "error"}>
            {t(`permissions.${message}`)}
          </Alert>
        )}

        <AppCard sx={{ p: { xs: 2, md: 3 } }}>
          {isLoading ? (
            <Stack alignItems="center" py={5}>
              <CircularProgress />
            </Stack>
          ) : isError ? (
            <Alert severity="error">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography>{t("permissions.error")}</Typography>
                <Button onClick={() => refetch()}>Retry</Button>
              </Stack>
            </Alert>
          ) : (
            <Stack spacing={2.5}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="h6" fontWeight={700}>
                  {t("permissions.userRole")}
                </Typography>

                <Chip
                  label={`${selected.filter((code) => ALL_CODES.has(code)).length} / ${ALL_CODES.size}`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              {SECTIONS.map((section, index) => (
                <Box key={section.key}>
                  {index > 0 && <Divider sx={{ mb: 2.5 }} />}

                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    {t(`permissions.modules.${section.key}`)}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    {section.actions.map((action) => {
                      const code = `${section.key}.${action}`;

                      return (
                        <FormControlLabel
                          key={code}
                          control={
                            <Checkbox
                              checked={selected.includes(code)}
                              disabled={isSaving}
                              onChange={(event) =>
                                toggle(code, event.target.checked)
                              }
                            />
                          }
                          label={t(`permissions.actions.${action}`)}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}

              <Divider />

              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button
                  variant="outlined"
                  disabled={!dirty || isSaving}
                  onClick={discard}
                >
                  {t("permissions.discard")}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SaveOutlined />}
                  disabled={!dirty || isSaving}
                  onClick={save}
                >
                  {t("permissions.save")}
                </Button>
              </Stack>
            </Stack>
          )}
        </AppCard>
      </Stack>
    </PageContainer>
  );
}
