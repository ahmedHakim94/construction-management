import { useMemo, useState } from "react";
import { Alert, Box, Button, Checkbox, Chip, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import { SaveOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader } from "@/components/ui";

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
  { key: "payments", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "reports", actions: ["view", "export"] },
];

const STORAGE_KEY = "cm-user-role-permissions-demo";
const ALL_CODES = new Set(SECTIONS.flatMap(({ key, actions }) => actions.map((action) => `${key}.${action}`)));

function loadPermissions(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as unknown;
    return Array.isArray(value) ? value.filter((code): code is string => typeof code === "string" && ALL_CODES.has(code)) : [];
  } catch {
    return [];
  }
}

export function PermissionsPage() {
  const { t } = useTranslation("settings");
  const [savedPermissions, setSavedPermissions] = useState<string[]>(loadPermissions);
  const [selected, setSelected] = useState<string[]>(savedPermissions);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  const dirty = useMemo(() =>
    selected.length !== savedPermissions.length || selected.some((code) => !savedPermissions.includes(code)),
    [selected, savedPermissions],
  );

  const toggle = (code: string, checked: boolean) => {
    setSelected((previous) => checked ? [...previous.filter((item) => item !== code), code] : previous.filter((item) => item !== code));
    setMessage(null);
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
      setSavedPermissions([...selected]);
      setMessage("saved");
    } catch {
      setMessage("error");
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <AppPageHeader title={t("permissions.title")} description={t("permissions.description")} />
        <Alert severity="info">{t("permissions.roleInfo")}</Alert>
        {message && <Alert severity={message === "saved" ? "success" : "error"}>{t(`permissions.${message}`)}</Alert>}
        <AppCard sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Typography variant="h6" fontWeight={700}>{t("permissions.userRole")}</Typography>
              <Chip label={`${selected.length} / ${ALL_CODES.size}`} color="primary" variant="outlined" />
            </Stack>
            {SECTIONS.map((section, index) => (
              <Box key={section.key}>
                {index > 0 && <Divider sx={{ mb: 2.5 }} />}
                <Typography fontWeight={700} sx={{ mb: 1 }}>{t(`permissions.modules.${section.key}`)}</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" }, gap: 1 }}>
                  {section.actions.map((action) => {
                    const code = `${section.key}.${action}`;
                    return <FormControlLabel key={code} control={<Checkbox checked={selected.includes(code)} onChange={(event) => toggle(code, event.target.checked)} />} label={t(`permissions.actions.${action}`)} />;
                  })}
                </Box>
              </Box>
            ))}
            <Divider />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button variant="outlined" disabled={!dirty} onClick={() => { setSelected([...savedPermissions]); setMessage(null); }}>{t("permissions.discard")}</Button>
              <Button variant="contained" startIcon={<SaveOutlined />} disabled={!dirty} onClick={save}>{t("permissions.save")}</Button>
            </Stack>
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}
