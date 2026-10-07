import { AppSelect } from "@/components/ui";
import { useGetProjectsQuery } from "@/features/settings/projects/services/projects.api";
import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

function ProjectField({ control }) {
  const { t } = useTranslation();

  const { data: projects } = useGetProjectsQuery();

  const projectOptions = useMemo(
    () =>
      projects?.data.map((item) => ({
        value: item.id,
        label: item.name,
      })) ?? [],
    [projects],
  );

  return (
    <Controller
      name="projectId"
      control={control}
      render={({ field, fieldState }) => (
        <AppSelect
          label={t("project")}
          required
          options={projectOptions}
          value={field.value}
          onChange={field.onChange}
          placeholder={t("selectProject")}
          error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
        />
      )}
    />
  );
}

export default ProjectField;
