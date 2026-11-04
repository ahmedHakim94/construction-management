
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { SaveOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader } from "@/components/ui";
import {
  useGetUsersQuery,
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
  { key: "tasks", actions: ["view", "create", "edit", "delete"] },
  { key: "dailyWork", actions: ["view", "create", "edit", "delete"] },
  { key: "payments", actions: ["view", "create", "edit", "delete"] },
  { key: "reports", actions: ["view", "export"] },
  { key: "employees", actions: ["view", "create", "edit", "delete"] },
  { key: "attendance", actions: ["view", "create", "edit", "delete"] },
  { key: "leaves", actions: ["view", "create", "edit", "delete"] },
  { key: "deductions", actions: ["view", "create", "edit", "delete"] },
  { key: "payroll", actions: ["view", "create", "edit", "delete"] },
];

const ALL_CODES = new Set(
  SECTIONS.flatMap(({ key, actions }) =>
    actions.map((action) => `${key}.${action}`),
  ),
);

export function PermissionsPage() {
  const { t } = useTranslation("settings");

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetUsersQuery();

  const {
    currentData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetRolePermissionsQuery(selectedUserId as number, {
    skip: selectedUserId === null,
  });

  const [updateRolePermissions, { isLoading: isSaving }] =
    useUpdateRolePermissionsMutation();

  const users = usersData?.users ?? [];

  const savedPermissions = useMemo(
    () =>
      (currentData?.permissions ?? []).filter((code) =>
        ALL_CODES.has(code),
      ),
    [currentData],
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

  const isBusy = isLoading || isFetching || isSaving;
  const canEdit = selectedUserId !== null && !isBusy && !isError;

  const toggle = (code: string, checked: boolean) => {
    setSelected((previous) =>
      checked
        ? [...previous.filter((item) => item !== code), code]
        : previous.filter((item) => item !== code),
    );
    setMessage(null);
  };

  const save = async () => {
    if (!canEdit || !dirty || selectedUserId === null) return;

    try {
      await updateRolePermissions({
        userId: selectedUserId,
        permissions: selected,
      }).unwrap();

      setMessage("saved");
      await refetch();
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

        {message && (
          <Alert severity={message === "saved" ? "success" : "error"}>
            {t(`permissions.${message}`)}
          </Alert>
        )}

        <AppCard sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            {isUsersLoading ? (
              <CircularProgress size={24} />
            ) : isUsersError ? (
              <Alert severity="error">
                Unable to load users.
              </Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="permissions-user-label">
                  Select User
                </InputLabel>

                <Select
                  labelId="permissions-user-label"
                  value={selectedUserId ?? ""}
                  label="Select User"
                  disabled={isSaving}
                  onChange={(event) => {
                    setSelectedUserId(Number(event.target.value));
                    setSelected([]);
                    setMessage(null);
                  }}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {!isUsersLoading && !isUsersError && users.length === 0 && (
              <Alert severity="info">
                No users available.
              </Alert>
            )}

            {selectedUserId !== null && (
              <>
                {isLoading || isFetching ? (
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
                      <Typography>
                        {t("permissions.error")}
                      </Typography>
                      <Button onClick={() => refetch()}>
                        Retry
                      </Button>
                    </Stack>
                  </Alert>
                ) : (
                  <>
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
                        label={`${selected.length} / ${ALL_CODES.size}`}
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
                                    disabled={!canEdit}
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

                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      gap={1}
                    >
                      <Button
                        variant="outlined"
                        disabled={!dirty || !canEdit}
                        onClick={discard}
                      >
                        {t("permissions.discard")}
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<SaveOutlined />}
                        disabled={!dirty || !canEdit}
                        onClick={save}
                      >
                        {t("permissions.save")}
                      </Button>
                    </Stack>
                  </>
                )}
              </>
            )}
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}
